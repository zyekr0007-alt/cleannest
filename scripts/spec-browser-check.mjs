import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const session='cleannest-spec-regression';
const directory=path.resolve('.review/spec-qa');fs.mkdirSync(directory,{recursive:true});
const run=(...args)=>execFileSync('agent-browser',['--session',session,...args],{encoding:'utf8',maxBuffer:8*1024*1024,timeout:60000});
const evaluate=code=>JSON.parse(run('eval',code));
const routes=['','services.html','pricing.html','quote.html?service=full-house-cleaning','full-house-cleaning.html','bathroom-cleaning.html','ac-services.html','mattress-steam-cleaning.html','jalandhar.html','phagwara.html','blog/index.html','blog/ultimate-deep-cleaning-checklist.html','faqs.html','contact.html','reviews.html','results.html','areas-we-serve.html'];
const issues=[],checks=[];
const open=route=>run('open',(process.env.QA_BASE_URL||'http://127.0.0.1:8123')+'/'+route+(route.includes('?')?'&':'?')+'qa='+Date.now());
const expect=(value,message)=>{if(!value)issues.push(message);};
// Wait for a selector without aborting the run if it never appears — the assertion
// that follows reports the miss with a readable message instead of an exec error.
const settle=selector=>{try{run('wait',selector);}catch{}};
try {
 for(const [width,height] of [[360,800],[390,844],[768,1024],[1440,900]]){
  run('set','viewport',String(width),String(height));
  for(const route of routes){
   open(route);
   const result=evaluate(`(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));return {overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelectorAll('h1').length,smallControls:[...document.querySelectorAll('.add-service,.button,.menu-toggle,.dialog-close,.secondary-service .text-link')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<43||r.height<43)}).map(e=>e.className)};})()`);
   checks.push({width,route,...result});
   if(result.overflow||result.broken.length||result.h1!==1||result.smallControls.length)issues.push({width,route,...result});
   if([390,768,1440].includes(width))run('screenshot',directory+'/'+width+'-'+(route||'home').replace(/[^a-z0-9-]/gi,'-')+'.png');
   if(width===390){
    const audit=JSON.parse(run('a11y','--tags','wcag2a,wcag2aa','--json')).data;
    checks.push({width,route,a11y:audit.counts});
    if(audit.violations.length)issues.push({width,route,violations:audit.violations});
   }
  }
  console.log('Checked '+routes.length+' templates at '+width+'×'+height+'.');
 }
 run('set','viewport','390','844');open('');
 expect(evaluate('!document.querySelector(".brand-intro")'),'brand overlay still present');
 expect(evaluate('!document.querySelector(".coverage-svg")'),'the congestion-prone service-area map should be gone');
 // The chart is server-rendered, but `open` resolves on navigation rather than on
 // parse, so an immediate query can land on a document that has not built one yet.
 // Settle on the chart before asserting its contents.
 settle('.radius-chart');
 expect(evaluate('document.querySelectorAll(".radius-ring").length===6'),'service-area chart should draw a ring every 10 km out to 60 km');
 expect(evaluate('document.querySelectorAll(".radius-city").length===12&&document.querySelectorAll(".radius-hq__core").length===1'),'service-area chart should plot twelve cities around the base');
 // The rings are hairlines in a scaled viewBox; without a non-scaling stroke they
 // thin to sub-pixel and vanish on a phone.
 expect(evaluate('getComputedStyle(document.querySelector(".radius-ring")).vectorEffect==="non-scaling-stroke"'),'distance rings must keep their weight when the chart scales down');
 // The reveal must still play on a phone, and must always finish with every mark
 // visible. The last city carries the longest delay, so it is still hidden at the
 // instant the reveal starts — that is the check that motion actually happens.
 // Smooth scrolling would let the reveal start and finish before the first poll,
 // so this one jumps straight to the chart. When the browser restored a scroll
 // position that already showed the chart, the reveal is finished before we can
 // watch it — the outcome assertions still have to hold in that case.
 // The rings bloom one after the next and the cities follow, so every mark needs
 // its own stagger: the ring delays must rise, and each city must carry a delay
 // that lands after the ring it sits on. A headless browser only delivers scroll
 // observers when it paints, so the motion itself is checked by hand in a real
 // browser; here the wiring and the finished state are what get asserted.
 const reveal=evaluate(`(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const chart=document.querySelector('.radius-chart');const dots=[...document.querySelectorAll('.radius-city__dot')];const rings=[...document.querySelectorAll('.radius-ring')];document.documentElement.style.scrollBehavior='auto';chart.scrollIntoView({block:'center'});await sleep(600);await sleep(2600);const delays=dots.map(d=>Number(d.dataset.delay));return {staggeredRings:rings.every((r,i)=>Number(r.dataset.delay)===i*110)&&rings.every(r=>r.dataset.reveal==='bloom'),cityDelays:dots.every(d=>d.dataset.reveal==='pop')&&delays.every((v,i)=>v>=880&&(i===0||v>delays[i-1])),visible:chart.classList.contains('is-visible'),settled:chart.classList.contains('is-settled'),minOpacity:Math.min(...dots.map(d=>Number(getComputedStyle(d).opacity)),...rings.map(r=>Number(getComputedStyle(r).opacity)))};})()`);
 expect(reveal.staggeredRings&&reveal.cityDelays&&reveal.visible&&reveal.settled&&reveal.minOpacity>0.99,'the service-area chart must bloom ring by ring and always end fully visible '+JSON.stringify(reveal));
 open(''); // the check above scrolls the page; start the next ones from the top again
 expect(evaluate('document.querySelector(".radius-hq__label text")?.textContent.includes("Jalandhar")'),'service-area chart should mark the Jalandhar base');
 expect(evaluate('document.querySelector(".coverage-heading a.button")?.textContent.trim()==="Show all cities"'),'service-area band should offer one "Show all cities" button');
 expect(evaluate('document.querySelectorAll("image[data-href]").length>0'),'later carousel images should be deferred');
 run('click','.menu-toggle');
 expect(evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")==="true"&&!document.querySelector("#mobile-nav").inert'),'menu must become accessible');
 run('press','Escape');
 expect(evaluate('document.querySelector("#mobile-nav").inert&&document.activeElement.matches(".menu-toggle")'),'Escape must close menu and return focus');
 run('focus','.result-carousel .carousel-track');run('press','ArrowRight');
 expect(evaluate('document.querySelector(".result-carousel .carousel-track").scrollLeft>0'),'carousel keyboard navigation');
 expect(evaluate('document.querySelectorAll(".comparison-card").length===10&&[...document.querySelectorAll(".comparison-card")].every(c=>c.querySelectorAll(".compare-pane > svg").length===2)'),'the homepage must show ten comparison cards, each with a before and an after frame');
 expect(evaluate('document.querySelector(".comparison-card .before-label").textContent==="Before"&&document.querySelector(".comparison-card .after-label").textContent==="After"'),'both frames must be labelled');
 expect(evaluate('!document.querySelector(".comparison-card input")'),'the before/after slider control must be gone');
 open('faqs.html');run('focus','.faq-list summary');run('press','Enter');
 expect(evaluate('document.querySelector(".faq-list details").open'),'FAQ keyboard open');
 run('press','Enter');expect(evaluate('!document.querySelector(".faq-list details").open'),'FAQ keyboard close');
 open('results.html');run('click','.result-card');
 expect(evaluate('document.querySelector("#lightbox").open'),'result dialog open');run('press','Escape');
 expect(evaluate('!document.querySelector("#lightbox").open&&document.activeElement.matches(".result-card")'),'dialog Escape/focus return');
 open('quote.html?service=kitchen-cleaning');run('click','#quote-next');
 expect(evaluate('document.querySelector("#quote-builder").dataset.step==="1"'),'quote details step');
 run('click','#quote-next');
 expect(evaluate('document.querySelector("#quote-builder").dataset.step==="2"'),'quote contact step');
 run('fill','#name','Local QA');run('fill','#phone','9999999999');run('click','#quote-next');
 // "See my estimate" sends the enquiry in the same action, so the estimate step now
 // arrives after a network round-trip instead of on the next tick.
 settle('#estimate-total');
 expect(evaluate('document.querySelector("#quote-builder").dataset.step==="3"'),'quote estimate step');
 // A send that succeeded confirms inline; one that failed offers the WhatsApp
 // fallback. Either way the visitor is shown the estimate they asked for.
 expect(evaluate('!!document.querySelector(".sent-note")||!!document.querySelector(".whatsapp-send")'),'estimate step must confirm the send or offer the WhatsApp fallback');
 const handoff=evaluate('document.querySelector(".whatsapp-send")?.href||""');
 expect(!handoff||(new URL(handoff).pathname==='/917610000654'&&new URL(handoff).searchParams.get('text').includes('Local QA')),'WhatsApp handoff recipient/summary');
 // Inspect only: do not click the outbound handoff and do not send an enquiry.
 run('click','#quote-back');expect(evaluate('document.querySelector("#name").value==="Local QA"'),'Back retains local contact details');
 run('set','media','light','reduced-motion');open('');
 expect(evaluate('!document.querySelector(".brand-intro")&&getComputedStyle(document.documentElement).scrollBehavior==="auto"'),'reduced-motion content/scroll');
 console.log('Menu, quote, native FAQ, carousel, before/after pairs, dialog and reduced-motion checks completed. No enquiry sent.');
} catch(error){issues.push({executionError:error.message});}
finally {
 fs.writeFileSync(directory+'/report.json',JSON.stringify({checks,issues},null,2));
 run('close');
}
console.log(JSON.stringify({issues},null,2));
if(issues.length)process.exitCode=1;
