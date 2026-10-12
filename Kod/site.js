// JustImagAIne — shared page scripts
const EN = document.documentElement.lang === 'en';

// ── Mobile menu ──
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));
}

// ── Tabs ──
document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = list.querySelectorAll('[role="tab"]');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
  }));
});

// ── ROI calculator ──
function updateROI() {
  // EN shows US dollars (wage slider is in $/hr), CZ shows Kč
  const locale = EN ? 'en' : 'cs';
  const money = n => EN ? '$' + n.toLocaleString('en') : n.toLocaleString('cs') + ' Kč';
  const step = EN ? 10 : 100; // rounding of the monthly figure
  const inquiries = +document.getElementById('r-inquiries').value;
  const wage = +document.getElementById('r-wage').value;
  const time = +document.getElementById('r-time').value;
  const ai = +document.getElementById('r-ai').value / 100;
  document.getElementById('rv-inquiries').textContent = inquiries.toLocaleString(locale);
  document.getElementById('rv-wage').textContent = money(wage);
  document.getElementById('rv-time').textContent = time + ' min';
  document.getElementById('rv-ai').textContent = Math.round(ai * 100) + (EN ? '%' : ' %');
  const hoursPerMonth = (inquiries * ai * time) / 60;
  const costPerMonth = hoursPerMonth * wage;
  document.getElementById('res-hours').textContent = Math.round(hoursPerMonth) + (EN ? ' hrs' : ' hod');
  document.getElementById('res-cost').textContent = money(Math.round(costPerMonth / step) * step);
  document.getElementById('res-year').textContent = money(Math.round(costPerMonth * 12 / (step * 10)) * step * 10);
}
if (document.getElementById('r-inquiries')) {
  document.querySelectorAll('.roi input[type=range]').forEach(r => r.addEventListener('input', updateROI));
  updateROI();
}

// ── Contact form ──
const form = document.getElementById('contact-form');
if (form) {
  const T = EN
    ? { name: 'Please enter your full name', email: 'Invalid email format', msg: 'Please write at least a few sentences', sending: 'Sending...', error: 'Error, please try again' }
    : { name: 'Zadejte celé jméno', email: 'Neplatný formát emailu', msg: 'Napište alespoň pár vět', sending: 'Odesílám...', error: 'Chyba, zkuste to znovu' };
  const fields = [
    ['f-name', 'fh-name', v => v.trim().length > 1, T.name],
    ['f-email', 'fh-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), T.email],
    ['f-msg', 'fh-msg', v => v.trim().length > 10, T.msg],
  ];
  const submit = document.getElementById('f-submit');

  function liveValidate() {
    let ok = 0;
    fields.forEach(([id, hintId, test, msg]) => {
      const el = document.getElementById(id);
      const valid = test(el.value);
      const show = el.value.length > 0 && !valid;
      el.classList.toggle('invalid', show);
      document.getElementById(hintId).textContent = show ? msg : '';
      if (valid) ok++;
    });
    document.getElementById('f-charcount').textContent = document.getElementById('f-msg').value.length + ' / 500';
    submit.disabled = ok < fields.length;
  }
  fields.forEach(([id]) => document.getElementById(id).addEventListener('input', liveValidate));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const label = submit.textContent;
    submit.textContent = T.sending;
    submit.disabled = true;
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error('Status ' + res.status);
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } catch (err) {
      submit.textContent = T.error;
      submit.disabled = false;
      setTimeout(() => { submit.textContent = label; }, 4000);
    }
  });
}
