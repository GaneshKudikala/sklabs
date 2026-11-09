export {};
const form = document.querySelector<HTMLFormElement>('#form');
const statusEl = document.querySelector<HTMLElement>('#form-status');

if (form && statusEl) {
  const msg = (key: string) => statusEl.dataset[key] ?? '';
  const show = (text: string, ok: boolean) => {
    statusEl.textContent = text;
    statusEl.className = ok
      ? 'rounded-md bg-accent-400/20 px-4 py-3 text-sm font-semibold text-ink-950'
      : 'rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-800';
  };

  const params = new URLSearchParams(location.search);
  if (params.get('status') === 'sent') show(msg('success'), true);
  if (params.get('status') === 'error') show(msg('error'), false);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = true;
    show(msg('sending'), true);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        form.reset();
        show(msg('success'), true);
      } else if (data.error === 'captcha_failed') show(msg('captcha'), false);
      else if (data.error === 'rate_limited') show(msg('ratelimited'), false);
      else show(msg('error'), false);
    } catch {
      show(msg('error'), false);
    } finally {
      if (button) button.disabled = false;
      (window as unknown as { turnstile?: { reset(): void } }).turnstile?.reset();
    }
  });
}
