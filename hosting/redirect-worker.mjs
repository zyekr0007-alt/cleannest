// Edge entry point for the Cloudflare-hosted site and its private preview.
import {redirects, redirectTarget} from '../site/redirects.mjs';

export function edgeRedirectTarget(input) {
  const url = new URL(input);
  const productionTarget = redirectTarget(url);
  if (productionTarget) return productionTarget;

  // Keep the workers.dev deployment self-contained so every redirect can be
  // verified before the canonical domain is moved from Wix DNS.
  const destination = redirects[url.pathname];
  if (destination) return url.origin + destination + url.search;
  return null;
}

function isPreviewHost(hostname) {
  return hostname.endsWith('.workers.dev');
}

function previewResponse(response) {
  const copy = new Response(response.body, response);
  copy.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return copy;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = edgeRedirectTarget(url);
    if (target) return Response.redirect(target, 301);

    // With HTML handling disabled, explicit .html URLs remain canonical. The
    // homepage is the one intentional exception and is served at the root.
    const assetUrl = new URL(url);
    if (assetUrl.pathname === '/') assetUrl.pathname = '/index.html';
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
    return isPreviewHost(url.hostname) ? previewResponse(response) : response;
  },
};
