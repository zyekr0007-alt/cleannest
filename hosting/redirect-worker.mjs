// Optional edge entry point; NOT active on GitHub Pages.
// Attach to both CleanNest hostnames only after owner approves edge setup.
import {redirectTarget} from '../site/redirects.mjs';
export default {
  async fetch(request) {
    const target = redirectTarget(request.url);
    if (target) return Response.redirect(target, 301);
    return fetch(request);
  },
};
