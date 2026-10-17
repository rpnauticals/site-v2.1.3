// RP Nauticals — Google Form prefill submission
// Update GOOGLE_FORM_CONFIG in one place to change the destination form.
(function () {
  'use strict';

  const GOOGLE_FORM_CONFIG = {
    baseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe79bZ1LySfVAp8u9kJBG51egR5cgLEM58ODBBfIgMTy4BZaA/viewform',
    fields: {
      name:          'entry.187280006',
      email:         'entry.2141864829',
      mobile:        'entry.2020685241',
      address:       'entry.792128453',
      dob:           'entry.382915545',   // YYYY-MM-DD
      qualification: 'entry.593382151',
      documents:     'entry.1368962437',  // multi-select checkboxes
    },
  };

  function buildPrefillUrl(values) {
    const f = GOOGLE_FORM_CONFIG.fields;
    const params = [['usp', 'pp_url']];
    const push = (key, val) => {
      if (val === undefined || val === null || val === '') return;
      params.push([key, val]);
    };
    push(f.name,          values.name);
    push(f.email,         values.email);
    push(f.mobile,        values.mobile);
    push(f.address,       values.address);
    push(f.dob,           values.dob);
    push(f.qualification, values.qualification);
    (values.documents || []).forEach(doc => push(f.documents, doc));

    const qs = params
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return `${GOOGLE_FORM_CONFIG.baseUrl}?${qs}`;
  }

  function showError(field, message) {
    clearError(field);
    const err = document.createElement('div');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    err.style.cssText = 'color:#dc2626;font-size:.8rem;margin-top:6px;';
    field.appendChild(err);
    const input = field.querySelector('input,select,textarea');
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    const e = field.querySelector('.field-error');
    if (e) e.remove();
    const input = field.querySelector('input,select,textarea');
    if (input) input.removeAttribute('aria-invalid');
  }
  function clearAllErrors(form) {
    form.querySelectorAll('.field').forEach(clearError);
    const banner = form.querySelector('.form-status');
    if (banner) banner.remove();
  }

  function validate(form, values) {
    let ok = true;
    const req = [
      ['name',          'Please enter your full name.'],
      ['email',         'Please enter a valid email address.'],
      ['mobile',        'Please enter your mobile number.'],
      ['address',       'Please enter your residence address.'],
      ['dob',           'Please choose your date of birth.'],
      ['qualification', 'Please share your qualification & certifications.'],
    ];
    req.forEach(([key, msg]) => {
      const input = form.querySelector(`[data-key="${key}"]`);
      if (!input) return;
      const field = input.closest('.field');
      if (!values[key]) { showError(field, msg); ok = false; return; }
      if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        showError(field, 'Please enter a valid email address.'); ok = false;
      }
      if (key === 'mobile' && !/^[0-9+\-\s()]{7,20}$/.test(values.mobile)) {
        showError(field, 'Please enter a valid mobile number.'); ok = false;
      }
    });
    return ok;
  }

  function collect(form) {
    const get = k => {
      const el = form.querySelector(`[data-key="${k}"]`);
      return el ? el.value.trim() : '';
    };
    const documents = Array.from(
      form.querySelectorAll('[data-key="documents"]:checked')
    ).map(el => el.value);
    return {
      name:          get('name'),
      email:         get('email'),
      mobile:        get('mobile'),
      address:       get('address'),
      dob:           get('dob'),
      qualification: get('qualification'),
      documents,
    };
  }

  function init() {
    const form = document.querySelector('form[data-google-form]');
    if (!form) return;
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors(form);
      const values = collect(form);
      if (!validate(form, values)) return;

      const url = buildPrefillUrl(values);
      const win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;

      const status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      status.style.cssText = 'margin-top:14px;color:#065f46;font-size:.9rem;text-align:center;';
      status.textContent = 'Opening the Google Form with your details prefilled…';
      form.appendChild(status);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
