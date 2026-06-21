(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function countUp(el, dur) {
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

  // блок 4 — авто-цикл сценариев дохода (конфиг — массив, анимацию не трогаем)
  const SCENARIOS = [
    { tag: 'Выгул',        formula: '€12 × 20 заказов',     total: 240 },
    { tag: 'Дневной уход', formula: '€15 × 15 заказов',     total: 225 },
    { tag: 'Передержка',   formula: '€25/ночь × 8',         total: 200 },
  ];
  let calcIdx = 0, calcTimer = null;
  function renderScenario(i) {
    const s = SCENARIOS[i];
    const tag = document.getElementById('calc-tag');
    const formula = document.getElementById('calc-formula');
    const total = document.getElementById('calc-total');
    const dots = document.querySelectorAll('#calc-dots i');
    if (!tag) return;
    tag.style.opacity = formula.style.opacity = 0;
    setTimeout(() => {
      tag.textContent = s.tag;
      formula.textContent = s.formula;
      tag.style.opacity = formula.style.opacity = 1;
      total.dataset.target = s.total;
      countUp2(total, s.total, 1100);
    }, 380);
    dots.forEach((d, di) => d.classList.toggle('on', di === i));
  }
  function countUp2(el, target, dur) {
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now();
    (function tick(now){ const p = Math.min((now - t0)/dur, 1); el.textContent = Math.round(ease(p)*target); if (p<1) requestAnimationFrame(tick); })(performance.now());
  }
  function startCalc() {
    renderScenario(0);
    if (reduced) return;
    calcTimer = setInterval(() => { calcIdx = (calcIdx + 1) % SCENARIOS.length; renderScenario(calcIdx); }, 3600);
  }
  document.querySelectorAll('#calc-dots i').forEach((d, i) => d.addEventListener('click', () => {
    clearInterval(calcTimer); calcIdx = i; renderScenario(i);
  }));

  // гамбургер-меню
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // закрыть меню при клике по ссылке
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

  // FAQ — toggle класса; анимацию делает CSS (grid-template-rows 0fr↔1fr), без рывков и наложений
  document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const open = item.classList.toggle('open');
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
  }));

  // плавная прокрутка к нижней форме по кнопкам founding/sticky/меню
  const joinCard = document.getElementById('join-final');
  const joinEmail = document.getElementById('final-email');
  document.querySelectorAll('.js-to-form').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    joinCard.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    joinCard.classList.remove('flash'); void joinCard.offsetWidth; joinCard.classList.add('flash');
    setTimeout(() => joinEmail && joinEmail.focus({ preventScroll: true }), reduced ? 0 : 650);
  }));

  // секционные анимации запускаются по входу блока в экран
  let calcStarted = false, foundingStarted = false;
  function onReveal(el) {
    if (el.classList.contains('calc') && !calcStarted) { calcStarted = true; startCalc(); }
    if (el.classList.contains('founding') && !foundingStarted) {
      foundingStarted = true;
      countUp(document.getElementById('f-claimed'), 2600);
      fillBar(document.getElementById('f-bar'));
    }
  }

  if (!reduced && 'IntersectionObserver' in window) {
    document.querySelectorAll('.sec-head, .fy, .step, .wcard, .tcard, .perk, .calc, .founding, .faq-item, .final').forEach((el, i) => {
      el.classList.add('reveal', 'd' + (1 + (i % 3)));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); onReveal(en.target); io.unobserve(en.target); } });
    }, { threshold:.12, rootMargin:'0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    startCalc();
    countUp(document.getElementById('f-claimed'), 2600);
    fillBar(document.getElementById('f-bar'));
  }

  window.addEventListener('load', () => {
    countUp(document.getElementById('cnt-income'), 2200);
    countUp(document.getElementById('cnt-claimed'), 2600);
    countUp(document.getElementById('cnt-left'), 2600);
    fillBar(document.getElementById('bar-fill'));
  });
})();
