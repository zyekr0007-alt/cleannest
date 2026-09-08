import fs from 'node:fs';
import path from 'node:path';
const pages=[...fs.readdirSync('.').filter(f=>f.endsWith('.html')),...fs.readdirSync('blog').filter(f=>f.endsWith('.html')).map(f=>'blog/'+f)];
const errors=[];
for(const file of pages){const html=fs.readFileSync(file,'utf8');
 if((html.match(/<h1[\s>]/g)||[]).length!==1)errors.push(file+': expected one H1');
 if((html.match(/rel="canonical"/g)||[]).length!==1)errors.push(file+': expected one canonical');
 for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1]);}catch{errors.push(file+': invalid JSON-LD');}}
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(file+': duplicate IDs');
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){const url=m[1];if(/^(https?:|mailto:|tel:|data:)/.test(url))continue;const [ref,hash]=url.split('#');const target=ref?path.normalize(path.join(path.dirname(file),decodeURIComponent(ref.split('?')[0]))):file;
  if(!fs.existsSync(target)){errors.push(file+': missing '+url);continue;}
  if(hash&&target.endsWith('.html')){const body=fs.readFileSync(target,'utf8');if(!body.includes(`id="${hash}"`))errors.push(file+': missing anchor '+url);}
 }
}
console.log(`Checked ${pages.length} pages: headings, metadata, JSON-LD, duplicate IDs, local links, anchors and assets.`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('All structural checks passed.');
