#!/usr/bin/env node
/** Independent local QA. Does not modify UI or install dependencies.
 * Run only after the builders are ready:
 *   node design-review/verify.mjs
 * Optional: PREVIEW_URL, DESIGNOS_ROOT, QA_ARTIFACTS, CHECK_EXTERNAL=0.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harness = process.env.DESIGNOS_ROOT || '/Users/test/dev/designos';
const require = createRequire(path.join(harness, 'package.json'));
const { chromium } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseUrl).hostname)) {
  throw new Error('QA must target a loopback preview.');
}
const artifacts = path.resolve(root, process.env.QA_ARTIFACTS || '.designos/qa');
const plan = JSON.parse(await fs.readFile(path.join(root, 'design-review/plan.json'), 'utf8'));
const routes = [
  ['home', '/'], ['work', '/work.html'], ['about', '/about.html'],
  ['arclo-prospecting', '/projects/arclo-prospecting.html'],
  ['bidpacket', '/projects/bidpacket.html'],
  ['the-pm-toolkit', '/projects/the-pm-toolkit.html'],
];
const viewports = [
  ['desktop', 1440, 900], ['tablet', 834, 1112], ['mobile', 390, 844],
];
await fs.mkdir(artifacts, { recursive: true });
const result = {
  startedAt: new Date().toISOString(), baseUrl,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  workingTree: execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim(),
  sourcePlan: 'design-review/plan.json', matrix: [], keyboard: [], motion: [],
  noJavaScript: [], autoplay: [], links: {}, issues: [], items: plan.plan.map(item => ({
    itemId: item.id, acceptance: item.acceptance, verdict: 'blocked',
    observed: [], artifacts: [],
  })),
};
const addIssue = (item, scope, message, evidence) => {
  result.issues.push({ itemId: item, scope, message, evidence });
};

function browserFacts() {
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
  const mainImages = [...document.querySelectorAll('main img')].filter(styleVisible).map(img => ({
    src: img.getAttribute('src'), alt: img.alt, loaded: img.complete && img.naturalWidth > 0,
  }));
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
    images: mainImages, hero: { text: heroText, words: heroText.split(/\s+/).filter(Boolean).length, height: heroBounds?.height, images: heroImages,
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

async function settle(page) {
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(450);
}
async function visit(page, route) {
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
  await settle(page);
  return response?.status();
}
async function revealAll(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(450);
}
async function screenshot(page, file, fullPage = true) {
  const target = path.join(artifacts, file);
  await page.screenshot({ path: target, fullPage, animations: 'disabled' });
  return target;
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [viewport, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: viewport === 'mobile', hasTouch: viewport === 'mobile' });
    for (const [route, routePath] of routes) {
      const page = await context.newPage();
      const scope = `${route}/${viewport}`;
      const errors = [], failedRequests = [], failedAssets = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseUrl).origin) failedAssets.push({ url: response.url(), status: response.status() }); });
      try {
        const status = await visit(page, routePath);
        const initial = await page.evaluate(browserFacts);
        const inFirstViewport = t => t.y >= 0 && t.y + t.height <= height && t.x >= 0 && t.x + t.width <= width;
        const isContact = t => /contact|get in touch|email/i.test(t.name) || /^mailto:/i.test(t.href || '');
        const contact = { initial: initial.targets.filter(t => isContact(t) && inFirstViewport(t)), viaMenu: [] };
        if (!contact.initial.length) {
          const toggle = page.locator('.nav__toggle');
          if (await toggle.isVisible()) {
            await toggle.click(); await page.waitForTimeout(350);
            const menuFacts = await page.evaluate(browserFacts);
            contact.viaMenu = menuFacts.targets.filter(t => isContact(t) && inFirstViewport(t));
            await page.keyboard.press('Escape'); await page.waitForTimeout(350);
          }
        }
        if (!contact.initial.length && !contact.viaMenu.length) addIssue('plan-04', scope, 'No contact path reachable in initial viewport or mobile menu', contact);
        if (route === 'home' && viewport === 'desktop') {
          const selectionState = () => ({
            selected: [...document.querySelectorAll('[role=tab][aria-selected="true"], [data-hero-carousel] .is-active')].map(el => el.id || el.textContent.trim()),
            visibleImages: [...document.querySelectorAll('main > section img')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => el.currentSrc || el.src),
          });
          const before = await page.evaluate(selectionState);
          await page.waitForTimeout(6500);
          const after = await page.evaluate(selectionState);
          result.autoplay.push({ durationMs: 6500, before, after, changed: JSON.stringify(before) !== JSON.stringify(after) });
          if (JSON.stringify(before) !== JSON.stringify(after)) addIssue('plan-01', scope, 'Artifact changed without user input during autoplay probe', { before, after });
        }
        await revealAll(page);
        const facts = await page.evaluate(browserFacts);
        await page.addScriptTag({ path: axePath });
        const axe = await page.evaluate(async () => {
          const report = await window.axe.run(document, { resultTypes: ['violations', 'incomplete'] });
          return { violations: report.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })), incomplete: report.incomplete.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) };
        });
        const row = { route, routePath, viewport, status, initialHero: initial.hero, contactWithoutFooter: contact, initialContact: initial.targets.filter(isContact), ...facts, errors, failedRequests, failedAssets, axe };
        result.matrix.push(row);
        if (status !== 200) addIssue('plan-05', scope, `Route returned ${status}`, status);
        if (facts.overflow) addIssue('plan-05', scope, 'Horizontal overflow', { width: facts.bodyWidth, viewport: width, elements: facts.overflowElements });
        if (errors.length || failedAssets.length || facts.brokenImages.length) addIssue('plan-05', scope, 'Browser error or failed local asset', { errors, failedAssets, brokenImages: facts.brokenImages });
        if (facts.h1Count !== 1 || facts.headingSkips.length) addIssue('plan-04', scope, 'Heading outline fails literal acceptance', { h1Count: facts.h1Count, skips: facts.headingSkips });
        const severe = axe.violations.filter(v => ['critical', 'serious'].includes(v.impact));
        if (severe.length) addIssue('plan-04', scope, 'Serious/critical axe violations', severe);
        if (viewport === 'mobile' && facts.smallTargets.length) addIssue('plan-04', scope, 'Interactive target below 44×44', facts.smallTargets);
        if (facts.smallProse.length) addIssue('plan-04', scope, 'Prose below 16px', facts.smallProse);
        const employerRoutes = ['home', 'work', 'about'];
        if (employerRoutes.includes(route) && !/Persado/i.test(facts.text)) addIssue('plan-03', scope, 'Current employer Persado absent from visible page content');
        if (route === 'home' && viewport === 'desktop') {
          const primary = initial.hero.actions[0];
          if (initial.hero.words >= 90 || !primary || primary.y + primary.height > height) addIssue('plan-01', scope, 'Hero word/action criterion fails', initial.hero);
          const h1 = facts.headings.find(h => h.level === 1);
          if (h1?.size > 56.1) addIssue('plan-01', scope, 'Headline exceeds 56px', h1);
        }
        if ((route === 'home' && ['desktop', 'mobile'].includes(viewport)) || (route === 'work' && viewport === 'desktop')) {
          row.screenshot = await screenshot(page, `${route}-${viewport}-after.png`);
          if (route === 'home') row.foldScreenshot = await screenshot(page, `${route}-${viewport}-fold-after.png`, false);
        }
      } catch (error) {
        result.matrix.push({ route, viewport, error: String(error), errors, failedRequests, failedAssets });
        addIssue('plan-05', scope, 'Capture/measurement blocked', String(error));
      }
      await page.close();
    }
    await context.close();
  }

  // Independent narrow-width reflow probe, distinct from the 390px audit.
  const narrow = await browser.newContext({ viewport: { width: 320, height: 812 }, isMobile: true, hasTouch: true });
  result.narrow = [];
  for (const [route, routePath] of routes) {
    const page = await narrow.newPage();
    await visit(page, routePath);
    await revealAll(page);
    const facts = await page.evaluate(browserFacts);
    result.narrow.push({ route, width: facts.bodyWidth, viewport: 320, overflow: facts.overflow, elements: facts.overflowElements });
    if (facts.overflow) addIssue('plan-05', `${route}/320px`, 'Horizontal overflow', facts.overflowElements);
    await page.close();
  }
  await narrow.close();

  // Keyboard and menu state checks; never activate mailto/download destinations.
  for (const [viewport, width, height] of [viewports[0], viewports[2]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: viewport === 'mobile', hasTouch: viewport === 'mobile' });
    const page = await context.newPage();
    await visit(page, '/');
    const menu = page.locator('.nav__toggle');
    if (viewport === 'mobile' && await menu.isVisible()) {
      await menu.focus(); await page.keyboard.press('Enter');
      const expanded = await menu.getAttribute('aria-expanded');
      await page.keyboard.press('Escape');
      const collapsed = await menu.getAttribute('aria-expanded');
      const focusReturned = await menu.evaluate(el => el === document.activeElement);
      result.keyboard.push({ viewport, menu: { expanded, collapsed, focusReturned } });
      if (expanded !== 'true' || collapsed !== 'false' || !focusReturned) addIssue('plan-04', 'home/mobile-menu', 'Menu Enter/Escape/state/focus fails', { expanded, collapsed, focusReturned });
      await menu.click();
      const navLink = page.locator('#site-navigation a[href*="#"]').first();
      if (await navLink.count()) {
        await navLink.click(); await page.waitForTimeout(350);
        const afterNavigation = await menu.getAttribute('aria-expanded');
        result.keyboard.push({ viewport, menuAfterNavigation: afterNavigation });
        if (afterNavigation !== 'false') addIssue('plan-04', 'home/mobile-menu', 'Menu stays open after in-page navigation', afterNavigation);
      }
      await visit(page, '/');
    }
    const stops = [];
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        let visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0 || n.hasAttribute('inert')) visible = false; }
        const hiddenByAncestor = !!el.closest('[hidden],[aria-hidden="true"]');
        return { domIndex: [...document.querySelectorAll('*')].indexOf(el), tag: el.tagName, name: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100), id: el.id, href: el.getAttribute('href'), visible: visible && !hiddenByAncestor, focusVisible: el.matches(':focus-visible'), outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`, boxShadow: cs.boxShadow, textDecoration: cs.textDecorationLine, rect: { x: r.x, y: r.y, width: r.width, height: r.height } };
      });
      if (!stop) continue;
      const key = String(stop.domIndex);
      if (stops.some(s => s.key === key)) break;
      stops.push({ key, ...stop });
      if (!stop.visible) addIssue('plan-04', `home/${viewport}/keyboard`, 'Tab reaches invisible/obscured control', stop);
      if (stop.outline.startsWith('0px ') && stop.boxShadow === 'none' && stop.textDecoration === 'none') addIssue('plan-04', `home/${viewport}/keyboard`, 'Focused control has no detected focus decoration; inspect screenshot', stop);
    }
    result.keyboard.push({ viewport, stops });
    const tabs = page.getByRole('tab');
    if (await tabs.count()) {
      await tabs.first().focus();
      const before = await tabs.first().getAttribute('aria-selected');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(400);
      const states = await tabs.evaluateAll(nodes => nodes.map(el => ({ name: el.textContent.trim(), selected: el.getAttribute('aria-selected'), focused: el === document.activeElement, tabIndex: el.tabIndex, controls: el.getAttribute('aria-controls') })));
      result.keyboard.push({ viewport, tabsArrowRight: { before, states } });
      if (states.filter(s => s.selected === 'true').length !== 1 || !states[1]?.focused || states[1]?.selected !== 'true') addIssue('plan-02', `home/${viewport}/tabs`, 'ArrowRight does not select/focus second artifact tab', states);
      await tabs.first().click(); await page.waitForTimeout(350);
      if (await tabs.first().getAttribute('aria-selected') !== 'true') addIssue('plan-02', `home/${viewport}/tabs`, 'Artifact tab click does not select first tab');
      const panels = [];
      for (let i = 0; i < await tabs.count(); i++) {
        await tabs.nth(i).click();
        const panelId = await tabs.nth(i).getAttribute('aria-controls');
        const panel = page.locator(`#${panelId}`);
        await panel.scrollIntoViewIfNeeded();
        await panel.locator('img').evaluateAll(async images => Promise.all(images.map(img => img.decode().catch(() => {}))));
        const state = await panel.evaluate(el => ({ id: el.id, visible: !el.hidden && el.getBoundingClientRect().height > 0, images: [...el.querySelectorAll('img')].map(img => ({ src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 })) }));
        panels.push(state);
        if (!state.visible || !state.images.length || state.images.some(img => !img.loaded)) addIssue('plan-02', `home/${viewport}/tabs`, 'Selected artifact panel/image does not render', state);
      }
      result.keyboard.push({ viewport, selectedArtifactPanels: panels });
    } else addIssue('plan-02', `home/${viewport}`, 'No semantic artifact tabs found');
    await context.close();
  }

  // Motion at initial reduce and after a live preference change.
  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  for (const [route, routePath] of routes) {
    const page = await motionContext.newPage();
    await visit(page, routePath);
    await revealAll(page);
    let facts = await page.evaluate(browserFacts);
    result.motion.push({ route, mode: 'initial-reduce', animations: facts.animations });
    if (facts.animations.length) addIssue('plan-05', `${route}/reduced-motion`, 'Running animation under reduced motion', facts.animations);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const tab = page.getByRole('tab').nth(1);
    if (await tab.count()) await tab.click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(150);
    facts = await page.evaluate(browserFacts);
    result.motion.push({ route, mode: 'live-change-to-reduce', animations: facts.animations });
    if (facts.animations.length) addIssue('plan-05', `${route}/motion-preference-change`, 'Animation continues after preference changes to reduce', facts.animations);
    await page.close();
  }
  await motionContext.close();

  // No-JS content, initial product artifact, responsive navigation and outline.
  for (const [viewport, width, height] of [viewports[0], viewports[2]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const facts = await page.evaluate(browserFacts);
    const image = await screenshot(page, `home-${viewport}-no-js.png`);
    result.noJavaScript.push({ viewport, hero: facts.hero, overflow: facts.overflow, textLength: facts.text.length, smallTargets: facts.smallTargets, screenshot: image });
    if (!facts.images.some(img => img.loaded)) addIssue('plan-02', `home/${viewport}/no-js`, 'Product image absent without JS', { hero: facts.hero, images: facts.images });
    if (facts.overflow || !/Persado/i.test(facts.text) || facts.text.length < 500) addIssue('plan-05', `home/${viewport}/no-js`, 'No-JS content/reflow fails', { overflow: facts.overflow, textLength: facts.text.length });
    await context.close();
  }

  // Destination and content-source checks are read-only; do not trigger contact.
  const home = result.matrix.find(row => row.route === 'home' && row.viewport === 'desktop');
  const links = home?.links || [];
  const dummyLinks = result.matrix.flatMap(row => (row.links || []).filter(l => l.visible && (l.href === '#' || /^javascript:/i.test(l.href))).map(l => ({ route: row.route, viewport: row.viewport, ...l })));
  result.links.dummyLinks = dummyLinks;
  if (dummyLinks.length) addIssue('plan-02', 'all-routes', 'Dummy destination remains', dummyLinks);
  result.links.linkedin = [...new Set(result.matrix.flatMap(row => (row.links || []).map(l => l.href).filter(href => /linkedin\.com\/in\//.test(href))))];
  if (result.links.linkedin.some(href => !/^https:\/\/(www\.)?linkedin\.com\/in\/collinnicholas\/?$/.test(href))) addIssue('plan-03', 'all-routes', 'LinkedIn slug differs from owner-maintained source', result.links.linkedin);
  const external = [...new Set(links.map(l => l.href).filter(href => /^https?:/.test(href) && !/linkedin\.com/.test(href)))];
  if (process.env.CHECK_EXTERNAL !== '0') {
    result.links.external = await Promise.all(external.map(async url => {
      try { const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' }); return { url, status: response.status, finalUrl: response.url, verdict: response.ok ? 'pass' : response.status === 403 || response.status === 429 ? 'blocked' : 'fail' }; }
      catch (error) { return { url, verdict: 'blocked', error: String(error) }; }
    }));
    const failed = result.links.external.filter(link => link.verdict === 'fail');
    if (failed.length) addIssue('plan-02', 'external-links', 'Public destination returned an error', failed);
  }
  const localSource = {};
  for (const [route, routePath] of routes) {
    localSource[route] = await fs.readFile(path.join(root, routePath === '/' ? 'index.html' : routePath.slice(1)), 'utf8');
  }
  result.content = { checks: [], revenueExcerpts: [], roleExcerpts: [] };
  for (const row of result.matrix.filter(r => r.viewport === 'desktop' && r.text)) {
    const lines = row.text.split(/\n/).map(t => t.trim()).filter(Boolean);
    result.content.revenueExcerpts.push({ route: row.route, lines: lines.filter(line => /\$|ARR|revenue/i.test(line)) });
    result.content.roleExcerpts.push({ route: row.route, lines: lines.filter(line => /Persado|Employ|Jazz|Present|Director of Product/i.test(line)) });
    result.content.checks.push({ route: row.route, hasPersado: /Persado/i.test(row.text), staleJazzHr: /JazzHr|Jazzhr/.test(row.text), stalePipeline: /pipeline (?:is |in )?(?:unbuilt|build)|pipeline in build|landing live/i.test(row.text) });
  }
  const stale = result.content.checks.filter(check => check.staleJazzHr || check.stalePipeline);
  if (stale.length) addIssue('plan-03', 'all-routes', 'Stale content marker needs review', stale);

} catch (error) {
  result.blocked = String(error);
} finally {
  await browser.close();
  result.finishedAt = new Date().toISOString();
  result.captures = result.matrix.filter(row => row.status === 200 && !row.error).length;
  result.verdict = result.blocked ? 'blocked' : result.issues.length ? 'fail' : 'pending-manual-review';
  // Deliberately never convert a literal item to pass automatically. Visual,
  // attribution and factual criteria require the independent reviewer to sign off.
  for (const item of result.items) {
    const issues = result.issues.filter(issue => issue.itemId === item.itemId);
    item.verdict = issues.length ? 'fail' : 'blocked';
    item.observed = issues.length ? issues : ['Automated probes have no failure for this item; manual literal-criterion review remains.'];
    item.artifacts = result.matrix.map(row => row.screenshot).filter(Boolean);
  }
  const out = path.join(artifacts, 'functional-results.json');
  await fs.writeFile(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, captures: result.captures, issues: result.issues, blocked: result.blocked, results: out }, null, 2));
  if (result.blocked || result.issues.length) process.exitCode = 1;
}
