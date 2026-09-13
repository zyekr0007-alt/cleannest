const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const easing='cubic-bezier(.23,1,.32,1)';
// Animation-ready flag: the reveal styles only apply when scripting is available,
// so the service-radius chart can never be left blank.
document.documentElement.classList.add('has-js');
// Meaningful content is available immediately; no blocking brand overlay.
const header=document.querySelector('.header');
let previous=scrollY, direction=0, distance=0;
header?.classList.toggle('is-scrolled',scrollY>24);
window.addEventListener('scroll',()=>{
 const y=Math.max(0,scrollY),delta=y-previous;previous=y;
 // The header is part of the page at the top and only becomes a bar once the
 // page has moved, so the logo never sits behind a seam.
 header?.classList.toggle('is-scrolled',y>24);
 const nextDirection=Math.sign(delta);
 if(nextDirection!==direction){direction=nextDirection;distance=0;}
 distance+=Math.abs(delta);
 if(y<100){header?.classList.remove('header-away');distance=0;return;}
 if(distance<36)return;
 distance=0;
 const menuOpen=document.querySelector('.menu-toggle')?.getAttribute('aria-expanded')==='true';
 header?.classList.toggle('header-away',direction>0&&!menuOpen&&!header.contains(document.activeElement));
},{passive:true});
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const track=carousel.querySelector('.carousel-track'),cards=[...track.children],prev=carousel.querySelector('[data-carousel-prev]'),next=carousel.querySelector('[data-carousel-next]');let index=0,frame=0;
 const update=()=>{frame=0;index=cards.reduce((best,c,i)=>Math.abs(c.offsetLeft-track.offsetLeft-track.scrollLeft)<Math.abs(cards[best].offsetLeft-track.offsetLeft-track.scrollLeft)?i:best,0);carousel.querySelector('.carousel-position').textContent=`${index+1} / ${cards.length}`;prev.disabled=track.scrollLeft<3;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;cards.forEach((c,i)=>c.classList.toggle('is-current',i===index));};
 const go=(delta,keyboard=false)=>{const card=cards[Math.max(0,Math.min(cards.length-1,index+delta))];track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:reduced.matches||keyboard?'instant':'smooth'});if(carousel.dataset.carousel==='reviews'&&!reduced.matches&&!keyboard)card.animate([{transform:'translateY(3px)'},{transform:'translateY(-1px)',offset:.75},{transform:'translateY(0)'}],{duration:250,easing});};
 prev.addEventListener('click',e=>go(-1,e.detail===0));next.addEventListener('click',e=>go(1,e.detail===0));track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1,true);}});
 let drag;track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button,input,label'))return;drag={id:e.pointerId,x:e.clientX,scroll:track.scrollLeft};track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');});track.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id)track.scrollLeft=drag.scroll-(e.clientX-drag.x);});const stop=()=>{drag=null;track.classList.remove('is-dragging');};track.addEventListener('pointerup',stop);track.addEventListener('pointercancel',stop);new ResizeObserver(update).observe(track);carousel.querySelector('.carousel-controls').hidden=false;update();
});
// Native details/summary handles pointer, keyboard and rapid repeated activation.
/* The service-area map is static: every pin is visible on arrival. */

// Service-radius chart: the base first, then the cities outward from it. The
// reveal sets a hidden state and then the final state as real styles, so a paused
// animation clock can only delay the motion — it can never leave a city hidden.
// Nothing is hidden unless the chart is below the fold, the tab is on screen and
// motion is welcome; otherwise the finished chart is shown straight away.
const radiusCharts=[...document.querySelectorAll('.radius-chart')];
const settleChart=chart=>{
 chart.classList.add('is-settled');
 chart.querySelectorAll('[data-reveal]').forEach(el=>{
  // Clearing the inline styles restores the default state, which is fully visible
  // and free for the hover and spotlight rules to act on. It also means a stalled
  // reveal can never leave a mark hidden.
  el.style.transition='';
  el.style.transitionDelay='';
  el.style.opacity='';
  el.style.transform='';
 });
};
const revealChart=chart=>{
 const items=[...chart.querySelectorAll('[data-reveal]')];
 chart.classList.add('is-visible');
 items.forEach(el=>{
  el.style.transition='none';
  el.style.opacity='0';
  if(el.dataset.reveal==='bloom')el.style.transform='scale(0.84)';
  else if(el.dataset.reveal!=='fade')el.style.transform=el.dataset.reveal==='pop'?'scale(0.75)':'translateY(6px)';
 });
 requestAnimationFrame(()=>{
  items.forEach(el=>{
   el.style.transition=el.dataset.reveal==='fade'
    ?'opacity 420ms '+easing
    :el.dataset.reveal==='bloom'
     ?'opacity 620ms '+easing+', transform 760ms '+easing
     :'opacity 420ms '+easing+', transform 470ms '+easing;
   el.style.transitionDelay=(el.dataset.delay||0)+'ms';
   el.style.opacity='1';
   if(el.dataset.reveal!=='fade')el.style.transform='none';
  });
});
 setTimeout(()=>settleChart(chart),2600);
};
radiusCharts.forEach(chart=>{
 // Only reduced motion opts out. A chart that is already on screen when the page
 // loads plays straight away — on a phone that is the common case, because the
 // reader has often arrived with the section in view.
 if(reduced.matches||!'IntersectionObserver'in window){settleChart(chart);return;}
 if(chart.getBoundingClientRect().top<innerHeight*0.9){revealChart(chart);return;}
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  observer.disconnect();
  revealChart(chart);
 },{threshold:.2});
 observer.observe(chart);
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();settleChart(chart);}});
});

