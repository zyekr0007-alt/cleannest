// Browser regression checks using the installed agent-browser CLI.
import {execFileSync} from 'node:child_process';
const session='cleannest-qa';
const run=(...args)=>execFileSync('agent-browser',['--session',session,...args],{encoding:'utf8',maxBuffer:4*1024*1024});
const routes=['index.html','services.html','full-house-cleaning.html','pricing.html','reviews.html','results.html','areas-we-serve.html','contact.html','faqs.html','blog/index.html','privacy.html','quote.html?service=full-house-cleaning'];
const issues=[];
for(const width of [360,390,768,1440]){
 run('set','viewport',String(width),'1000');
 for(const route of routes){
  run('open','http://127.0.0.1:8123/'+route);
  const result=run('eval',`(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));return {overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelectorAll('h1').length};})()`);
  const data=JSON.parse(result);
  if(data.overflow||data.broken.length||data.h1!==1)issues.push({width,route,...data});
 }
 console.log(`Checked ${routes.length} page types at ${width}px.`);
}
console.log(JSON.stringify({issues},null,2));
run('close');
if(issues.length)process.exitCode=1;
