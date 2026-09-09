import fs from 'node:fs';
import assert from 'node:assert/strict';
import {businessSchema} from '../site/business.mjs';
import {services} from '../site/catalog.mjs';
import {blogArticles} from '../site/blog.mjs';
import {textContent} from '../site/seo.mjs';
const origin='https://cleannest.in';
const pages=[...fs.readdirSync('.').filter(f=>f.endsWith('.html')),...fs.readdirSync('blog').filter(f=>f.endsWith('.html')).map(f=>'blog/'+f)];
const bodies=new Map(pages.map(file=>[file,fs.readFileSync(file,'utf8')]));
const errors=[];
const fail=(file,message)=>errors.push(file+': '+message);
const resolveFile=url=>decodeURIComponent(url.pathname).replace(/^\//,'').replace(/\/$/,'/index.html')||'index.html';
const sitemap=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(sitemap).size,sitemap.length,'unique sitemap URLs');
for(const [file,html] of bodies){
 const url=origin+'/'+(file==='index.html'?'':file);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 const indexable=sitemap.includes(url);
 if((html.match(/<h1[\s>]/g)||[]).length!==1)fail(file,'expected one H1');
 if((html.match(/rel="canonical"/g)||[]).length!==1)fail(file,'expected one canonical');
 if(!html.match(/<title>[^<]+<\/title>/)||!html.match(/<meta name="description" content="[^"]+"/))fail(file,'missing title/description');
 if(!canonical?.startsWith(origin+'/'))fail(file,'canonical host differs');
 if(indexable&&(canonical!==url||/name="robots" content="[^"]*noindex/.test(html)))fail(file,'indexable URL must be self-canonical and indexable');
 if(file==='404.html'&&!html.includes('name="robots" content="noindex"'))fail(file,'404 must be noindex');
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)fail(file,'duplicate IDs');
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const ref=m[1];if(/^(mailto:|tel:|data:)/.test(ref))continue;
  const target=new URL(ref.replaceAll('&amp;','&'),url);
  if(!['cleannest.in','www.cleannest.in'].includes(target.hostname))continue;
  if(target.pathname==='/index.html')fail(file,'internal homepage link uses index.html');
  if(target.hostname==='www.cleannest.in')fail(file,'internal link uses www');
  const targetFile=resolveFile(target);
  if(!fs.existsSync(targetFile)){fail(file,'missing '+ref);continue;}
  if(target.hash&&targetFile.endsWith('.html')){
   const content=bodies.get(targetFile)||fs.readFileSync(targetFile,'utf8');
   if(!content.includes('id="'+decodeURIComponent(target.hash.slice(1))+'"'))fail(file,'missing anchor '+ref);
  }
 }
 for(const m of html.matchAll(/<img\b[^>]*>/g)){
  if(!/\balt="[^"]*"/.test(m[0]))fail(file,'image missing alt');
  if(!/width="\d+"/.test(m[0])||!/height="\d+"/.test(m[0]))fail(file,'image missing dimensions');
 }
 let schemas=[];
 for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  try{schemas.push(...[].concat(JSON.parse(m[1])));}catch{fail(file,'invalid JSON-LD');}
 }
 try{assert.deepEqual(schemas.find(s=>s['@type']==='LocalBusiness'),businessSchema);}catch{fail(file,'business entity differs from source');}
 if(schemas.some(s=>s.aggregateRating||s.review))fail(file,'self-serving review schema');
 if(services.some(s=>file===s.id+'.html')){
  const s=schemas.find(s=>s['@type']==='Service');
  if(!s?.serviceType||s.url!==canonical||s.provider?.['@id']!==businessSchema['@id'])fail(file,'invalid Service identity');
  if(!schemas.some(s=>s['@type']==='BreadcrumbList'))fail(file,'service breadcrumbs missing');
 }
 const article=blogArticles[file.slice(5,-5)];
 if(file.startsWith('blog/')&&article){
  const s=schemas.find(s=>s['@type']==='BlogPosting');
  if(s?.headline!==article.title||s.mainEntityOfPage?.['@id']!==canonical)fail(file,'article schema mismatch');
  for(const field of ['author','datePublished','dateModified'])if(!article[field]&&s?.[field])fail(file,'unsupported article '+field);
  let level=1;
  for(const m of html.matchAll(/<h([1-6])\b/g)){const next=Number(m[1]);if(next>level+1)fail(file,'heading level skipped');level=next;}
  if(html.includes('— official CleanNest rates'))fail(file,'blog metadata boilerplate');
 }
 if(file==='faqs.html'){
  const visible=[...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m=>[textContent(m[1]),textContent(m[2])]);
  const schema=schemas.find(s=>s['@type']==='FAQPage');
  const semantic=schema?.mainEntity.map(q=>[q.name,q.acceptedAnswer.text]);
  try{assert.deepEqual(semantic,visible);}catch{fail(file,'FAQ schema differs from visible questions/answers');}
 }
 for(const s of schemas.filter(s=>s['@type']==='BreadcrumbList'))for(const item of s.itemListElement)if(!fs.existsSync(resolveFile(new URL(item.item))))fail(file,'broken breadcrumb');
}
for(const url of sitemap){
 const file=resolveFile(new URL(url));
 if(!bodies.has(file))fail('sitemap','missing page '+url);
 if(url===origin+'/index.html')fail('sitemap','duplicate homepage');
}
console.log('Checked '+pages.length+' pages and '+sitemap.length+' sitemap URLs: links, anchors, images, canonicals, article/FAQ/Service schemas and business identity.');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('All checks passed.');
