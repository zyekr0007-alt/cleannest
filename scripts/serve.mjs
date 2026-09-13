// Local static preview with gzip, matching compression observed on GitHub Pages.
// Does not simulate edge redirects or claim a production hosting change.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=process.cwd();
const port=Number(process.argv.find(a=>a.startsWith('--port='))?.split('=')[1]||8123);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const url=new URL(req.url,'http://127.0.0.1');
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);res.end();return;}
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(404);res.end();return;}
  let status=200;
  try{if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');await fs.access(file);}catch{status=404;file=path.join(root,'404.html');}
  let body=await fs.readFile(file);
  const type=types[path.extname(file)]||'application/octet-stream';
  const headers={'content-type':type,'cache-control':'no-cache','vary':'Accept-Encoding'};
  if(/gzip/.test(req.headers['accept-encoding']||'')&&/text|json|svg|xml/.test(type)){body=gzipSync(body);headers['content-encoding']='gzip';}
  headers['content-length']=body.length;
  res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(500);res.end('Preview server could not read this file.');}
}).listen(port,'127.0.0.1',()=>console.log('Local static preview: http://127.0.0.1:'+port));
