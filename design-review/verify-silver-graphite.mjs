import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import browserFacts from './qa-browser-facts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('/Users/test/dev/designos/package.json');
const {chromium}=require('playwright');
const config=JSON.parse(await fs.readFile(path.join(root,'designos.config.json'),'utf8')).projects[0];
const baseline='http://127.0.0.1:4175', current=config.baseUrl;
const dir=path.join(root,'.designos/silver-graphite/validation');
await fs.mkdir(dir,{recursive:true});
const result={baseUrl:current,baseline,startedAt:new Date().toISOString(),matrix:[],preservation:[],menus:[],tabs:[],narrow:[],motion:[],issues:[],residual:[]};
const check=(pass,message,evidence)=>{if(!pass)result.issues.push({message,evidence});};
const manifest=JSON.parse(await fs.readFile(path.join(root,'.designos/silver-graphite/before/manifest.json'),'utf8'));
for(const [file,hash] of Object.entries(manifest)){
  if(file.startsWith('css/')||file==='js/motion.js')continue;
  const actual=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
  result.preservation.push({file,unchanged:actual===hash});check(actual===hash,'Preserved source changed',file);
}
const expected={'--color-background':'#F4F5F6','--color-surface':'#E7E9EC','--color-surface-elevated':'#FFFFFF','--color-text-primary':'#22262C','--color-text-secondary':'#59616B','--color-accent':'#6D777F','--color-border':'#D4D8DD','--color-button-primary':'#22262C','--color-button-text':'#FFFFFF','--color-hover':'#DDE1E6'};
function designFacts(){
  const role=s=>{const el=document.querySelector(s);if(!el)return null;const c=getComputedStyle(el);return {color:c.color,background:c.backgroundColor,border:c.borderColor,fontFamily:c.fontFamily,fontSize:c.fontSize,lineHeight:c.lineHeight};};
  const geometry=[...document.querySelectorAll('main > section, main h1, main h2, main h3, .nav__inner, .footer, .leadership-artifact, .leadership-map, .studio-hero__lede, .studio-button, .cs-card, .case-artifact')].map(el=>{const c=getComputedStyle(el);return {tag:el.tagName,cls:[...el.classList].filter(n=>!['silver-reveal','is-in-view'].includes(n)).join(' '),left:+el.getBoundingClientRect().left.toFixed(2),top:+(el.getBoundingClientRect().top+scrollY).toFixed(2),width:+el.getBoundingClientRect().width.toFixed(2),height:+el.getBoundingClientRect().height.toFixed(2),fontFamily:c.fontFamily,fontSize:c.fontSize,lineHeight:c.lineHeight,fontWeight:c.fontWeight,letterSpacing:c.letterSpacing};});
  const visible=[...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const chromatic=[];
  for(const el of visible){const c=getComputedStyle(el);for(const prop of ['color','backgroundColor','borderTopColor']){
    const value=c[prop],n=value.match(/[\d.]+/g)?.map(Number);if(!n||n.length>3&&n[3]===0)continue;
    // Silver Graphite's cool neutrals have a small RGB spread. Original img/SVG content is exempt.
    if(Math.max(...n.slice(0,3))-Math.min(...n.slice(0,3))>27&&!el.closest('svg'))chromatic.push({tag:el.tagName,cls:el.className,prop,value});
  }}
  return {geometry,roles:{body:role('body'),nav:role('.nav'),h1:role('h1'),lede:role('.studio-hero__lede'),remit:role('.leadership-artifact'),button:role('.studio-button'),footer:role('.footer')},tokens:Object.fromEntries(Object.keys(window.silverExpected||{}).map(k=>[k,getComputedStyle(document.body).getPropertyValue(k).trim()])),chromatic};
}
async function load(page,url){const response=await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(650);return response.status();}
async function settle(page){await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.8){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}scrollTo(0,0);});await page.waitForTimeout(1050);}
const browser=await chromium.launch({headless:true});
try{
 for(const vp of config.viewports){
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.isMobile,deviceScaleFactor:1});
  for(const route of config.routes){
   const row={route:route.name,viewport:vp.name};const pages={};
   for(const [stage,url] of [['before',baseline],['after',current]]){
    const page=await ctx.newPage();pages[stage]=page;const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('requestfailed',r=>errors.push(r.failure()?.errorText+' '+r.url()));
    const status=await load(page,new URL(route.path,url).href);await settle(page);
    await page.evaluate(e=>window.silverExpected=e,expected);
    const facts=await page.evaluate(browserFacts);
    // Measure settled layout in document coordinates. Animation transforms create
    // offset parents, making raw offsetTop/Left incomparable across motion systems.
    const inspection=await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;transform:none!important;}'});
    const design=await page.evaluate(designFacts);await inspection.evaluate(el=>el.remove());
    await page.screenshot({path:path.join(dir,`${route.name}-${vp.name}-${stage}.png`),fullPage:true,animations:'disabled'});
    if(route.name==='home')await page.screenshot({path:path.join(dir,`home-${vp.name}-fold-${stage}.png`),animations:'disabled'});
    row[stage]={status,errors,facts,design};
    check(status===200&&errors.length===0,'Route or asset load failure',{route:route.name,viewport:vp.name,stage,status,errors});
    if(stage==='after'){
     await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
     row.axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {passes:r.passes.length,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,relatedData:n.any.map(a=>a.data)}))}))};});
     check(!row.axe.violations.some(v=>['serious','critical'].includes(v.impact)),'Serious/critical axe violation',{route:route.name,viewport:vp.name,violations:row.axe.violations});
     for(const [token,value]of Object.entries(expected))check(design.tokens[token].toUpperCase()===value,'Semantic token differs',{token,actual:design.tokens[token],expected:value});
     check(!facts.overflow&&facts.brokenImages.length===0&&facts.h1Count===1&&facts.headingSkips.length===0,'Responsive/structure regression',{route:route.name,viewport:vp.name,facts});
     check(design.chromatic.length===0,'Chromatic interface color remains',{route:route.name,colors:design.chromatic});
    }
   }
   row.contentPreserved=row.before.facts.text===row.after.facts.text;
   row.layoutPreserved=JSON.stringify(row.before.design.geometry)===JSON.stringify(row.after.design.geometry);
   check(row.contentPreserved,'Rendered text changed',{route:route.name,viewport:vp.name});
   check(row.layoutPreserved,'Layout or typography changed',{route:route.name,viewport:vp.name,before:row.before.design.geometry,after:row.after.design.geometry});
   const page=pages.after;
   if(vp.name==='mobile'){
    const toggle=page.locator('.nav__toggle');await toggle.focus();await page.keyboard.press('Enter');await page.waitForTimeout(250);
    const first=await page.evaluate(()=>document.activeElement?.textContent.trim());await page.keyboard.press('Tab');const second=await page.evaluate(()=>document.activeElement?.textContent.trim());await page.keyboard.press('Escape');
    const closed=await toggle.getAttribute('aria-expanded')==='false'&&await toggle.evaluate(el=>document.activeElement===el);
    result.menus.push({route:route.name,first,second,closed});check(first==='Leadership'&&second==='Work'&&closed,'Mobile keyboard menu failure',result.menus.at(-1));
   }
   if(route.name==='home'){
    const tabs=page.getByRole('tab');for(let i=0;i<await tabs.count();i++){
      await tabs.nth(i).focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);
      const tab=await page.evaluate(()=>({selected:document.activeElement.getAttribute('aria-selected'),name:document.activeElement.textContent.trim(),image:(()=>{const img=document.getElementById(document.activeElement.getAttribute('aria-controls'))?.querySelector('img');return !!img&&img.complete&&img.naturalWidth>0;})()}));
      result.tabs.push({viewport:vp.name,...tab});check(tab.selected==='true'&&tab.image,'Artifact tab failure',tab);
    }
    const button=page.locator('.studio-button').first();await button.scrollIntoViewIfNeeded();await button.hover();await page.waitForTimeout(220);
    row.hover=await button.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,transform:getComputedStyle(el).transform,inline:el.style.transform,shadow:getComputedStyle(el).boxShadow}));
    check(row.hover.background==='rgb(54, 63, 73)'&&row.hover.color==='rgb(255, 255, 255)'&&row.hover.transform==='none'&&!row.hover.inline&&row.hover.shadow==='none','CTA hover contract',row.hover);
    await button.focus();row.focus=await button.evaluate(el=>({color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth,style:getComputedStyle(el).outlineStyle}));
    check(row.focus.color==='rgb(34, 38, 44)'&&parseFloat(row.focus.width)>=2&&row.focus.style!=='none','Visible graphite focus',row.focus);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
    row.reduced=await page.evaluate(()=>({animations:document.getAnimations().filter(a=>a.playState==='running').length,values:[...document.querySelectorAll('.enterprise-results__number')].map(el=>el.textContent.trim()),visible:getComputedStyle(document.querySelector('h1')).opacity}));
    check(row.reduced.animations===0&&row.reduced.visible==='1'&&JSON.stringify(row.reduced.values)===JSON.stringify(['$1.76M','36%','1,500']),'Live reduced motion failure',row.reduced);
    result.motion.push({viewport:vp.name,...row.reduced});
   }
   result.matrix.push(row);await pages.before.close();await page.close();
  }
  await ctx.close();
 }
 const narrow=await browser.newContext({viewport:{width:320,height:800},reducedMotion:'reduce'});
 for(const route of config.routes){const p=await narrow.newPage();await load(p,new URL(route.path,current).href);const f=await p.evaluate(browserFacts);result.narrow.push({route:route.name,overflow:f.overflow,elements:f.overflowElements});check(!f.overflow,'320px overflow',result.narrow.at(-1));await p.close();}await narrow.close();
 const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const p=await nojs.newPage();await load(p,current);result.noJavaScript=await p.evaluate(()=>({h1:document.querySelector('h1').innerText,opacity:getComputedStyle(document.querySelector('h1')).opacity,remit:getComputedStyle(document.querySelector('.leadership-artifact')).opacity,img:document.querySelector('.artifact-panel img').complete}));check(result.noJavaScript.opacity==='1'&&result.noJavaScript.remit==='1'&&result.noJavaScript.img,'No-JS content',result.noJavaScript);await p.screenshot({path:path.join(dir,'home-mobile-no-js.png'),fullPage:true});await nojs.close();
 result.residual=[...new Set(result.matrix.flatMap(r=>r.axe.violations.filter(v=>!['serious','critical'].includes(v.impact)).map(v=>v.id)))];
}finally{await browser.close();result.completedAt=new Date().toISOString();result.verdict=result.issues.length?'fail':'pass';await fs.writeFile(path.join(dir,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({verdict:result.verdict,matrix:result.matrix.length,issues:result.issues.map(i=>({message:i.message,evidence:i.evidence?.route||i.evidence})),residual:result.residual,evidence:path.join(dir,'results.json')},null,2));}
