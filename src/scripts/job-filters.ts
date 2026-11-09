export {};
const root = document.querySelector<HTMLFormElement>('#job-filters');
if (root) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-job]')];
  const none = document.querySelector<HTMLElement>('#job-none');
  const count = document.querySelector<HTMLElement>('#job-count');
  const fields = {
    q: root.querySelector<HTMLInputElement>('#f-q')!,
    location: root.querySelector<HTMLSelectElement>('#f-location')!,
    work: root.querySelector<HTMLSelectElement>('#f-work')!,
    type: root.querySelector<HTMLSelectElement>('#f-type')!,
    specialism: root.querySelector<HTMLSelectElement>('#f-specialism')!,
    seniority: root.querySelector<HTMLSelectElement>('#f-seniority')!,
  };
  type Key = keyof typeof fields;
  const keys = Object.keys(fields) as Key[];

  const apply = () => {
    const q = fields.q.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const d = card.dataset;
      const ok =
        (!q || (d.search ?? '').includes(q)) &&
        (!fields.location.value || d.location === fields.location.value) &&
        (!fields.work.value || d.work === fields.work.value) &&
        (!fields.type.value || d.type === fields.type.value) &&
        (!fields.specialism.value ||
          (d.specialism ?? '').split(' ').includes(fields.specialism.value)) &&
        (!fields.seniority.value || d.seniority === fields.seniority.value);
      card.hidden = !ok;
      if (ok) shown++;
    }
    if (none) none.hidden = shown > 0;
    if (count) count.textContent = (count.dataset.template ?? '{n}').replace('{n}', String(shown));
  };

  const syncUrl = () => {
    const params = new URLSearchParams();
    for (const k of keys) if (fields[k].value.trim()) params.set(k, fields[k].value.trim());
    const qs = params.toString();
    history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  };

  // Restore filters from the URL query string.
  const initial = new URLSearchParams(location.search);
  for (const k of keys) {
    const v = initial.get(k);
    if (v) fields[k].value = v;
  }

  root.addEventListener('input', () => {
    apply();
    syncUrl();
  });
  root.addEventListener('change', () => {
    apply();
    syncUrl();
  });
  root.addEventListener('submit', (e) => e.preventDefault());
  root.addEventListener('reset', () => {
    setTimeout(() => {
      apply();
      syncUrl();
    }, 0);
  });
  apply();
}
