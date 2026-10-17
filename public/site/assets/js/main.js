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

  // Keep fitting links inline at every width; overflow uses the same drawer.
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (nav && links) {
    nav.classList.add('adaptive');
    const items = Array.from(links.children);
    const more = document.createElement('li');
    more.className = 'nav-more';
    more.hidden = true;
    more.innerHTML = '<button type="button" aria-expanded="false" aria-controls="nav-overflow">See more' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      '</button><ul class="nav-more-menu" id="nav-overflow" inert></ul>';
    links.appendChild(more);
    const moreBtn = more.querySelector('button');
    const moreMenu = more.querySelector('ul');
    const setOpen = (open, restoreFocus = false) => {
      more.classList.toggle('open', open);
      moreBtn.setAttribute('aria-expanded', String(open));
      moreMenu.inert = !open;
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
      if (restoreFocus) moreBtn.focus();
    };
    moreBtn.addEventListener('click', () => {
      setOpen(!more.classList.contains('open'));
    });
    if (toggle) {
      toggle.setAttribute('aria-controls', 'nav-overflow');
      toggle.addEventListener('click', () => setOpen(!more.classList.contains('open')));
    }
    document.addEventListener('click', (event) => {
      if (!more.contains(event.target) && !(toggle && toggle.contains(event.target))) setOpen(false);
    });
    moreMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    nav.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && more.classList.contains('open')) setOpen(false, true);
      if (event.key === 'ArrowDown' && event.target === moreBtn) {
        event.preventDefault();
        setOpen(true);
        const first = moreMenu.querySelector('a');
        if (first) first.focus();
      }
    });

    const layout = () => {
      const container = nav.querySelector('.container');
      const primary = links.parentElement;
      if (!container || !primary) return;
      const focused = document.activeElement;
      const wasOpen = more.classList.contains('open');
      items.forEach(item => { item.hidden = false; links.insertBefore(item, more); });
      more.hidden = true;
      const gap = parseFloat(getComputedStyle(links).gap) || 0;
      const widths = items.map(item => item.getBoundingClientRect().width);
      const available = primary.getBoundingClientRect().width;
      let total = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, items.length - 1) * gap;
      if (total <= available) {
        setOpen(false);
        return;
      }
      more.hidden = false;
      const moreWidth = more.getBoundingClientRect().width;
      let overflowCount = 0;
      // Preserve the existing priority: move Home and other leftmost links first.
      while (overflowCount < items.length && total + gap + moreWidth > available) {
        total -= widths[overflowCount] + (overflowCount < items.length - 1 ? gap : 0);
        overflowCount++;
      }
      items.slice(0, overflowCount).forEach(item => moreMenu.appendChild(item));
      setOpen(wasOpen);
      if (focused && focused !== document.body && nav.contains(focused)) {
        if (!wasOpen && moreMenu.contains(focused)) moreBtn.focus();
        else focused.focus();
      }
    };
    let raf;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(nav.querySelector('.container'));
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
