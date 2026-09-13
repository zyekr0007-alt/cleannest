import fs from 'node:fs';
const base=process.argv[2]||'http://127.0.0.1:8123';
const urls=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]));
const failures=[];
for(let start=0;start<urls.length;start+=6){
 await Promise.all(urls.slice(start,start+6).map(async canonical=>{
  const response=await fetch(base+canonical.pathname,{redirect:'manual'});
  if(response.status!==200){failures.push({path:canonical.pathname,status:response.status});return;}
  const body=await response.text();
  if(!body.includes('rel="canonical" href="'+canonical.href+'"'))failures.push({path:canonical.pathname,error:'canonical differs'});
 }));
}
const missing=await fetch(base+'/not-a-cleannest-page-qa',{redirect:'manual'});
if(missing.status!==404||!(await missing.text()).includes('name="robots" content="noindex"'))failures.push({path:'missing page',error:'expected noindex 404'});
console.log(JSON.stringify({base,indexableURLs:urls.length,failures},null,2));
if(failures.length)process.exitCode=1;