// SVG images have no native loading=lazy; hydrate a small viewport look-ahead.
const deferredImages=[...document.querySelectorAll('image[data-href]')];
const reveal=el=>{el.setAttribute('href',el.dataset.href);delete el.dataset.href;};
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.querySelectorAll('image[data-href]').forEach(reveal);observer.unobserve(entry.target);}},{rootMargin:'300px'});document.querySelectorAll('.comparison-card,.result-card').forEach(card=>observer.observe(card));}else deferredImages.forEach(reveal);

// One brief brand entrance per tab visit, with immediate dismissal on interaction.
// The logo arrives once per tab: it fades up in the middle of a white veil, flies
// into the header slot and locks there, and the veil lifts to show the page. This
// is the rare, first-time tier, so the delight budget is spent here — and every
// failure path (paused clock, a scroll, a tap, a hidden tab) ends with the real
// page on screen, never a stuck veil.
const introKey='cleannest-brand-intro-v3';
let brandIntroPlaying=false;
// One sweep of light across the letterforms: the payoff when the entrance lands,
// and the only thing that moves when the entrance has already played this tab.
const shineBrand=()=>{
 const mark=document.querySelector('.header .brand-mark');
 if(!mark)return;
 mark.classList.add('is-shining');
 setTimeout(()=>mark.classList.remove('is-shining'),900);
};
async function introduceBrand(){
 if(reduced.matches||document.visibilityState==='hidden')return;
 try{if(sessionStorage.getItem(introKey))return;}catch{}
 const mark=document.querySelector('.header .brand .brand-wordmark');
 if(!mark)return;
 if(!mark.complete)await Promise.race([new Promise(resolve=>{mark.addEventListener('load',resolve,{once:true});mark.addEventListener('error',resolve,{once:true});}),new Promise(resolve=>setTimeout(resolve,600))]);
 if(!mark.complete||!mark.naturalWidth)return;
 // The mark is an SVG image with a fixed CSS height, so it can be measured as
 // soon as layout settles — no need to hold the entrance for webfonts.
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 if(reduced.matches||scrollY>24)return;
 const rect=mark.getBoundingClientRect();
 if(!rect.width||rect.top>160)return;
 try{sessionStorage.setItem(introKey,'1');}catch{}
 const veil=document.createElement('div'),clone=document.createElement('img');
 veil.className='opening-backdrop';clone.className='opening-wordmark';
 clone.src=mark.getAttribute('src');clone.alt='';
 veil.setAttribute('aria-hidden','true');clone.setAttribute('aria-hidden','true');
 Object.assign(clone.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
 document.body.append(veil,clone);
 brandIntroPlaying=true;
 mark.style.opacity='0';
 const scale=Math.min(2.4,Math.max(1.5,innerWidth*.46/rect.width));
 const start='translate3d('+(innerWidth/2-rect.width/2-rect.left)+'px,'+(innerHeight*.36-rect.height/2-rect.top)+'px,0) scale('+scale+')';
 const motion=clone.animate([{transform:start,opacity:0},{transform:start,opacity:1,offset:.18},{transform:'none',opacity:1}],{duration:880,easing,fill:'forwards'});
 const fade=veil.animate([{opacity:1},{opacity:1,offset:.28},{opacity:0}],{duration:880,easing,fill:'forwards'});
 let done=false;
 const finish=()=>{
  if(done)return;
  done=true;
  brandIntroPlaying=false;
  motion.cancel();fade.cancel();
  clone.remove();veil.remove();
  mark.style.opacity='';
  shineBrand();
  for(const event of ['pointerdown','keydown','scroll','wheel','resize'])window.removeEventListener(event,finish);
  document.removeEventListener('visibilitychange',onHide);
  reduced.removeEventListener('change',finish);
 };
 const onHide=()=>{if(document.visibilityState==='hidden')finish();};
 motion.onfinish=finish;
 // A paused animation clock (a backgrounded tab, a stalled compositor) must never
 // leave the veil covering the site.
 setTimeout(finish,2400);
 for(const event of ['pointerdown','keydown','scroll','wheel','resize'])window.addEventListener(event,finish,{once:true,passive:true});
 document.addEventListener('visibilitychange',onHide);
 reduced.addEventListener('change',finish,{once:true});
}
introduceBrand();
setTimeout(()=>{if(!brandIntroPlaying)shineBrand();},560);

// Gold review stars reveal once on entry and stay still afterwards.
if(!reduced.matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('stars-revealed');observer.unobserve(entry.target);}},{threshold:.7});
 document.querySelectorAll('.golden-stars').forEach(stars=>observer.observe(stars));
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();document.querySelectorAll('.stars-revealed').forEach(el=>el.classList.remove('stars-revealed'));}});
}

// Keep native details semantics; animate between the current and desired height.
// The open state is applied immediately so the DOM is correct at every moment,
// including on rapid repeated activation; the animation is purely visual.
document.querySelectorAll('.faq-list details').forEach(details=>{
 const summary=details.querySelector('summary');let motion;
 summary.addEventListener('click',event=>{
  if(reduced.matches)return;
  event.preventDefault();
  const start=details.getBoundingClientRect().height;
  motion?.cancel();
  const next=!details.open;
  details.open=next;
  const border=parseFloat(getComputedStyle(details).borderTopWidth)+parseFloat(getComputedStyle(details).borderBottomWidth);
  const end=next?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+border;
  motion=details.animate({height:[start+'px',end+'px']},{duration:220,easing});
  motion.onfinish=()=>{motion=null;};
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){motion?.cancel();motion=null;}});
});
