import fs from 'node:fs';
import {resultContext,orderResults} from '../site/results.mjs';
import {buildStyles,buildScripts,buildQuoteClient} from './styles.mjs';
const stylesheets=await buildStyles();
const scripts=buildScripts();
import {blogArticles,renderArticle} from '../site/blog.mjs';
import {redirects} from '../site/redirects.mjs';
import {cityPage} from '../site/city-content.mjs';
import {serviceContent,safeInclusions} from '../site/service-content.mjs';
import {businessInfo} from '../site/business.mjs';
import {booking} from '../site/booking.mjs';
import {pageSchema} from '../site/seo.mjs';
import {servicesFinal,pricingFinal,reviewsFinal,areasFinal,faqsFinal} from '../site/final-pages.mjs';
import {homepage,footerFinal,closingFinal,reviewData,reviewCard,cardSrcset,ratingPills} from '../site/final-home.mjs';
import {coverageMap} from '../site/map.mjs';
import {glyph,navigation,wordmark,simpleProcess,simpleCare} from '../site/components.mjs';
import {goldenStars} from '../site/review-design.mjs';
import {services,extras,cities,slug,homes,groups,money,supplements,address,faqs,faqSections,source} from '../site/catalog.mjs';
import {byName} from '../site/geo.mjs';
// The quote UI renders these images at 100px and 52px, so the client payload gets
// the thumbnails rather than the 880–1536px originals.
const clientImage=image=>image?image.replace('.webp','-thumb.webp'):image;
const clientCatalog={services:services.map(({includes,faqs,...service})=>({...service,image:clientImage(service.image)})),extras:extras.map(extra=>({...extra,image:clientImage(extra.image)})),groups,homes,cities,supplements,booking,kitchenIncludesChimney:false};
const clientScript=buildQuoteClient(clientCatalog);
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const icon=glyph;
const quote=(id='',label='Get a free quote',style='primary')=>`<a class="button ${style}" href="quote.html${id?'?service='+id:''}">${label}${icon()}</a>`;
const brand=wordmark;
// The service hero is the LCP element on every detail page and renders between
// 320px and 545px wide, so naming that layout lets the browser take the 640px
// variant on a phone instead of always pulling the 1536px original.
const heroSrcset=image=>image.includes('hero.webp')
 ?` srcset="assets/img/editorial/hero-640.webp 640w, assets/img/editorial/hero-960.webp 960w, assets/img/editorial/hero-1200.webp 1200w, ${image} 1536w" sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 545px"`
 :'';
