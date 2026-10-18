/* Motion Primitives-inspired native interaction: user-driven, static-first. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileNavigation = window.matchMedia('(max-width: 900px)');
  const nav = document.querySelector('.nav');
  const toggle = nav?.querySelector('.nav__toggle');
  const links = nav?.querySelector('.nav__links');
  if (toggle && links) {
    const setNavigation = (open, restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      toggle.classList.toggle('is-open', open);
      links.classList.toggle('is-open', open);
      if (mobileNavigation.matches) links.inert = !open;
      else links.inert = false;
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setNavigation(open);
      // The links precede the toggle in the shared markup. Entering the open
      // menu here keeps keyboard users from tabbing straight past its links.
      if (open && mobileNavigation.matches) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (toggle.getAttribute('aria-expanded') === 'true' && document.activeElement === toggle) {
            links.querySelector('a[href]')?.focus();
          }
        }));
      }
    });
    links.addEventListener('click', event => { if (event.target.closest('a')) setNavigation(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setNavigation(false, true);
    });
    document.addEventListener('click', event => {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target)) setNavigation(false);
    });
    mobileNavigation.addEventListener('change', () => setNavigation(false));
    setNavigation(false);
  }

  document.querySelectorAll('[data-artifact-tabs]').forEach(group => {
    const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
    const panels = Array.from(group.querySelectorAll('[role="tabpanel"]'));
    const indicator = group.querySelector('.artifact-tab-indicator');
    const positionIndicator = () => {
      const active = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      if (!active || !indicator) return;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translateX(${active.offsetLeft - 3}px)`;
    };
    const selectTab = (next, moveFocus = false) => {
      const previousIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      const nextIndex = tabs.indexOf(next);
      tabs.forEach(tab => {
        const selected = tab === next;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => {
        const selected = panel.id === next.getAttribute('aria-controls');
        panel.hidden = !selected;
        panel.classList.remove('is-changing');
        if (selected && !reducedMotion.matches) {
          // Restart only the new panel; direction follows the tab order so the
          // transition reads as movement rather than a re-render.
          panel.dataset.dir = nextIndex >= previousIndex ? 'forward' : 'back';
          void panel.offsetWidth;
          panel.classList.add('is-changing');
        }
      });
      positionIndicator();
      if (moveFocus) next.focus();
    };
    // A tablist is one tab stop: non-selected tabs must not be reachable, or
    // keyboard users land on controls whose panel is not shown.
    const initialTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    tabs.forEach(tab => { tab.tabIndex = tab === initialTab ? 0 : -1; });
    panels.forEach(panel => { panel.hidden = panel.id !== initialTab.getAttribute('aria-controls'); });
    positionIndicator();
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[nextIndex], true);
      });
    });
    positionIndicator();
    window.addEventListener('resize', positionIndicator, { passive: true });
    document.fonts?.ready.then(positionIndicator);
    reducedMotion.addEventListener('change', () => panels.forEach(panel => panel.classList.remove('is-changing')));
  });
})();
