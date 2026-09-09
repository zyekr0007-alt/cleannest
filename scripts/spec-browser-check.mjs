import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const session='cleannest-spec-regression';
const directory=path.resolve('.review/spec-qa');fs.mkdirSync(directory,{recursive:true});
const run=(...args)=>execFileSync('agent-browser',['--session',session,...args],{encoding:'utf8',maxBuffer:8*1024*1024,timeout:60000});
const evaluate=code=>JSON.parse(run('eval',code));
const routes=['','services.html','pricing.html','quote.html?service=full-house-cleaning','full-house-cleaning.html','bathroom-cleaning.html','ac-services.html','mattress-steam-cleaning.html','jalandhar.html','phagwara.html','blog/index.html','blog/ultimate-deep-cleaning-checklist.html','faqs.html','contact.html','reviews.html','results.html'];
const issues=[],checks=[];
const open=route=>run('open',(process.env.QA_BASE_URL||'http://127.0.0.1:8123')+'/'+route+(route.includes('?')?'&':'?')+'qa='+Date.now());
const expect=(value,message)=>{if(!value)issues.push(message);};
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
 expect(evaluate('!document.querySelector(".city-route,.city-label-line,.map-replay")'),'map should have no connector lines or replay');
 expect(evaluate('document.querySelector(".coverage-home").dataset.city==="Jalandhar"&&document.querySelector(".coverage-home").dataset.lat==="31.326015"'),'Jalandhar city-centre marker');
 expect(evaluate('getComputedStyle(document.documentElement).getPropertyValue("--navy").trim().toLowerCase()==="#0a2647"'),'updated navy palette');
 expect(evaluate('[...document.querySelectorAll(".journey-step")].every(e=>Math.abs(e.getBoundingClientRect().top-document.querySelector(".journey-step").getBoundingClientRect().top)<1)'),'booking steps remain horizontal on mobile');
 expect(evaluate('document.querySelectorAll(".quick-contacts [data-brand]").length===2'),'recognizable Instagram and WhatsApp brand SVGs');
 expect(evaluate('document.querySelectorAll("image[data-href]").length>0'),'later carousel images should be deferred');
 run('click','.menu-toggle');
 expect(evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")==="true"&&!document.querySelector("#mobile-nav").inert'),'menu must become accessible');
 run('press','Escape');
 expect(evaluate('document.querySelector("#mobile-nav").inert&&document.activeElement.matches(".menu-toggle")'),'Escape must close menu and return focus');
 run('focus','.result-carousel .carousel-track');run('press','ArrowRight');
 expect(evaluate('document.querySelector(".result-carousel .carousel-track").scrollLeft>0'),'carousel keyboard navigation');
 run('focus','.comparison-card input');run('press','ArrowRight');
 expect(evaluate('document.querySelector(".comparison-after").style.clipPath.includes("51")'),'before/after slider keyboard update');
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
 expect(evaluate('document.querySelector("#quote-builder").dataset.step==="3"'),'quote estimate step');
 const handoff=evaluate('document.querySelector(".whatsapp-send").href');
 expect(new URL(handoff).pathname==='/917610000654'&&new URL(handoff).searchParams.get('text').includes('Local QA'),'WhatsApp handoff recipient/summary');
 // Inspect only: do not click the outbound handoff and do not send an enquiry.
 run('click','#quote-back');expect(evaluate('document.querySelector("#name").value==="Local QA"'),'Back retains local contact details');
 run('set','media','light','reduced-motion');open('');
 expect(evaluate('!document.querySelector(".brand-intro")&&getComputedStyle(document.documentElement).scrollBehavior==="auto"'),'reduced-motion content/scroll');
 expect(evaluate('[...document.querySelectorAll(".stars")].every(e=>getComputedStyle(e,"::after").animationName==="none")'),'reduced motion disables star shimmer');
 console.log('Menu, quote, native FAQ, carousel, comparison slider, dialog and reduced-motion checks completed. No enquiry sent.');
} catch(error){issues.push({executionError:error.message});}
finally {
 fs.writeFileSync(directory+'/report.json',JSON.stringify({checks,issues},null,2));
 run('close');
}
console.log(JSON.stringify({issues},null,2));
if(issues.length)process.exitCode=1;
