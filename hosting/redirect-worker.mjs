// Edge entry point for the active Cloudflare routes on both CleanNest hosts.
// Pages is the origin; the worker keeps legacy redirects without blocking
// automatic Pages deployments.
import {redirectTarget} from '../site/redirects.mjs';
const pagesOrigin='https://cleannest.pages.dev';

function pagesRequest(request){
  const target=new URL(request.url);
  target.protocol='https:';
  target.hostname=new URL(pagesOrigin).hostname;
  // Pages serves generated .html files through its clean extensionless route.
  // Keep the public .html URL and canonical metadata while avoiding a client
  // redirect away from the site's established URLs.
  if(target.pathname==='/index.html') target.pathname='/';
  else if(target.pathname.endsWith('.html')) target.pathname=target.pathname.slice(0,-5);
  return new Request(target,request);
}

export default {
  async fetch(request) {
    const target = redirectTarget(request.url);
    if (target) return Response.redirect(target, 301);
    return fetch(pagesRequest(request));
  },
};
