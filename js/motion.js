/* Silver Graphite: one-time section reveals, number ticker,
   and a live reduced-motion switch.

   Reveal animation is CSS-only (scroll-driven, see css/motion.css), so nothing
   here is responsible for hiding content. Rules:
   - Content is readable and complete with this file absent.
   - Every effect is skipped when prefers-reduced-motion is set, at load and
     when the setting changes while the page is open.
   - No autoplay, no scroll hijacking, no layout reads inside scroll handlers. */
(() => {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const tickers = [];
  const tickerFrames = new Map();

  /* One-time reveals enhance already-visible content. No hidden base state,
     pointer tracking or layout reads inside scroll handlers. */
  let revealObserver = null;
  const initReveals = () => {
    if (!('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.studio-section-heading, .work-feature, .enterprise-current, .enterprise-results > div, .studio-approach > div, .studio-contact > div, .section__header, .cs-chapter, .case-artifact, .timeline__item, .cs-card');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('silver-reveal', 'is-in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    targets.forEach(el => revealObserver.observe(el));
  };

  /* ---------------- number ticker ---------------- */

  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const formatValue = (value, decimals) => {
    const fixed = value.toFixed(decimals);
    const [whole, fraction] = fixed.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fraction ? `${grouped}.${fraction}` : grouped;
  };

  const runTicker = (el) => {
    const original = el.dataset.finalValue || el.textContent.trim();
    el.dataset.finalValue = original;
    const match = original.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!match) return;
    const [, prefix, numberText, suffix] = match;
    const target = Number(numberText.replace(/,/g, ''));
    if (!Number.isFinite(target)) return;
    const decimals = numberText.includes('.') ? numberText.split('.')[1].length : 0;
    const duration = 900;
    const start = performance.now();
    el.setAttribute('aria-label', `${prefix}${formatValue(target, decimals)}${suffix}`);
    const step = (now) => {
      if (motionQuery.matches) {
        tickerFrames.delete(el);
        el.textContent = original;
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = `${prefix}${formatValue(target * easeOutExpo(progress), decimals)}${suffix}`;
      if (progress < 1) tickerFrames.set(el, requestAnimationFrame(step));
      else {
        tickerFrames.delete(el);
        el.textContent = original;
      }
    };
    tickerFrames.set(el, requestAnimationFrame(step));
  };

  // Held at module scope: an observer with no live reference can be collected
  // before it ever fires.
  let tickerObserver = null;

  const initTickers = () => {
    const numbers = Array.from(document.querySelectorAll('.enterprise-results__number'));
    if (!numbers.length) return;
    numbers.forEach((el) => {
      el.dataset.finalValue = el.textContent.trim();
      tickers.push(el);
    });
    if (!('IntersectionObserver' in window)) return;
    tickerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tickerObserver.unobserve(entry.target);
        runTicker(entry.target);
      });
    }, { threshold: 0.4 });
    numbers.forEach((el) => tickerObserver.observe(el));
  };

  /* ---------------- reduced motion, live ---------------- */

  const setFinalNumbers = () => {
    tickers.forEach((el) => {
      if (el.dataset.finalValue) el.textContent = el.dataset.finalValue;
    });
  };

  const stopEverything = () => {
    root.classList.add('no-motion');
    tickerFrames.forEach((frame) => cancelAnimationFrame(frame));
    tickerFrames.clear();
    setFinalNumbers();
    if (tickerObserver) tickerObserver.disconnect();
    if (revealObserver) revealObserver.disconnect();
    if (document.getAnimations) {
      document.getAnimations().forEach((animation) => {
        try { animation.finish(); } catch (error) { /* infinite or cancelled */ }
      });
    }
  };

  /* ---------------- boot ---------------- */

  if (motionQuery.matches) {
    // Print the real figures immediately; no animation at all.
    root.classList.add('no-motion');
    document.querySelectorAll('.enterprise-results__number').forEach((el) => {
      el.dataset.finalValue = el.textContent.trim();
    });
    return;
  }

  initReveals();
  initTickers();

  const onMotionChange = (event) => {
    if (event.matches) stopEverything();
    else root.classList.remove('no-motion');
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
})();
