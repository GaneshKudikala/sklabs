import { describe, expect, it, vi } from 'vitest';
import {
  buildEmail,
  contactSchema,
  escapeHtml,
  isRateLimited,
  sendEmail,
  verifyTurnstile,
} from '../../functions/_lib/contact';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'We would like help with a landing zone.',
  lang: 'en',
};

describe('contactSchema', () => {
  it('accepts valid input and fills defaults', () => {
    const r = contactSchema.parse(valid);
    expect(r.company).toBe('');
    expect(r.website).toBe('');
  });
  it('rejects bad email, short message and missing name', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false);
  });
  it('rejects over-long fields', () => {
    expect(contactSchema.safeParse({ ...valid, name: 'x'.repeat(101) }).success).toBe(false);
  });
  it('falls back to en for unknown language', () => {
    expect(contactSchema.parse({ ...valid, lang: 'de' }).lang).toBe('en');
  });
});

describe('email building', () => {
  it('escapes HTML and keeps header-injection out of the subject', () => {
    const input = contactSchema.parse({
      ...valid,
      name: 'Eve\r\nBcc: x@evil.com',
      message: '<script>alert(1)</script> hello',
    });
    const mail = buildEmail(input);
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
  });
  it('escapeHtml handles quotes and ampersands', () => {
    expect(escapeHtml(`a&b "c" 'd'`)).toBe('a&amp;b &quot;c&quot; &#39;d&#39;');
  });
});

describe('verifyTurnstile', () => {
  it('fails closed without a token and on failure', async () => {
    const fetchOk = vi.fn(async () => Response.json({ success: false }));
    expect(await verifyTurnstile('s', '', null, fetchOk as never)).toBe(false);
    expect(await verifyTurnstile('s', 't', null, fetchOk as never)).toBe(false);
  });
  it('passes when Cloudflare says success', async () => {
    const f = vi.fn(async () => Response.json({ success: true }));
    expect(await verifyTurnstile('s', 't', '1.1.1.1', f as never)).toBe(true);
  });
});

describe('sendEmail', () => {
  it('posts to Resend with reply-to set to the visitor', async () => {
    const f = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      expect(body.reply_to).toBe('ada@example.com');
      expect(body.to).toEqual(['hello@sklabs.nl']);
      return new Response('{}', { status: 200 });
    });
    const ok = await sendEmail(
      { RESEND_API_KEY: 'k', CONTACT_TO_EMAIL: 'hello@sklabs.nl' },
      contactSchema.parse(valid),
      f as never,
    );
    expect(ok).toBe(true);
  });
});

describe('isRateLimited', () => {
  it('blocks the 6th request in a window and resets after it', async () => {
    const ip = `test-${Math.random()}`;
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(await isRateLimited(ip, undefined, t0)).toBe(false);
    expect(await isRateLimited(ip, undefined, t0)).toBe(true);
    expect(await isRateLimited(ip, undefined, t0 + 601_000)).toBe(false);
  });
});
