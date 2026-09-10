import fs from 'node:fs';
import path from 'node:path';

// Generate the site before assembling a deliberately small public directory.
await import('./build.mjs');

const projectRoot=process.cwd();
const outputRoot=path.join(projectRoot,'dist');

if(path.basename(outputRoot)!=='dist')throw new Error('Refusing to replace an unexpected output directory.');
fs.rmSync(outputRoot,{recursive:true,force:true});
fs.mkdirSync(outputRoot,{recursive:true});

const copyTree=(source,destination)=>fs.cpSync(source,destination,{
 recursive:true,
 filter:(entry)=>{
  const relative=path.relative(projectRoot,entry);
  if(relative===`assets${path.sep}generated`||relative.startsWith(`assets${path.sep}generated${path.sep}`))return false;
  if([
   `assets${path.sep}img${path.sep}hero-team.jpg`,
   `assets${path.sep}img${path.sep}hero-team-wide.png`,
  ].includes(relative))return false;
  // Keep original project photographs in the repository, but deploy only the
  // responsive AVIF/WebP derivatives used by the public results gallery.
  return !(relative.startsWith(`assets${path.sep}img${path.sep}results${path.sep}`)&&path.extname(entry).toLowerCase()==='.png');
 }
});

copyTree(path.join(projectRoot,'assets'),path.join(outputRoot,'assets'));
copyTree(path.join(projectRoot,'blog'),path.join(outputRoot,'blog'));

for(const file of fs.readdirSync(projectRoot)){
 if(file.endsWith('.html')||['robots.txt','sitemap.xml'].includes(file)){
  fs.copyFileSync(path.join(projectRoot,file),path.join(outputRoot,file));
 }
}

const generatedSource=path.join(projectRoot,'assets','generated');
const generatedOutput=path.join(outputRoot,'assets','generated');
const generatedFiles=new Set();
const addGeneratedReferences=(contents)=>{
 for(const match of contents.matchAll(/assets\/generated\/([^"'?#\s>]+)/g))generatedFiles.add(match[1]);
 for(const match of contents.matchAll(/["']\.\/([^"']+\.(?:css|js|mjs|json))["']/g)){
  if(fs.existsSync(path.join(generatedSource,match[1])))generatedFiles.add(match[1]);
 }
};

for(const file of fs.readdirSync(outputRoot).filter(file=>file.endsWith('.html'))){
 addGeneratedReferences(fs.readFileSync(path.join(outputRoot,file),'utf8'));
}
for(const file of fs.readdirSync(path.join(outputRoot,'blog')).filter(file=>file.endsWith('.html'))){
 addGeneratedReferences(fs.readFileSync(path.join(outputRoot,'blog',file),'utf8'));
}

for(const file of generatedFiles){
 const contents=fs.readFileSync(path.join(generatedSource,file),'utf8');
 addGeneratedReferences(contents);
}

fs.mkdirSync(generatedOutput,{recursive:true});
for(const file of generatedFiles){
 fs.copyFileSync(path.join(generatedSource,file),path.join(generatedOutput,file));
}

console.log(`Prepared Cloudflare static assets in ${path.relative(projectRoot,outputRoot)} with ${generatedFiles.size} generated bundles.`);
