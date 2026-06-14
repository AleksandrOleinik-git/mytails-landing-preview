(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function countUp(el, dur) {
    if (!el) return;
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function fillBar(el) { if (el) requestAnimationFrame(() => { el.style.width = el.dataset.width + '%'; }); }

  // select района: серый плейсхолдер пока не выбран (как :invalid)
  document.querySelectorAll('.district').forEach(sel => {
    const sync = () => sel.classList.toggle('placeholder', sel.value === '');
    sync();
    sel.addEventListener('change', sync);
  });

  // гамбургер-меню
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a, .btn').forEach(el => el.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // переключатель языка (UI; переводы — TODO i18n, маршрутизация локалей)
  const lang = document.getElementById('lang');
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = lang.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', e => {
      if (!lang.contains(e.target)) { lang.classList.remove('open'); langBtn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { lang.classList.remove('open'); langBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // FAQ — toggle класса; анимацию делает CSS (grid-template-rows 0fr↔1fr)
  document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  }));

  // плавная прокрутка к нижней форме
  const joinCard = document.getElementById('join-final');
  const joinEmail = document.getElementById('final-email');
  document.querySelectorAll('.js-to-form').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    joinCard.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    joinCard.classList.remove('flash'); void joinCard.offsetWidth; joinCard.classList.add('flash');
    setTimeout(() => joinEmail && joinEmail.focus({ preventScroll: true }), reduced ? 0 : 650);
  }));

  // счётчик дефицита ситтеров оживает при входе блока в экран
  let scarcityStarted = false;
  function onReveal(el) {
    if (el.classList.contains('scarcity') && !scarcityStarted) {
      scarcityStarted = true;
      countUp(document.getElementById('sc-num'), 2400);
    }
  }

  if (!reduced && 'IntersectionObserver' in window) {
    document.querySelectorAll('.sec-head, .step, .wcard, .tcard, .perk, .founding, .scarcity, .faq-item, .final').forEach((el, i) => {
      el.classList.add('reveal', 'd' + (1 + (i % 3)));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); onReveal(en.target); io.unobserve(en.target); } });
    }, { threshold:.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    countUp(document.getElementById('sc-num'), 2400);
  }
})();