const header=navigation;
const footer=footerFinal;
const cta=closingFinal;
const faqBlock=(items=faqs.slice(0,4))=>`<div class="faq-list">${items.map(([q,a])=>`<details><summary>${esc(q)}${icon('plus')}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
const sectionHead=(eyebrow,title,description='',link='')=>`<div class="section-heading"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>${link}</div>`;
const serviceCard=(s,i=0)=>`<article class="service-card" data-category="${s.category}" data-name="${esc(s.name.toLowerCase())}"><a class="service-image" href="${s.id}.html"><img src="${s.image}"${cardSrcset(s.image)} alt="${esc(s.name)} service illustration" width="880" height="660" loading="lazy"><span class="image-action" aria-label="View ${esc(s.name)}">${icon()}</span>${i===0?'<span class="image-tag">THE WHOLE-HOME RESET</span>':''}</a><div class="service-title"><h3><a href="${s.id}.html">${s.name}</a></h3><a class="add-service" href="quote.html?service=${s.id}" aria-label="Get estimate for ${esc(s.name)}">${icon('plus')}</a></div><p>${s.tagline}</p><span class="service-price">${s.price}</span></article>`;
const serviceGrid=(list=services.slice(0,6))=>`<div class="service-grid">${list.map(serviceCard).join('')}</div>`;
const reviews=()=>`<section class="section container" id="reviews">${sectionHead('GOOD WORDS, FROM REAL HOMES','The kind of clean<br>people talk about.','','<a class="text-link" href="'+businessInfo.map+'" target="_blank" rel="noopener">Read our Google reviews '+icon()+'</a>')}<div class="review-grid">${reviewData.map(([name,text],i)=>reviewCard(name,text,i,reviewData.length)).join('')}</div></section>`;
const resultFiles=orderResults(fs.readdirSync('assets/img/results/previews').filter(f=>f.startsWith('before-after-')&&f.endsWith('.webp')).map(f=>f.replace('.webp','')));
const cropBox=f=>/before-after-0[24]-/.test(f)?'0 267 1000 585':f.includes('single')?'0 140 1000 615':'0 0 1000 780';
// Each preview is one composite: before in the left half, after in the right. The
// gallery trims away the composite's surrounding margin and labels both halves, so
// the pair reads without the visitor having to work out which side is which. The
// lightbox still opens the whole original frame.
const resultCard=(f,i)=>`<article class="result-entry"><button class="result-card" data-lightbox="assets/img/results/previews/${f}.webp" data-crop="0 0 1000 1000" aria-label="Open ${resultContext(f).subject.toLowerCase()} result ${i+1}"><span class="result-crop"><svg viewBox="30 20 940 745" role="img" aria-label="${resultContext(f).subject} before and after cleaning, result ${i+1}"><image ${i<3?'href':'data-href'}="assets/img/results/previews/${f}.webp" width="1000" height="1000"/></svg><span class="compare-label before-label">Before</span><span class="compare-label after-label">After</span></span><span class="result-meta"><span class="result-subject"><strong>${resultContext(f).subject}</strong><small>Result ${String(i+1).padStart(2,'0')}</small></span><span class="result-open">${icon()}</span></span></button></article>`;
const lightbox=`<dialog id="lightbox" class="lightbox" aria-label="Cleaning result"><button class="dialog-close" aria-label="Close image">×</button><div class="lightbox-photo"><svg viewBox="0 0 1000 780" role="img" aria-label="Selected CleanNest cleaning result"><image width="1000" height="1000"/></svg></div></dialog>`;
function home(){return homepage({simpleProcess,simpleCare,faqBlock});}
const pageIntro=(tag,title,sub='')=>`<section class="page-intro container"><span class="eyebrow">${tag}</span><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</section>`;
function servicesPage(){return servicesFinal();}
function detail(s){
 const content=serviceContent[s.id];
 const title=content.title;
 const includes=safeInclusions[s.id]||s.includes;
 const questions=[
  [`What should I share when booking ${title.toLowerCase()}?`,content.sections[0][1]],
  [`How is the price for ${title.toLowerCase()} confirmed?`,`The published guide is ${s.price}. Share the size, condition and access details for your job. We confirm the scope, price and available date before booking.`],
 ];
 if(s.id==='kitchen-cleaning')questions.push(faqSections[0][1][2]);
 if(s.id==='bathroom-cleaning')questions.push(['Can every hard-water mark be removed?','Limescale deposits and permanent surface damage can look similar. Share photos of the affected tiles, glass or fittings so the team can assess treatment. Complete stain removal is not guaranteed.']);
 if(s.id==='sofa-cleaning')questions.push(['When can I use my sofa again?','Drying usually takes 1–2 hours, depending on fabric, sofa condition, moisture, ventilation and weather. Wait until the sofa is dry before use.']);
 if(s.id==='ac-services')questions.push(['Does AC cleaning include gas refilling?','No. Gas refilling and repairs are separate from the cleaning scope. Tell us about cooling faults when requesting a quote.']);
 return `<section class="service-hero container"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="services.html">Services</a> / ${esc(title)}</nav><span class="eyebrow">${s.category.toUpperCase()} · JALANDHAR & NEARBY</span><h1>${esc(title)}<br><em>in Jalandhar</em></h1><p>${s.tagline}</p><span class="detail-price">${s.price}</span>${quote(s.id,'Build my estimate')}<span class="muted">Final scope and price confirmed before booking.</span></div><img src="${s.image}"${heroSrcset(s.image)} alt="${esc(s.name)} service illustration" width="880" height="660" fetchpriority="high"></section>
 <section class="section container detail-layout"><div><h2>What’s included in ${esc(title.toLowerCase())}</h2><ul class="inclusion-grid">${includes.map(t=>`<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul><p class="muted">Tell us about delicate materials, existing damage or particular concerns before the visit. We’ll agree the scope and suitable treatment with you.</p></div><aside class="note-card"><h2>${esc(title)} prices</h2><p>${s.price}</p><p>See the <a class="text-link" href="pricing.html">central rate card</a> for units, options and ranges.</p>${quote(s.id,'Personalise my clean')}<p class="small">${esc(booking.payment)}</p></aside></section>
 <section class="container service-guidance"><section><h2>What our team brings</h2><p>${esc(booking.equipment)}</p><p>${esc(booking.reclean)}</p></section>${content.sections.map(([heading,body])=>`<section><h2>${esc(heading)}</h2><p>${esc(body)}</p></section>`).join('')}${content.guide?`<p><a class="text-link" href="blog/${content.guide}.html">Read our ${esc(title.toLowerCase())} guide ${icon()}</a></p>`:''}</section>
 <section class="section container faq-section"><div><span class="eyebrow">BEFORE WE VISIT</span><h2>${esc(title)} FAQs</h2></div>${faqBlock(questions)}</section>
 <section class="section container">${sectionHead('RELATED SERVICES','Other cleaning you may need')}${serviceGrid(content.related.map(id=>services.find(v=>v.id===id)))}</section>${cta()}`;
}
function pricePage(){return pricingFinal();}
function areas(){return areasFinal();}
function city(c){return cityPage(c);}
function contact(){return pageIntro('WE’RE HERE TO HELP','Let’s talk<br>about your space.','A quick question or a whole-home reset. Our local team is ready to help.')+`<section class="container contact-grid"><div class="contact-panel"><span class="eyebrow">START A CONVERSATION</span><a href="tel:${businessInfo.telephone}">${icon('phone')}<span><small>Call or WhatsApp</small>${businessInfo.displayPhone}</span>${icon()}</a><a href="mailto:${businessInfo.email}">${icon('mail')}<span><small>Email us</small>${businessInfo.email}</span>${icon()}</a><div class="contact-line">${icon('clock')}<span><small>Working hours</small>${businessInfo.hours}</span></div><p class="small">Same-day appointments are subject to availability.</p>${quote('','Build a cleaning estimate')}</div><div class="office-panel"><span class="eyebrow">OUR JALANDHAR OFFICE</span><h2>A local team,<br>close to home.</h2><address>${address}</address><a class="text-link" href="${businessInfo.map}" target="_blank" rel="noopener">Get directions ${icon('external')}</a><hr><p>Serving ${cities.join(', ')}.</p><a class="text-link" href="areas-we-serve.html">See service areas ${icon()}</a></div></section>${cta()}`;}
function about(){return pageIntro('A LITTLE ABOUT CLEANNEST','Care you can see.<br>People you can trust.','Professional home and commercial cleaning, rooted in Jalandhar.')+`<section class="container care-section"><div class="care-image"><img src="assets/img/editorial/hero.webp"${heroSrcset('assets/img/editorial/hero.webp')} alt="A calm, clean living room — illustrative interior" width="1536" height="1024"></div><div class="care-copy"><span class="eyebrow">OUR APPROACH</span><h2>Your home deserves<br>thoughtful hands.</h2><p>A good clean is about the details: the edge of a tile, the fabric of a favourite sofa, the way everything is put back afterwards.</p><p>Our trained, background-checked team combines professional equipment with care for your home. We explain the scope and price before we begin, and keep you informed throughout.</p><a class="text-link" href="contact.html">Meet your local team ${icon()}</a></div></section><section class="section container"><div class="process-grid">${[['shield','People you can trust','Trained and background-checked professionals who treat your space with respect.'],['leaf','Care that fits your home','Suitable products and cleaning methods, with attention to children, pets and sensitive surfaces.'],['check','We stand by our work','If we miss an area in the agreed scope, tell us. We’ll arrange a free re-clean.']].map(([i,t,p])=>`<article>${icon(i)}<h3>${t}</h3><p>${p}</p></article>`).join('')}</div></section>${reviews()}${cta()}`;}
function quotePage(){return pageIntro('A FEW TAPS TO A FRESH START','Your home.<br>Your estimate.','Pick your services. We’ll take it from there.')+`<section class="container quote-layout" id="quote-builder"><div class="quote-main concentric"><ol class="quote-steps" aria-label="Quote progress"><li data-step-label="0">01 <span>Services</span></li><li data-step-label="1">02 <span>Details</span></li><li data-step-label="2">03 <span>Contact</span></li><li data-step-label="3">04 <span>Estimate</span></li></ol><form id="quote-form"><div id="quote-stage"></div><div class="quote-navigation"><button class="button secondary" type="button" id="quote-back">${icon('back')} Back</button><button class="button primary" type="submit" id="quote-next">Next ${icon()}</button></div></form><aside class="booking-expectations"><h2>What happens next?</h2><p>${esc(booking.response)}</p><p>${esc(booking.payment)}</p><p>${esc(booking.cancellation)}</p><a class="text-link" href="refund.html">Read the booking and refund policy ${icon()}</a></aside><noscript><p>The quote builder needs JavaScript. <a href="${businessInfo.whatsapp}">Get a quote on WhatsApp</a> or call <a href="tel:${businessInfo.telephone}">${businessInfo.displayPhone}</a>.</p></noscript></div></section>`;}
function tidyMain(html){return html.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/\s(?:class|style|id|data-[\w-]+)="[^"]*"/g,'').replace(/<svg\b[\s\S]*?<\/svg>/g,'').replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,'').replaceAll('href="../','href="').replaceAll('src="../','src="');}
function legacy(name,p){if(name.startsWith('blog/'))return pageIntro('THE CLEANING JOURNAL',esc(p.h1||p.title.split('|')[0]))+`<article class="container prose">${tidyMain(p.main)}</article>`;return pageIntro('CLEANNEST',esc(p.h1||p.title.split('|')[0]))+`<article class="container prose">${tidyMain(p.main)}</article>`;}
const pages=new Map();
for(const [file,p] of Object.entries(source.pages)) pages.set(file,{...p,body:legacy(file,p)});
const set=(file,title,body,description,options={})=>pages.set(file,{...source.pages[file],title,body,description:description||source.pages[file]?.description||title,...options});
set('index.html','Deep Cleaning Services in Jalandhar | CleanNest',home(),'Thoughtful home and commercial cleaning in Jalandhar and nearby cities. Explore services, real results and build a free WhatsApp cleaning estimate.');
set('services.html','Home & Commercial Cleaning Services | CleanNest',servicesPage());
for(const s of services)set(s.id+'.html',serviceContent[s.id].title+' in Jalandhar | CleanNest',detail(s),`${serviceContent[s.id].title} in Jalandhar: review the cleaning scope, preparation, material limits and published pricing. Request your CleanNest estimate.`);
set('reviews.html','CleanNest Reviews | Google & Justdial Customer Feedback',reviewsFinal(),'Read CleanNest customer review excerpts and explore our Google and Justdial profiles. Professional cleaning in Jalandhar and nearby cities.');
set('pricing.html','Cleaning Prices & Free Estimates | CleanNest',pricePage());
set('areas-we-serve.html','Cleaning Service Areas in Punjab | CleanNest',areas());
// Service-area pages are indexable: each carries its own distance, direction,
// ring and neighbouring towns, so they are not near-duplicates of one another.
for(const c of cities){
 const geo=byName[c];
 const description=geo
  ?`Deep cleaning in ${c}, roughly ${Math.round(geo.km)} km ${geo.direction} of our Jalandhar base in ${geo.band.label}. Full home, kitchen, bathroom, sofa and commercial cleaning, with a tailored estimate.`
  :`Deep cleaning in Jalandhar, our home city. Full home, kitchen, bathroom, sofa and commercial cleaning, with scope, price and date agreed before we start.`;
 set(slug(c)+'.html',`Deep Cleaning Services in ${c} | CleanNest`,city(c),description,{cityClassification:c==='Jalandhar'?'KEEP + IMPROVE':'SERVICE AREA'});
}
for(const c of ['Dasuya','Hariana'])set(slug(c)+'.html',`Cleaning Enquiries in ${c} | CleanNest`,city(c,false),`Contact CleanNest to check cleaning availability for your location in ${c}. Scope, travel and booking dates confirmed on WhatsApp.`,{noindex:true});
set('results.html','Real Before & After Cleaning Results | CleanNest',pageIntro('OUR WORK, UP CLOSE','The difference<br>you can see.','Authentic before-and-after photographs from CleanNest’s existing project gallery.')+`<section class="container results-grid gallery-all">${resultFiles.map(resultCard).join('')}</section><nav class="container result-services" aria-label="Results by service"><span>See the full scope for</span><a href="bathroom-cleaning.html">Bathroom cleaning ${icon()}</a><a href="floor-renewal.html">Floor cleaning ${icon()}</a><a href="post-construction-cleaning.html">Post-construction cleaning ${icon()}</a></nav><noscript><section class="container prose"><h2>All result photographs</h2><ul>${resultFiles.map((f,i)=>`<li><a href="assets/img/results/previews/${f}.webp">View cleaning result ${i+1}</a></li>`).join('')}</ul></section></noscript><section class="section container"><div class="section-heading"><div><span class="eyebrow">GOOD WORDS, FROM REAL HOMES</span><h2>The kind of clean people talk about.</h2></div><a class="text-link" href="reviews.html">Read review excerpts ${icon()}</a></div><div class="review-head">${ratingPills()}<p class="review-note">Each card is an excerpt from a public Google review.</p></div><div class="review-grid">${reviewData.map(([name,text],i)=>reviewCard(name,text,i,reviewData.length)).join('')}</div></section>${cta()}`);
set('contact.html','Contact CleanNest | Cleaning Services in Jalandhar',contact());
set('about.html','About CleanNest | Your Local Cleaning Team',about());
set('faqs.html','Cleaning & Booking Questions | CleanNest',faqsFinal());
set('quote.html','Build Your Free Cleaning Estimate | CleanNest',quotePage(),'Personalise your cleaning with home size and optional extras. See an itemized estimate and send your request to CleanNest on WhatsApp.');
// Journal titles carry the brand suffix only when the result still fits a search
// result. Long editorial headlines keep the whole 60 characters for the topic.
const blogTitle=t=>t.length+18<=60?t+' | CleanNest Blog':t;
for(const [id,article] of Object.entries(blogArticles)) {
 set('blog/'+id+'.html',blogTitle(article.title),renderArticle(article),article.description);
 pages.get('blog/'+id+'.html').h1=article.title;
}
// The two Jalandhar pages lead the journal. Array.sort is stable, so every
// other guide keeps the order it was written in.
const journalLead=['cleaning-services-jalandhar','reddit-cleaning-questions-jalandhar'];
const journalRank=f=>{const i=journalLead.indexOf(f.slice(5,-5));return i<0?journalLead.length:i;};
const journalEntries=[...pages.entries()].filter(([f])=>f.startsWith('blog/')&&f!=='blog/index.html'&&blogArticles[f.slice(5,-5)]).sort((a,b)=>journalRank(a[0])-journalRank(b[0]));
set('blog/index.html','Cleaning Journal & Home Care Guides | CleanNest',pageIntro('THE CLEANING JOURNAL','A little know-how.<br>A happier home.','Practical guides to caring for your space between professional cleans.')+`<section class="container journal-grid">${journalEntries.map(([f,p])=>`<article class="journal-card"><span class="eyebrow">HOME CARE GUIDE</span><h2><a href="${f}">${esc(p.h1||p.title.split('|')[0])}</a></h2><p>${esc(p.description)}</p><a class="text-link" href="${f}">Read the guide ${icon()}</a></article>`).join('')}</section>`);
const aliases=Object.entries(source.pages).filter(([f,p])=>f.startsWith('blog/')&&f!=='blog/index.html'&&!p.main).map(([f])=>f);
for(const f of aliases){const aliasLabel=f.slice(5,-5).split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');set(f,aliasLabel+' | CleanNest',pageIntro('CLEANNEST GUIDES','Find current<br>cleaning information.',`This page has moved. Continue to the current CleanNest guidance on ${aliasLabel.toLowerCase()}.`)+`<div class="container error-actions"><a class="button primary" href="${redirects['/'+f]}">View current information ${icon()}</a></div>`,`Moved page. Continue to the current CleanNest guidance on ${aliasLabel.toLowerCase()}, including scope, preparation and published pricing.`);}
set('404.html','Page Not Found | CleanNest',pageIntro('A LITTLE OUT OF PLACE','Let’s get you<br>back home.','This page may have moved. Your fresh start is still here.')+`<div class="container error-actions"><a class="button primary" href="/">Back to home ${icon()}</a><a class="button secondary" href="services.html">Explore services</a></div>`);
for(const [file,p] of pages){
 const root=file.startsWith('blog/')?'../':'';
 // The blog index is served at /blog/ — /blog/index.html redirects to it — so the
 // canonical and og:url name the URL that actually returns 200.
 const canonical='https://cleannest.in/'+(aliases.includes(file)?redirects['/'+file].slice(1):file==='index.html'?'':file==='blog/index.html'?'blog/':file);
 const s=services.find(s=>file===s.id+'.html');
 const schema=pageSchema({file,page:p,canonical,service:s,isArticle:file.startsWith('blog/')&&file!=='blog/index.html'&&!aliases.includes(file),metadata:blogArticles[file.slice(5,-5)]});
 let html=`<!doctype html><html lang="en-IN" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(p.title)}</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${canonical}"><meta name="theme-color" content="#F8F7F4"><meta property="og:type" content="${blogArticles[file.slice(5,-5)]?'article':'website'}"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://cleannest.in/assets/img/editorial/hero.webp"><meta name="twitter:card" content="summary_large_image"><noscript><style>.comparison-card:nth-child(n+3),.gallery-all .result-entry:nth-child(n+4){display:none}</style></noscript><link rel="icon" type="image/png" sizes="64x64" href="assets/favicon.png"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><link rel="preload" href="assets/fonts/DMSerifDisplay.woff2" as="font" type="font/woff2" crossorigin>${stylesheets.filter((_,i)=>i===0||['services.html','pricing.html','reviews.html','areas-we-serve.html','faqs.html'].includes(file)).map(href=>`<link rel="stylesheet" href="${href}">`).join('')}<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>${scripts.map(src=>`<script src="${src}" defer></script>`).join('')}${file==='quote.html'?`<script type="module" src="${clientScript}"></script>`:''}${file==='404.html'||aliases.includes(file)||p.noindex?'<meta name="robots" content="noindex">':''}</head><body class="${file==='index.html'?'home-final':''}">${header(file)}<main id="main" tabindex="-1">${p.body}</main>${footer()}${lightbox}</body></html>`;
 for(const homeLink of ['index.html','../index.html','/index.html','https://cleannest.in/index.html'])html=html.replaceAll('href="'+homeLink+'"','href="/"');
 if(root) html=html.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/)([^"]+)"/g,(_,attr,value)=>`${attr}="${root}${value}"`);
 fs.writeFileSync(file,html.replace(/[\t ]+$/gm,'')+'\n');
}
fs.writeFileSync('assets/catalog.json',JSON.stringify(clientCatalog));
fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...pages.entries()].filter(([f,p])=>!['404.html','quote.html',...aliases].includes(f)&&!p.noindex).map(([f])=>f).map(f=>`<url><loc>https://cleannest.in/${f==='index.html'?'':f}</loc></url>`).join('')+'</urlset>\n');
console.log(`Built ${pages.size} static pages and shared pricing data.`);
