// One-time, read-only migration helper. Emits the existing business content.
import fs from 'node:fs';
import vm from 'node:vm';
const clean = s => (s || '').replace(/<svg\b[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#8377;/g,'₹').replace(/&mdash;/g,'—').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const pages = {};
for (const name of [...fs.readdirSync('.').filter(n=>n.endsWith('.html')), ...fs.readdirSync('blog').filter(n=>n.endsWith('.html')).map(n=>'blog/'+n)]) {
 const html=fs.readFileSync(name,'utf8');
 pages[name]={title:clean(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]),description:html.match(/<meta name="description" content="([^"]*)"/)?.[1]||'',h1:clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]),
 image:html.match(/class="srv-hero-media"><img src="([^"]+)"/)?.[1],sub:clean(html.match(/class="cta-sub">([\s\S]*?)<\/p>/)?.[1]),
 includes:[...(html.match(/<ul class="srv-included">([\s\S]*?)<\/ul>/)?.[1]||'').matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m=>clean(m[1])),
 faqs:[...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/details>/g)].map(m=>[clean(m[1]),clean(m[2])]),
 main:html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'', schemas:[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{try{return [JSON.parse(m[1])]}catch{return []}})};
}
const pricing=fs.readFileSync('pricing.html','utf8');
const rates=vm.runInNewContext('('+pricing.match(/var groups = (\[[\s\S]*?\n    \]);/)[1]+')');
const homes=vm.runInNewContext('('+pricing.match(/var prices = (\{[\s\S]*?\n    \});/)[1]+')');
console.log(JSON.stringify({pages,rates,homes},null,2));
