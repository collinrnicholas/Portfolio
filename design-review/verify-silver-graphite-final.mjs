import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/Users/test/dev/designos/package.json');const {chromium}=require('playwright');
const dir=path.resolve('.designos/silver-graphite/validation');const base='http://127.0.0.1:4176';
const browser=await chromium.launch();const result={liveReduced:[],report:{},issues:[]};
const check=(pass,evidence)=>{if(!pass)result.issues.push(evidence);};
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const c=await browser.newContext({viewport});const p=await c.newPage();await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
  await p.locator('.enterprise-results').scrollIntoViewIfNeeded();
  await p.waitForFunction(()=>[...document.querySelectorAll('.enterprise-results__number')].some(el=>el.dataset.finalValue&&el.textContent.trim()!==el.dataset.finalValue));
  const during=await p.locator('.enterprise-results__number').allTextContents();await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(50);const immediate=await p.locator('.enterprise-results__number').allTextContents();await p.waitForTimeout(1000);const after=await p.locator('.enterprise-results__number').allTextContents();const animations=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
  result.liveReduced.push({viewport,during,immediate,after,animations});check(JSON.stringify(immediate)===JSON.stringify(['$1.76M','36%','1,500'])&&JSON.stringify(immediate)===JSON.stringify(after)&&animations===0,result.liveReduced.at(-1));await c.close();
 }
 const p=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/design-review/silver-graphite-comparison.html',{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('#metric-status').textContent.startsWith('PASS'));
 let pairs=0;for(const route of ['home','work','about','arclo-prospecting','bidpacket','the-pm-toolkit'])for(const viewport of ['desktop','tablet','mobile']){
  await p.selectOption('#route',route);await p.selectOption('#viewport',viewport);await p.waitForFunction(()=>[...document.querySelectorAll('.pair img')].every(img=>img.complete&&img.naturalWidth>0));pairs++;
 }
 await p.selectOption('#route','home');await p.selectOption('#viewport','desktop');await p.screenshot({path:path.join(dir,'comparison-report-desktop.png'),fullPage:true});result.report={status:await p.locator('#metric-status').innerText(),pairs,errors};check(pairs===18&&!errors.length,result.report);await p.close();
}finally{await browser.close();result.verdict=result.issues.length?'fail':'pass';await fs.writeFile(path.join(dir,'final-focused-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}
