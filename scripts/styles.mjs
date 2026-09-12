import fs from 'node:fs';
import crypto from 'node:crypto';
import postcss from 'postcss';
import cssnano from 'cssnano';

export async function buildStyles(){
 const files=[];
 fs.mkdirSync('assets/generated',{recursive:true});
 for(const name of ['base','pages','polish']){
  const from='site/styles/'+name+'.css';
  const {css}=await postcss([cssnano({preset:['default',{normalizeUrl:false,mergeLonghand:false}]})]).process(fs.readFileSync(from,'utf8'),{from,map:false});
  const served=css.replaceAll('url(fonts/','url(../fonts/').replaceAll('url("fonts/','url("../fonts/');
  const hash=crypto.createHash('sha256').update(served).digest('hex').slice(0,12);
  const target='assets/generated/'+name+'-'+hash+'.css';
  // Font URLs are relative to the generated stylesheet's folder.
  fs.writeFileSync(target,served);
  files.push(target);
 }
 return files;
}

export function buildScripts(){
 return ['site','final'].map(name=>{
  const source=fs.readFileSync('assets/'+name+'.js');
  const hash=crypto.createHash('sha256').update(source).digest('hex').slice(0,12);
  const target='assets/generated/'+name+'-'+hash+'.js';
  fs.writeFileSync(target,source);
  return target;
 });
}

export function buildQuoteClient(catalog){
 const write=(name,extension,content)=>{
  const hash=crypto.createHash('sha256').update(content).digest('hex').slice(0,12);
  const file=name+'-'+hash+'.'+extension;
  fs.writeFileSync('assets/generated/'+file,content);
  return file;
 };
 const data=write('catalog','json',JSON.stringify(catalog));
 const estimate=write('estimate','mjs',fs.readFileSync('assets/estimate.mjs','utf8'));
 const icons=write('brand-icons','mjs',fs.readFileSync('assets/brand-icons.mjs','utf8'));
 const ui=write('ui-icons','mjs',fs.readFileSync('assets/ui-icons.mjs','utf8').replace('./brand-icons.mjs','./'+icons));
 const quote=fs.readFileSync('assets/quote-flow.js','utf8').replace('./ui-icons.mjs','./'+ui).replace('./estimate.mjs','./'+estimate).replace('./catalog.json','./'+data);
 return 'assets/generated/'+write('quote-flow','mjs',quote);
}
