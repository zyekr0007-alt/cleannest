import {uiIcon} from '../assets/ui-icons.mjs';
export const glyph=uiIcon;
// The supplied logo, kept as vector so it stays sharp at any header size.
// The mark sits in its own box so a sheen can sweep across the letterforms only:
// the same SVG is used as a CSS mask, so the highlight follows the glyphs.
export const wordmark='<span class="brand-mark"><img class="brand-wordmark" src="assets/img/wordmark.svg" width="4779" height="1050" alt="" decoding="async" fetchpriority="high"><span class="brand-sheen" aria-hidden="true"></span></span>';
// Decorative sky layer. Fixed, blurred and animated on transform only, so it
// never touches layout and stays off the main thread.
export const aurora='<div class="aurora" aria-hidden="true"><span class="aurora__blob"></span><span class="aurora__blob"></span><span class="aurora__blob"></span></div>';
// Each entry is one row of the menu. Reviews and the journal are deliberately
// absent: both are already reachable from the page they belong to — reviews from
// Our work, the journal from FAQs — so the menu only names the seven destinations.
const links=[['services.html','Services','services','A clean for every corner'],['about.html','About us','people','Meet CleanNest'],['pricing.html','Pricing','price','Clear, upfront ranges'],['results.html','Our work','work','See the difference'],['areas-we-serve.html','Service areas','pin','Jalandhar & nearby cities'],['contact.html','Contact us','quote','Let’s talk'],['faqs.html','FAQs','help','Quick answers']];
const navLinks=[['services.html','Services'],['results.html','Our work'],['pricing.html','Pricing'],['reviews.html','Reviews'],['contact.html','Contact us']];
export const navigation=active=>`<a class="skip-link" href="#main">Skip to content</a>${aurora}<header class="header"><div class="container header-inner"><a class="brand" href="/" aria-label="CleanNest home">${wordmark}</a><nav class="desktop-nav" aria-label="Main navigation">${navLinks.map(([url,label])=>`<a href="${url}" ${active===url?'aria-current="page"':''}>${label}</a>`).join('')}</nav><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span class="menu-label">Menu</span><span class="menu-lines"><i></i><i></i><i></i></span></button></div><nav id="mobile-nav" class="mobile-nav" aria-label="All pages" hidden inert><div class="menu-inner"><p class="menu-heading">A little help finding your way.</p><div class="menu-grid">${links.map(([url,label,icon,detail])=>`<a class="menu-row" href="${url}"${active===url?' aria-current="page"':''}><span class="menu-icon">${glyph(icon)}</span><span class="menu-copy"><strong>${label}</strong><small>${detail}</small></span></a>`).join('')}</div></div></nav></header>`;
// Three steps, each one a real destination. They stack at every width and the
// rail is drawn as a connector between one step's icon and the next, so the
// sequence reads as a single path rather than three loose boxes.
const steps=[
 ['price','Get a quote','Tell us what needs cleaning and see a guide price.','quote.html','Start an estimate'],
 ['calendar','Book your service','Pick a day that suits you. We confirm the scope first.','contact.html','Talk to the team'],
 ['spark','Enjoy a clean home','The team arrives, works and leaves the place fresh.','results.html','See our work']
];
export const simpleProcess=()=>`<section class="process-wrap"><div class="section container"><div class="process-head"><div><span class="eyebrow">THREE STEPS. NOTHING COMPLICATED.</span><h2>A clean home,<br>made simple.</h2></div></div><div class="simple-steps">${steps.map(([icon,title,caption,href,cta],i)=>`<a class="step-card concentric" href="${href}"><span class="step-icon">${glyph(icon)}</span><span class="step-body"><span class="step-kicker">0${i+1}</span><h3>${title}</h3><p>${caption}</p><span class="step-cta"><span class="step-cta-label">${cta}</span>${glyph()}</span></span></a>`).join('')}</div></div></section>`;
export const simpleCare=()=>`<section class="care-section container"><div class="care-image"><img src="assets/img/editorial/wooden-floor.webp" alt="A sunlit living room with freshly cleaned wooden flooring" width="1200" height="900" loading="lazy"></div><div class="care-copy"><span class="eyebrow">YOUR HOME. IN GOOD HANDS.</span><h2>Good people.<br>Thoughtful care.</h2><div class="care-benefits">${[['people','Trained team'],['shield','Background checked'],['leaf','Family-safe products'],['redo','Free re-clean promise']].map(([icon,text])=>`<div class="care-benefit"><span>${glyph(icon)}</span><h3>${text}</h3></div>`).join('')}</div><a class="text-link" href="about.html">Get to know CleanNest ${glyph()}</a></div></section>`;
