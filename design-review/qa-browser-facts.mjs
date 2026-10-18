export default function browserFacts() {
  const styleVisible = el => {
    if (!el || !el.getClientRects().length) return false;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || node.hasAttribute('inert')) return false;
    }
    return true;
  };
  const name = el => (el.getAttribute('aria-label') || el.innerText || el.getAttribute('alt') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 140);
  const describe = el => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''}`;
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(styleVisible).map(el => ({
    level: Number(el.tagName[1]), text: name(el), size: parseFloat(getComputedStyle(el).fontSize), selector: describe(el),
  }));
  const headingSkips = headings.filter((h, i) => i > 0 && h.level > headings[i - 1].level + 1);
  const targets = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(el => styleVisible(el) && !el.disabled && el.getAttribute('aria-hidden') !== 'true')
    .map(el => { const r = el.getBoundingClientRect(); return {
      name: name(el), selector: describe(el), width: +r.width.toFixed(2), height: +r.height.toFixed(2),
      x: +r.x.toFixed(2), y: +r.y.toFixed(2), href: el.getAttribute('href'),
    }; });
  const prose = [...document.querySelectorAll('main p, main li, .prose p, .prose li')].filter(el => styleVisible(el) && !el.closest('[class*="eyebrow"],[class*="label"],[class*="kicker"],[class*="caption"],[class*="tag"],[class*="status"],figcaption,nav')).map(el => {
    const cs = getComputedStyle(el); return {
      text: name(el), selector: describe(el), size: parseFloat(cs.fontSize),
      lineHeight: cs.lineHeight === 'normal' ? null : +(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(3),
    };
  });
  const hero = document.querySelector('main > section, main .hero');
  const heroText = hero?.innerText?.trim().replace(/\s+/g, ' ') || '';
  const heroBounds = hero?.getBoundingClientRect();
  const heroImages = hero ? [...hero.querySelectorAll('img')].filter(styleVisible).map(img => ({
    src: img.getAttribute('src'), alt: img.alt, loaded: img.complete && img.naturalWidth > 0,
    width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height,
  })) : [];
  const animations = document.getAnimations().filter(a => a.playState === 'running').map(a => {
    const timing = a.effect.getComputedTiming();
    return { name: a.animationName || a.transitionProperty || 'web-animation', duration: timing.duration, iterations: timing.iterations, target: describe(a.effect.target) };
  });
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  const overflowElements = [...document.querySelectorAll('body *')].filter(el => {
    if (!styleVisible(el)) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
  }).map(el => ({ selector: describe(el), ...rect(el) })).slice(0, 20);
  const links = [...document.querySelectorAll('a[href]')].map(el => ({ text: name(el), href: el.getAttribute('href'), visible: styleVisible(el) }));
  return {
    title: document.title, text: document.body.innerText, h1Count: headings.filter(h => h.level === 1).length,
    headings, headingSkips, targets,
    smallTargets: targets.filter(t => (t.width < 43.5 || t.height < 43.5) && t.width > 0 && t.x + t.width > 0 && t.x < innerWidth),
    prose, smallProse: prose.filter(p => p.size < 15.9),
    hero: { text: heroText, words: heroText.split(/\s+/).filter(Boolean).length, height: heroBounds?.height, images: heroImages,
      actions: hero ? [...hero.querySelectorAll('a,button')].filter(styleVisible).map(el => ({ name: name(el), ...rect(el) })) : [] },
    bodyWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth + 1, overflowElements,
    // Hidden lazy panels intentionally have not requested their image yet.
    // A visible image must load; an already requested failed image is a defect.
    brokenImages: [...document.images].filter(img => (styleVisible(img) && (!img.complete || img.naturalWidth === 0)) || (img.complete && img.currentSrc && img.naturalWidth === 0)).map(img => img.getAttribute('src')),
    animations, links,
    tabs: [...document.querySelectorAll('[role=tab]')].map(el => ({ name: name(el), selected: el.getAttribute('aria-selected'), controls: el.getAttribute('aria-controls'), tabIndex: el.tabIndex })),
  };
}

