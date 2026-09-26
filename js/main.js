/* ==========================================================================
   Main JS — nav, theme scroll, scroll reveal, hero carousel,
             stat counters, reading progress, contact form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveLink();
  initScrollNav();
  initThemeScroll();
  initScrollReveal();
  initHeroCarousel();
  initStatCounters();
  initCaseStudyProgress();
  initContactForms();
});

/* ---- Mobile navigation ---- */
function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  const nav = document.querySelector('.nav');
  if (!toggle || !links) return;

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    links.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // A nav hidden by scroll-hide would swallow the open menu — bring it back.
    if (isOpen && nav) nav.style.transform = '';
  });

  links.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Active nav link ---- */
function initActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    const clean = href.replace(/^\.\//, '');
    const isHome = (clean === 'index.html') && (path.endsWith('/') || path.endsWith('/index.html'));
    if (isHome || (clean !== 'index.html' && path.endsWith(clean))) {
      link.classList.add('nav__link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---- Hide/show nav on scroll + glass shadow ---- */
function initScrollNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;
  const threshold = 80;

  window.addEventListener('scroll', () => {
    if (document.querySelector('.nav__links.is-open')) return;

    const currentScroll = window.scrollY;

    if (currentScroll > threshold && currentScroll > lastScroll) {
      nav.style.transform = 'translateY(calc(-100% - 20px))';
    } else {
      nav.style.transform = '';
    }

    nav.classList.toggle('is-scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---- Dark -> light theme as the hero scrolls away -------------------------
   The signature transition. The hero is pinned dark; the body flips to
   body.theme--light on the first bit of scroll, which swaps every semantic
   token and cross-fades the page over --duration-theme (1.4s). Fires
   immediately on scroll-back-to-top in reverse. */
function initThemeScroll() {
  if (!document.querySelector('[data-theme-hero]')) return;

  const TRIGGER_OFFSET = 10;
  let ticking = false;

  function apply() {
    document.body.classList.toggle('theme--light', window.scrollY > TRIGGER_OFFSET);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  }

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

/* ---- Scroll reveal ---- */
function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const selectors = [
    '.section__header', '.section__eyebrow', '.section__title', '.section__subtitle',
    '.stat', '.principle', '.project-card', '.cs-card',
    '.timeline__item', '.build-row', '.chip-row',
    '.hero__project-title', '.hero__project-lede', '.hero__meta',
    '.cs-stat', '.cs-chapter', '.prose h2', '.prose p', '.contact__form',
    '.next-project'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));
  elements.forEach(el => el.classList.add('reveal'));

  document.querySelectorAll('.stat-band, .principles, .build-list').forEach(g => {
    g.classList.add('reveal-stagger');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-slide').forEach(el => observer.observe(el));
}

/* ---- Hero impact carousel — vertical slide, auto-advance ---- */
function initHeroCarousel() {
  const root = document.querySelector('[data-hero-carousel]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.hero-carousel__slide'));
  if (slides.length < 2) return;

  const backBtn = document.querySelector('[data-hero-back]');
  const nextBtn = document.querySelector('[data-hero-next]');

  const DURATION = 700;
  const INTERVAL = 4000;

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  let animating = false;
  let timer = null;
  let pendingStep = null;

  // Enable transitions only after first paint so slide 0 doesn't animate in.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-carousel--ready')));

  function goTo(index, direction) {
    if (animating || index === current) return;
    animating = true;

    const outgoing = slides[current];
    const incoming = slides[index];

    if (direction === 'back') {
      // Snap the incoming slide to the top edge instantly, then animate down in.
      incoming.classList.add('no-transition');
      incoming.style.transform = 'translateY(-100%)';
      incoming.style.opacity = '0';
      void incoming.offsetWidth;
      incoming.classList.remove('no-transition');
      incoming.style.transform = '';
      incoming.style.opacity = '';
    }

    outgoing.classList.remove('is-active');
    outgoing.classList.add('is-exit-up');
    incoming.classList.add('is-active');

    window.setTimeout(() => {
      // Snap back to rest instantly — removing the exit class alone would
      // animate the hidden slide visibly back through the frame.
      outgoing.classList.add('no-transition');
      outgoing.classList.remove('is-exit-up');
      void outgoing.offsetWidth;
      outgoing.classList.remove('no-transition');
      animating = false;

      // A manual click that landed mid-animation is honoured now rather than
      // silently dropped.
      if (pendingStep) {
        const d = pendingStep;
        pendingStep = null;
        goTo(d === 'next' ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length, d);
      }
    }, DURATION);

    current = index;
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo((current + 1) % slides.length, 'next'), INTERVAL);
  }

  function requestStep(direction) {
    restartTimer();
    if (animating) { pendingStep = direction; return; }
    goTo(direction === 'next'
      ? (current + 1) % slides.length
      : (current - 1 + slides.length) % slides.length, direction);
  }

  slides[0].classList.add('is-active');

  if (nextBtn) nextBtn.addEventListener('click', () => requestStep('next'));
  if (backBtn) backBtn.addEventListener('click', () => requestStep('back'));

  restartTimer();
}

/* ---- Stat counters — cubic ease-out, fires once in view ---- */
function initStatCounters() {
  const stats = document.querySelectorAll('[data-count]');
  if (!stats.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isDecimal = String(target).includes('.');
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = eased * target;
        el.textContent = prefix + (isDecimal
          ? value.toFixed(1)
          : Math.round(value).toLocaleString('en-US')) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + (isDecimal
          ? target.toFixed(1)
          : Math.round(target).toLocaleString('en-US')) + suffix;
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });

  stats.forEach(el => observer.observe(el));
}

/* ---- Case-study reading progress ---- */
function initCaseStudyProgress() {
  const bar = document.querySelector('.cs-progress');
  if (!bar) return;

  function update() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---- Contact form ---- */
function initContactForms() {
  document.querySelectorAll('.contact__form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
      const msg = form.querySelector('.form-message');
      if (msg) { msg.textContent = ''; msg.className = 'form-message'; }

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) { valid = false; field.classList.add('has-error'); }
      });

      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        valid = false;
        emailField.classList.add('has-error');
      }

      if (!valid) {
        if (msg) {
          msg.textContent = 'Please complete the required fields.';
          msg.className = 'form-message form-message--error';
        }
        return;
      }

      if (msg) {
        msg.textContent = 'Thanks — your message is on its way.';
        msg.className = 'form-message form-message--success';
      }
      form.reset();
      setTimeout(() => { if (msg) msg.className = 'form-message'; }, 5000);
    });
  });
}
