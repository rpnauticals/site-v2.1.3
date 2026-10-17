// RP Nauticals — Minimal vanilla JS
(function () {
  'use strict';

  // Nav scroll state
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Adaptive navigation — show what fits, overflow into a "More" dropdown.
  // Links are hidden from the left ("Home" first).
  if (links) {
    var items = Array.prototype.slice.call(links.querySelectorAll(':scope > li'));
    var more = document.createElement('li');
    more.className = 'nav-more';
    more.hidden = true;
    more.innerHTML = '<button type="button" aria-expanded="false" aria-haspopup="true">More' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
      '</button><ul class="nav-more-menu"></ul>';
    links.appendChild(more);
    var moreBtn = more.querySelector('button');
    var moreMenu = more.querySelector('.nav-more-menu');

    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = more.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function () {
      more.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    });

    var widths = null;
    var measure = function () {
      widths = items.map(function (li) { return li.getBoundingClientRect().width; });
    };

    var layout = function () {
      var container = document.querySelector('.nav .container');
      if (!container) return;
      // Reset to full desktop list before measuring.
      items.forEach(function (li) { li.hidden = false; });
      more.hidden = true;
      more.classList.remove('open');
      moreMenu.innerHTML = '';
      items.forEach(function (li) { links.insertBefore(li, more); });

      if (window.innerWidth <= 900) return; // mobile drawer handles the rest

      if (!widths || widths.some(function (w) { return !w; })) measure();

      var brand = container.querySelector('.brand');
      var cta = container.querySelector('.nav-cta');
      var gap = 6;
      var available = container.clientWidth
        - (brand ? brand.getBoundingClientRect().width : 0)
        - (cta ? cta.getBoundingClientRect().width : 0)
        - 56;

      var total = widths.reduce(function (a, b) { return a + b + gap; }, 0);
      if (total <= available) return;

      more.hidden = false;
      var moreWidth = more.getBoundingClientRect().width || 96;
      available -= (moreWidth + gap);

      var hideCount = 0;
      while (hideCount < items.length - 1 && total > available) {
        total -= (widths[hideCount] + gap);
        hideCount++;
      }
      for (var i = 0; i < hideCount; i++) {
        items[i].hidden = true;
        var clone = document.createElement('li');
        clone.innerHTML = items[i].innerHTML;
        moreMenu.appendChild(clone);
      }
      if (!moreMenu.children.length) more.hidden = true;
    };

    var raf;
    var schedule = function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { widths = null; layout(); });
    layout();
  }

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));


  // Stat count-up
  const nums = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target + suffix; return; }
        el.textContent = cur + suffix;
        requestAnimationFrame(tick);
      };
      tick();
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  nums.forEach(n => countIO.observe(n));

  // Testimonials auto-scroll
  const track = document.querySelector('.tst-track');
  if (track) {
    let paused = false;
    track.addEventListener('mouseenter', () => paused = true);
    track.addEventListener('mouseleave', () => paused = false);
    setInterval(() => {
      if (paused) return;
      const max = track.scrollWidth - track.clientWidth;
      const next = track.scrollLeft + 400;
      track.scrollTo({ left: next > max ? 0 : next, behavior: 'smooth' });
    }, 4500);
  }

  // Category filter (articles page)
  const chips = document.querySelectorAll('.chip[data-filter]');
  const cards = document.querySelectorAll('[data-cat]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.cat === f;
        c.style.display = show ? '' : 'none';
      });
    });
  });

  // Chatbot toggle
  const fab = document.querySelector('.chatbot-fab');
  const panel = document.querySelector('.chatbot-panel');
  if (fab && panel) {
    fab.addEventListener('click', () => panel.classList.toggle('open'));
    const close = panel.querySelector('[data-cb-close]');
    if (close) close.addEventListener('click', () => panel.classList.remove('open'));
    const form = panel.querySelector('form');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const body = panel.querySelector('.cb-body');
      if (!input.value.trim()) return;
      const u = document.createElement('div'); u.className = 'cb-msg user'; u.textContent = input.value;
      body.appendChild(u);
      const b = document.createElement('div'); b.className = 'cb-msg bot';
      b.textContent = 'Thanks! Our team will get back to you shortly. For urgent queries, please call +91-98765-43210.';
      setTimeout(() => body.appendChild(b), 500);
      input.value = '';
      body.scrollTop = body.scrollHeight + 200;
    });
  }
})();
