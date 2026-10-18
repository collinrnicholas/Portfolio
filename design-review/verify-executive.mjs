#!/usr/bin/env node
/** Independent executive-content QA. Run after an explicit READY handoff.
 * Uses installed DesignOS Playwright/axe; makes no UI edits or package installs.
 * PREVIEW_URL and DESIGNOS_ROOT are optional. Evidence directories never overwrite.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import browserFacts from './qa-browser-facts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harness = process.env.DESIGNOS_ROOT || '/Users/test/dev/designos';
const require = createRequire(path.join(harness, 'package.json'));
const { chromium } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(baseUrl).hostname)) throw new Error('Loopback preview required.');
const planPath = 'design-review/executive-content-plan.md';
const plan = await fs.readFile(path.join(root, planPath), 'utf8');
const config = JSON.parse(await fs.readFile(path.join(root, 'designos.config.json'), 'utf8'));
const project = config.projects.find(p => p.id === 'collinnicholas');
const routes = project.routes.map(route => [route.name, route.path]);
const viewports = project.viewports.map(v => [v.name, v.width, v.height]);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const artifactDir = path.join(root, '.designos', 'qa', `executive-${stamp}`);
await fs.mkdir(artifactDir, { recursive: false });
const sourceFiles = ['index.html', 'work.html', 'about.html', 'projects/arclo-prospecting.html', 'projects/bidpacket.html', 'projects/the-pm-toolkit.html',
  ...(await fs.readdir(path.join(root,'css'))).filter(name=>name.endsWith('.css')).sort().map(name=>`css/${name}`),
  ...(await fs.readdir(path.join(root,'js'))).filter(name=>name.endsWith('.js')).sort().map(name=>`js/${name}`)];
const sourceHashes = {};
for (const file of sourceFiles) sourceHashes[file] = createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex');
const result = {
  runId: `executive-${stamp}`, startedAt: new Date().toISOString(), baseUrl, sourcePlan: planPath,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  workingTree: execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim(), sourceHashes,
  acceptance: plan.split('\n').filter(line => /^\d\. \*\*exec-/.test(line)),
  matrix: [], anchors: [], keyboard: [], reducedMotion: [], noJavaScript: [], narrow: [], issues: [], artifacts: [],
};
const issue = (itemId, scope, message, evidence) => result.issues.push({ itemId, scope, message, evidence });
const snap = async (page, name, fullPage = false) => {
  const out = path.join(artifactDir, name); await page.screenshot({ path: out, fullPage, animations: 'disabled' }); result.artifacts.push(out); return out;
};
async function visit(page, route) {
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts?.ready); await page.waitForTimeout(400); return response?.status();
}
async function reveal(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight - 100) { scrollTo(0, y); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(350);
  // Read factual numbers at the end of the existing 900ms ticker. Intermediate
  // animation frames are presentation states, not replacement portfolio claims.
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-final-value]')].every(el=>el.textContent.trim()===el.dataset.finalValue),{},{timeout:2000});
}
function executiveFacts() {
  const hero = document.querySelector('main > section');
  const sections = [...document.querySelectorAll('main > section')].map((el, index) => ({ index, id: el.id, className: el.className, text: el.innerText.trim(), top: el.getBoundingClientRect().top + scrollY, bottom: el.getBoundingClientRect().bottom + scrollY }));
  const map = hero?.querySelector('.hero-artifact, [data-scope-map], .leadership-map, .scope-map');
  const mapTexts = map ? [...map.querySelectorAll('p,li,h2,h3,h4,strong,span,dt,dd')].filter(el => el.innerText?.trim() && el.getClientRects().length).map(el => ({ text: el.innerText.trim().slice(0,200), fontSize: parseFloat(getComputedStyle(el).fontSize), height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width })) : [];
  return {
    hero: { text: hero?.innerText, title: hero?.querySelector('h1')?.innerText, actions: [...hero?.querySelectorAll('a[href]') || []].map(el => { const href=el.getAttribute('href');const id=href?.startsWith('#')?href.slice(1):null;return { text: el.innerText.trim(), href, targetText:id?document.getElementById(id)?.innerText?.slice(0,1000):null }; }) },
    map: { exists: !!map, text: map?.innerText, width: map?.getBoundingClientRect().width, height: map?.getBoundingClientRect().height, texts: mapTexts }, sections,
    proofExcerpts: [...document.querySelectorAll('main article, main .enterprise-results > div, main .leadership-proof > div')].filter(el => /36%|1\.76|1,500|2300|2,300|18,000/.test(el.innerText)).map(el => ({ text: el.innerText, selector: el.id || el.className })),
  };
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [viewport, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: viewport === 'mobile', hasTouch: viewport === 'mobile' });
    for (const [route, routePath] of routes) {
      const page = await context.newPage(); const errors = [], failedRequests = [], failedAssets = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText }));
      page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseUrl).origin) failedAssets.push({ url: response.url(), status: response.status() }); });
      const scope = `${route}/${viewport}`;
      try {
        const status = await visit(page, routePath);
        const initial = await page.evaluate(browserFacts);
        const executive = await page.evaluate(executiveFacts);
        if (route === 'home' && ['desktop', 'mobile'].includes(viewport)) await snap(page, `home-${viewport}-fold-after.png`);
        await reveal(page);
        const facts = await page.evaluate(browserFacts);
        await page.addScriptTag({ path: axePath });
        const axe = await page.evaluate(async () => {
          const d = await window.axe.run(document, { resultTypes: ['violations','incomplete'] });
          return { violations: d.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })), incomplete: d.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })) };
        });
        const row = { route, routePath, viewport, status, initialHero: initial.hero, executive, ...facts, axe, errors, failedRequests, failedAssets };
        result.matrix.push(row);
        if (status !== 200 || errors.length || failedAssets.length || facts.brokenImages.length) issue('exec-04', scope, 'Route/browser/local asset failure', { status, errors, failedAssets, images: facts.brokenImages });
        if (facts.overflow) issue('exec-04', scope, 'Horizontal overflow', { width: facts.bodyWidth, viewport: width, elements: facts.overflowElements });
        if (facts.h1Count !== 1 || facts.headingSkips.length) issue('exec-04', scope, 'Heading outline failure', { count: facts.h1Count, skips: facts.headingSkips });
        const severe = axe.violations.filter(v => ['serious','critical'].includes(v.impact));
        if (severe.length) issue('exec-04', scope, 'Serious/critical axe violation', severe);
        if (!/Persado/i.test(facts.text)) issue('exec-03', scope, 'Current employer missing');
        const dummyLinks=facts.links.filter(link=>link.href==='#'||/^javascript:/i.test(link.href));
        if(dummyLinks.length)issue('exec-03',scope,'Dummy local destination',dummyLinks);
        const unsupported = facts.text.match(/\b(?:chief product officer|chief product executive|CPO|VP of Product|vice president of product)\b|\b(?:saves?|saved)\s+\d+\s*(?:hours?|minutes?)\b|\b(?:automatically synchroni[sz]|automatic synchroni[sz]|contractor payment|payment collection)\w*/gi);
        if (unsupported) issue('exec-03', scope, 'Unsupported title/claim needs source review', unsupported);
        if (route === 'home') {
          if (!/Director of Product/i.test(executive.hero.text) || !/Persado/i.test(executive.hero.text)) issue('exec-01', scope, 'Hero current title/company missing', executive.hero);
          if (/\b(?:solo|alone|pull requests?|PRs?|engineers?)\b/i.test(executive.hero.title || '')) issue('exec-01', scope, 'Builder/PR headline remains', executive.hero.title);
          const primary=executive.hero.actions[0];
          if(!primary||!/leadership|portfolio|Persado|enterprise|decision/i.test(primary.targetText||primary.href||''))issue('exec-01',scope,'Primary action does not lead to leadership evidence',primary);
          if (!executive.map.exists || !executive.map.width || !executive.map.height || !/growth|acquisition/i.test(executive.map.text || '') || !/retention|value/i.test(executive.map.text || '') || !/design/i.test(executive.map.text || '')) issue('exec-01', scope, 'Responsibility map lacks readable supported scope', executive.map);
          const work = executive.sections.find(s => s.id === 'work');
          const leadership = executive.sections.filter(s => s !== executive.sections[0] && /Persado/i.test(s.text) && /Market Scan|customer value|growth/i.test(s.text));
          const proof = executive.sections.filter(s => /1\.76|36%|1,500/.test(s.text));
          if (!work || !leadership.length || !proof.length || leadership.some(s => s.index >= work.index || s.bottom > work.top + 1) || proof.some(s => s.index >= work.index || s.bottom > work.top + 1)) issue('exec-02', scope, 'Leadership/proof does not precede independent work in DOM and visual order', executive.sections.map(({index,id,top,bottom,text})=>({index,id,top,bottom,text:text.slice(0,180)})));
          if (!/36%/.test(facts.text) || !/customer[- ]activity|customer activity/i.test(facts.text) || !/year.over.year|year.on.year|YoY/i.test(facts.text)) issue('exec-02', scope, '36% adoption result missing correct metric/timeframe label');
        }
        if (route === 'home' && viewport === 'desktop') await snap(page, 'home-desktop-full-after.png', true);
        if (route === 'work' && viewport === 'desktop') await snap(page, 'work-desktop-full-after.png', true);
      } catch (error) { result.matrix.push({ route, viewport, error: String(error), errors, failedRequests, failedAssets }); issue('exec-04', scope, 'Measurement blocked', String(error)); }
      await page.close();
    }
    await context.close();
  }

  // Inspect local fragment destinations by navigating to each actual URL. This
  // detects absent IDs and broken cross-page links rather than string presence.
  const anchorContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const localAnchors = new Map();
  for (const row of result.matrix.filter(r => r.viewport === 'desktop' && r.links)) for (const link of row.links) {
    const url = new URL(link.href, new URL(row.routePath, baseUrl));
    if (url.origin === new URL(baseUrl).origin && url.hash && url.hash !== '#main-content') localAnchors.set(url.href, { from: row.route, text: link.text, url: url.href });
  }
  const requiredPersado = new URL('/work.html#persado', baseUrl).href;
  localAnchors.set(requiredPersado, { from: 'required acceptance', text: 'Current Persado work', url: requiredPersado });
  for (const link of localAnchors.values()) {
    const page = await anchorContext.newPage();
    const status = await visit(page, link.url);
    const observed = await page.evaluate(() => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); const r = el?.getBoundingClientRect();
      const nav = document.querySelector('nav')?.getBoundingClientRect();
      return { exists: !!el, hash: location.hash, text: el?.innerText?.slice(0,400), rect: r ? { top: r.top, bottom: r.bottom, width: r.width, height: r.height } : null, navBottom: nav?.bottom, viewportHeight: innerHeight };
    });
    const pass = status === 200 && observed.exists && observed.rect.height > 0 && observed.rect.top < observed.viewportHeight && observed.rect.bottom > (observed.navBottom || 0);
    result.anchors.push({ ...link, status, observed, pass });
    if (!pass) issue('exec-03', link.url, 'Fragment navigation fails to reveal target', observed);
    await page.close();
  }
  await anchorContext.close();

  const narrow = await browser.newContext({ viewport: { width: 320, height: 812 }, isMobile: true, hasTouch: true });
  for (const [route, routePath] of routes) {
    const page = await narrow.newPage(); await visit(page, routePath); await reveal(page); const facts = await page.evaluate(browserFacts);
    result.narrow.push({ route, width: facts.bodyWidth, overflow: facts.overflow, elements: facts.overflowElements });
    if (facts.overflow) issue('exec-04', `${route}/320px`, 'Narrow overflow', facts.overflowElements);
    await page.close();
  }
  await narrow.close();

  for (const [viewport, width, height] of [viewports[0], viewports[2]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: viewport === 'mobile', hasTouch: viewport === 'mobile' });
    const page = await context.newPage(); await visit(page, '/');
    const menu = page.locator('.nav__toggle');
    if (await menu.isVisible()) {
      await menu.focus(); await page.keyboard.press('Enter');
      const opened = await menu.getAttribute('aria-expanded');
      const menuLink = page.locator('#site-navigation a').first(); await menuLink.waitFor({state:'visible'});
      await page.waitForFunction(()=>!!document.activeElement.closest('#site-navigation'),{},{timeout:1000}).catch(()=>{});
      const focusState=()=>{const el=document.activeElement;return {name:(el.getAttribute('aria-label')||el.innerText||el.tagName).trim(),inMenu:!!el.closest('#site-navigation'),visible:el.getBoundingClientRect().height>0&&getComputedStyle(el).visibility!=='hidden'};};
      const openFocus=await page.evaluate(focusState);if(!openFocus.inMenu)await page.keyboard.press('Tab');const reachedFocus=await page.evaluate(focusState);
      const linkFocused=reachedFocus.inMenu&&reachedFocus.visible;
      await page.keyboard.press('Escape');
      const closed = await menu.getAttribute('aria-expanded'); const focusReturned = await menu.evaluate(el => el === document.activeElement);
      const mobileMenu = { opened, openFocus, reachedFocus, linkFocused, closed, focusReturned }; result.keyboard.push({ viewport, mobileMenu });
      if (opened !== 'true' || !linkFocused || closed !== 'false' || !focusReturned) issue('exec-04', `${viewport}/menu`, 'Menu keyboard behavior fails', mobileMenu);
      await menu.click(); const hashLink = page.locator('#site-navigation a[href*="#"]').first();
      if (await hashLink.count()) { await hashLink.click(); await page.waitForTimeout(300); const afterLink = await menu.getAttribute('aria-expanded'); result.keyboard.push({viewport,menuAfterNavigation:afterLink}); if (afterLink !== 'false') issue('exec-04', `${viewport}/menu`, 'Menu does not close after navigation', afterLink); }
      await visit(page, '/');
    }
    const stops = [], seen = new Set();
    for (let i=0;i<100;i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el=document.activeElement; if (!el || el===document.body) return null;
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el); let visible=r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
        for(let n=el;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0||n.hasAttribute('inert'))visible=false;}
        return { key:[...document.querySelectorAll('*')].indexOf(el), name:(el.getAttribute('aria-label')||el.innerText||el.tagName).trim().slice(0,100),visible,outline:cs.outline,outlineWidth:parseFloat(cs.outlineWidth),boxShadow:cs.boxShadow };
      });
      if (!focused)continue;if(seen.has(focused.key))break;seen.add(focused.key);stops.push(focused);
      if (!focused.visible || (focused.outlineWidth < 1 && focused.boxShadow==='none')) issue('exec-04',`${viewport}/keyboard`,'Invisible or undecorated focus stop',focused);
    }
    result.keyboard.push({viewport,stops});
    const tabs=page.getByRole('tab');const tabStates=[];
    if (!(await tabs.count())) issue('exec-04',`${viewport}/tabs`,'Artifact tabs missing');
    else {
      await tabs.first().focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);
      const arrow=await tabs.evaluateAll(nodes=>nodes.map(el=>({text:el.innerText,selected:el.getAttribute('aria-selected'),focused:el===document.activeElement,tabIndex:el.tabIndex})));
      if(arrow.filter(t=>t.selected==='true').length!==1||!arrow[1]?.focused||arrow[1]?.selected!=='true')issue('exec-04',`${viewport}/tabs`,'ArrowRight focus/selection fails',arrow);
      for(let i=0;i<await tabs.count();i++){
        await tabs.nth(i).click();const id=await tabs.nth(i).getAttribute('aria-controls');const panel=page.locator(`#${id}`);await panel.scrollIntoViewIfNeeded();await panel.locator('img').evaluateAll(async images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
        const state=await panel.evaluate(el=>({id:el.id,visible:!el.hidden&&el.getBoundingClientRect().height>0,images:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0}))}));tabStates.push(state);
        if(!state.visible||!state.images.length||state.images.some(img=>!img.loaded))issue('exec-04',`${viewport}/tabs`,'Selected image/panel fails',state);
      }
      result.keyboard.push({viewport,arrowRight:arrow,selectedPanels:tabStates});
    }
    await context.close();
  }

  const motion=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  for(const [route,routePath]of routes){
    const page=await motion.newPage();await visit(page,routePath);await reveal(page);const initial=await page.evaluate(browserFacts);
    // Reload in normal motion so JS effects/listeners really initialize. Merely
    // changing a page that booted in reduce would skip its ticker/magnetic code.
    await page.emulateMedia({reducedMotion:'no-preference'});await visit(page,routePath);
    const number=page.locator('.enterprise-results__number').first();if(await number.count()){await number.scrollIntoViewIfNeeded();await page.waitForTimeout(100);}
    const tab=page.getByRole('tab').nth(1);if(await tab.count())await tab.click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const changed=await page.evaluate(browserFacts);
    const numbers=await page.locator('[data-final-value]').evaluateAll(nodes=>nodes.map(el=>({text:el.textContent.trim(),final:el.dataset.finalValue})));
    const row={route,initial:initial.animations,afterPreferenceChange:changed.animations,numbers};result.reducedMotion.push(row);if(initial.animations.length||changed.animations.length||numbers.some(n=>n.text!==n.final))issue('exec-04',`${route}/reduced-motion`,'Animation/ticker persists under reduced motion',row);await page.close();
  }await motion.close();
  for(const[viewport,width,height]of[viewports[0],viewports[2]]){
    const context=await browser.newContext({viewport:{width,height},javaScriptEnabled:false});const page=await context.newPage();await visit(page,'/');const facts=await page.evaluate(browserFacts),exec=await page.evaluate(executiveFacts);
    const firstPanelLocator=page.locator('[role=tabpanel]:not([hidden])').first();await firstPanelLocator.scrollIntoViewIfNeeded();await firstPanelLocator.locator('img').evaluateAll(async images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
    const firstPanel=await firstPanelLocator.evaluate(el=>({visible:el.getBoundingClientRect().height>0,text:el.innerText,images:[...el.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0}))}));
    await page.evaluate(()=>scrollTo(0,0));const screenshot=await snap(page,`home-${viewport}-no-js-after.png`,true);
    result.noJavaScript.push({viewport,hero:exec.hero,map:exec.map,firstPanel,overflow:facts.overflow,textLength:facts.text.length,screenshot});
    if(facts.overflow||!/Director of Product/i.test(facts.text)||!exec.map.exists||!firstPanel.visible||firstPanel.images.some(img=>!img.loaded)||facts.text.length<800)issue('exec-04',`${viewport}/no-JS`,'No-JS content/reflow fails',{hero:exec.hero,map:exec.map,firstPanel,overflow:facts.overflow});await context.close();
  }
} catch(error){result.blocked=String(error);} finally {
  await browser.close();result.finishedAt=new Date().toISOString();result.captures=result.matrix.filter(r=>r.status===200&&!r.error).length;
  result.sourceHashesAfter={};for(const file of sourceFiles)result.sourceHashesAfter[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
  if(JSON.stringify(result.sourceHashes)!==JSON.stringify(result.sourceHashesAfter))issue('exec-04','source-stability','UI source changed during validation',{before:result.sourceHashes,after:result.sourceHashesAfter});
  result.verdict=result.blocked?'blocked':result.issues.length?'fail':'pending-manual-review';
  const out=path.join(artifactDir,'executive-results.json');await fs.writeFile(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({verdict:result.verdict,captures:result.captures,issues:result.issues,blocked:result.blocked,results:out},null,2));if(result.blocked||result.issues.length)process.exitCode=1;
}
