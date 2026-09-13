// Extract only the Punjab district polygons from the owner's reference SVG.
// The source stays untouched; this produces a lightweight, neutral map asset.
import fs from 'node:fs';
const source=process.argv[2];
if(!source)throw Error('Pass the owner-supplied Punjab SVG path.');
const svg=fs.readFileSync(source,'utf8');
const paths=[...svg.matchAll(/<path\b[\s\S]*?\/>/g)].slice(1,24).map(m=>{
 const d=m[0].match(/\sd="([^"]+)"/)[1],transform=m[0].match(/transform="([^"]+)"/)?.[1]||'';
 return `<path d="${d}" transform="${transform}" fill="#dce5d5" stroke="#849c78" stroke-width="0.85" stroke-linejoin="round"/>`;
});
fs.writeFileSync('assets/img/punjab-districts.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276.38782 306.35364"><title>Punjab district boundaries</title>${paths.join('')}</svg>\n`);
console.log('Prepared neutral Punjab district map, without highlight or inset.');
