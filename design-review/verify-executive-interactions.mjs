#!/usr/bin/env node
// Focused regression check after the independent executive matrix passes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('/Users/test/dev/designos/package.json');const {chromium}=require('playwright');
const config=JSON.parse(await fs.readFile(path.join(root,'designos.config.json'),'utf8')).projects[0];
const dir=path.join(root,'.designos','qa',`executive-interactions-${new Date().toISOString().replace(/[:.]/g,'-')}`);await fs.mkdir(dir,{recursive:true});
const files=['js/studio.js','js/motion.js'];const hashes={};for(const file of files)hashes[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
const result={startedAt:new Date().toISOString(),sourceHashes:hashes,menus:[],tickers:[],issues:[]};
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 for(const route of config.routes){
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(new URL(route.path,config.baseUrl).href,{waitUntil:'networkidle'});
  const toggle=page.locator('.nav__toggle');await toggle.focus();await page.keyboard.press('Enter');await page.locator('#site-navigation a').first().waitFor({state:'visible'});
  await page.waitForFunction(()=>!!document.activeElement.closest('#site-navigation'),{},{timeout:1000}).catch(()=>{});
  const inspect=()=>{const el=document.activeElement;return {name:(el.getAttribute('aria-label')||el.innerText||el.tagName).trim(),inMenu:!!el.closest('#site-navigation'),visible:getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().height>0};};
  const onOpen=await page.evaluate(inspect);await page.keyboard.press('Tab');const onTab=await page.evaluate(inspect);await page.keyboard.press('Escape');
  const closed=await toggle.getAttribute('aria-expanded'),focusReturned=await toggle.evaluate(el=>el===document.activeElement);
  const row={route:route.name,status:response.status(),onOpen,onTab,closed,focusReturned,errors,pass:response.status()===200&&onOpen.inMenu&&onOpen.visible&&onTab.inMenu&&onTab.visible&&closed==='false'&&focusReturned&&!errors.length};result.menus.push(row);if(!row.pass)result.issues.push({scope:`${route.name}/menu`,evidence:row});await page.close();
 }await context.close();
 for(const [viewport,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:viewport==='mobile',hasTouch:viewport==='mobile',reducedMotion:'no-preference'});const page=await context.newPage();await page.goto(config.baseUrl,{waitUntil:'networkidle'});await page.locator('.enterprise-results__number').first().scrollIntoViewIfNeeded();await page.waitForTimeout(120);
  const numbers=()=>[...document.querySelectorAll('.enterprise-results__number')].map(el=>({text:el.textContent.trim(),final:el.dataset.finalValue}));const before=await page.evaluate(numbers);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(80);const after=await page.evaluate(numbers);await page.waitForTimeout(220);const later=await page.evaluate(numbers);const running=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
  let pointerAfterReduce=null;
  if(viewport==='desktop'){
   const button=page.locator('.studio-button').first();await page.mouse.move(0,0);await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();await page.mouse.move(box.x+box.width*.9,box.y+box.height*.5);await page.waitForTimeout(150);pointerAfterReduce=await button.evaluate(el=>({inlineTransform:el.style.transform,computedTransform:getComputedStyle(el).transform}));
  }
  const pointerStatic=!pointerAfterReduce||!pointerAfterReduce.inlineTransform||pointerAfterReduce.inlineTransform==='none';
  const row={viewport,before,after,later,running,pointerAfterReduce,exercisedMidTicker:before.some(n=>n.text!==n.final),pass:before.some(n=>n.text!==n.final)&&after.every(n=>n.text===n.final)&&later.every(n=>n.text===n.final)&&running===0&&pointerStatic};result.tickers.push(row);if(!row.pass)result.issues.push({scope:`${viewport}/live-motion-preference`,evidence:row});await context.close();
 }
}catch(error){result.blocked=String(error);}finally{await browser.close();result.sourceHashesAfter={};for(const file of files)result.sourceHashesAfter[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');result.sourceStable=JSON.stringify(result.sourceHashes)===JSON.stringify(result.sourceHashesAfter);result.verdict=result.blocked?'blocked':result.issues.length||!result.sourceStable?'fail':'pass';result.finishedAt=new Date().toISOString();const out=path.join(dir,'interaction-results.json');await fs.writeFile(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,results:out},null,2));if(result.verdict!=='pass')process.exitCode=1;}
