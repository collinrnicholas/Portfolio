/* Homepage enhancement: location-aware navigation, without URL/history changes.
   Geometry is cached after resize/content changes; scroll reads only scrollY. */
(() => {
  'use strict';
  const nav = document.querySelector('.nav');
  const leadership = document.getElementById('leadership');
  const work = document.getElementById('work');
  const contact = document.querySelector('.studio-contact');
  const links = Array.from(nav?.querySelectorAll('.nav__link') || []);
  if (!nav || !leadership || !work || !contact) return;
  let positions = null;
  let queued = false;
  const update = () => {
    queued = false;
    if (!positions) return;
    const y = window.scrollY + positions.activation;
    const inContact = window.scrollY + positions.contactActivation >= positions.contact;
    const section = inContact ? null : y >= positions.work ? 'work' : y >= positions.leadership ? 'leadership' : null;
    links.forEach(link => {
      const active = section && link.getAttribute('href') === `index.html#${section}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const measure = () => {
    const top = el => el.getBoundingClientRect().top + window.scrollY;
    positions = {leadership: top(leadership), work: top(work), contact: top(contact), activation: nav.getBoundingClientRect().height + 48, contactActivation: nav.getBoundingClientRect().height + (window.innerHeight - nav.getBoundingClientRect().height) * .45};
    update();
  };
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, {passive: true});
  window.addEventListener('resize', measure, {passive: true});
  window.addEventListener('pageshow', measure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(document.querySelector('main'));
    observer.observe(nav);
  }
  document.fonts?.ready.then(measure);
  measure();
})();
