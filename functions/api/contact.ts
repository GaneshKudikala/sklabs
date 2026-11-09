import {
  contactSchema,
  isRateLimited,
  isSameOrigin,
  sendEmail,
  verifyTurnstile,
  type Env,
} from '../_lib/contact';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Browsers without JS get a redirect back to the form; fetch clients get JSON. */
function respond(request: Request, lang: string, ok: boolean, status: number, error?: string) {
  if ((request.headers.get('Accept') ?? '').includes('application/json')) {
    return ok ? json({ ok: true }) : json({ ok: false, error }, status);
  }
  const safeLang = lang === 'nl' ? 'nl' : 'en';
  return Response.redirect(
    new URL(`/${safeLang}/contact/?status=${ok ? 'sent' : 'error'}`, request.url).href,
    303,
  );
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const lang = 'en';
  if (!isSameOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET || !env.CONTACT_TO_EMAIL) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const ip = request.headers.get('CF-Connecting-IP');
  if (await isRateLimited(ip ?? 'unknown', env.RATE_LIMIT)) {
    return respond(request, lang, false, 429, 'rate_limited');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }
  const raw = Object.fromEntries(
    [...form.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']),
  );
  const parsed = contactSchema.safeParse(raw);
  const formLang = raw.lang === 'nl' ? 'nl' : 'en';
  if (!parsed.success) return respond(request, formLang, false, 400, 'invalid_input');
  const input = parsed.data;

  // Honeypot: pretend success so bots learn nothing.
  if (input.website) return respond(request, input.lang, true, 200);

  const human = await verifyTurnstile(env.TURNSTILE_SECRET, input['cf-turnstile-response'], ip);
  if (!human) return respond(request, input.lang, false, 400, 'captcha_failed');

  const sent = await sendEmail(
    {
      RESEND_API_KEY: env.RESEND_API_KEY,
      CONTACT_TO_EMAIL: env.CONTACT_TO_EMAIL,
      CONTACT_FROM_EMAIL: env.CONTACT_FROM_EMAIL,
    },
    input,
  );
  if (!sent) return respond(request, input.lang, false, 502, 'send_failed');
  return respond(request, input.lang, true, 200);
};

export const onRequest: PagesFunction<Env> = async () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
