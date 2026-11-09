import { z } from 'zod';

export interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  CONTACT_TO_EMAIL?: string;
  /** Verified sender, e.g. "SK LABS <noreply@sklabs.nl>" */
  CONTACT_FROM_EMAIL?: string;
  /** Optional KV namespace for durable rate limiting. Falls back to per-isolate memory. */
  RATE_LIMIT?: KVNamespace;
}

const clean = (max: number) =>
  z
    .string()
    // eslint-disable-next-line no-control-regex -- intentionally strips control characters
    .transform((v) => v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim())
    .pipe(z.string().max(max));

export const contactSchema = z.object({
  name: clean(100).pipe(z.string().min(1)),
  company: clean(120).optional().default(''),
  email: clean(200).pipe(z.email()),
  interest: clean(80).optional().default(''),
  budget: clean(60).optional().default(''),
  message: clean(4000).pipe(z.string().min(10)),
  lang: z.enum(['en', 'nl']).catch('en'),
  website: z.string().optional().default(''), // honeypot
  'cf-turnstile-response': z.string().optional().default(''),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Escapes text for safe inclusion in HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Removes line breaks so user input can never inject email headers. */
export const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

export function buildEmail(input: ContactInput) {
  const rows: [string, string][] = [
    ['Name', input.name],
    ['Company', input.company || '-'],
    ['Email', input.email],
    ['Service', input.interest || '-'],
    ['Budget', input.budget || '-'],
    ['Language', input.lang],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${input.message}`;
  const html = `<table>${rows
    .map(([k, v]) => `<tr><th align="left">${k}</th><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;
  return { subject: oneLine(`[SK LABS] Contact from ${input.name}`).slice(0, 150), text, html };
}

export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export async function sendEmail(
  env: Required<Pick<Env, 'RESEND_API_KEY' | 'CONTACT_TO_EMAIL'>> & Pick<Env, 'CONTACT_FROM_EMAIL'>,
  input: ContactInput,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const { subject, text, html } = buildEmail(input);
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL ?? 'SK LABS <noreply@sklabs.nl>',
      to: [env.CONTACT_TO_EMAIL],
      reply_to: input.email,
      subject,
      text,
      html,
    }),
  });
  return res.ok;
}

// --- Rate limiting: 5 submissions per IP per 10 minutes ---
const WINDOW_SECONDS = 600;
const MAX_HITS = 5;
const memory = new Map<string, { count: number; reset: number }>();

export async function isRateLimited(
  ip: string,
  kv?: KVNamespace,
  now = Date.now(),
): Promise<boolean> {
  const key = `contact:${ip}`;
  if (kv) {
    const current = Number((await kv.get(key)) ?? 0);
    if (current >= MAX_HITS) return true;
    await kv.put(key, String(current + 1), { expirationTtl: WINDOW_SECONDS });
    return false;
  }
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + WINDOW_SECONDS * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

/** Same-origin check for browser submissions. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // non-browser clients are still gated by Turnstile
  return origin === new URL(request.url).origin;
}
