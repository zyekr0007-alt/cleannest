const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const easing='cubic-bezier(.23,1,.32,1)';
// One brief brand entrance per tab visit, with immediate dismissal on interaction.
async function introduceBrand(){
 if(!document.body.classList.contains('home-final')||reduced.matches)return;
 try{if(sessionStorage.getItem('cleannest-brand-intro'))return;sessionStorage.setItem('cleannest-brand-intro','1');}catch{}
 await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,500))]);
 if(reduced.matches||scrollY>20)return;
 const brand=document.querySelector('.header .brand span'),rect=brand.getBoundingClientRect(),style=getComputedStyle(brand);
 const backdrop=document.createElement('div'),logo=document.createElement('span');
 backdrop.className='opening-backdrop';logo.className='opening-wordmark';logo.textContent=brand.textContent;
 backdrop.setAttribute('aria-hidden','true');logo.setAttribute('aria-hidden','true');
 Object.assign(logo.style,{left:rect.left+'px',top:rect.top+'px',font:style.font,letterSpacing:style.letterSpacing,color:style.color,width:rect.width+'px',height:rect.height+'px'});
 document.body.append(backdrop,logo);brand.style.opacity='0';
 const dx=innerWidth/2-(rect.left+rect.width/2),dy=innerHeight*.42-(rect.top+rect.height/2),scale=Math.min(2.1,innerWidth*.68/rect.width);
 const start='translate('+dx+'px,'+dy+'px) scale('+scale+')';
 const motion=logo.animate([{transform:start,opacity:0},{transform:start,opacity:1,offset:.22},{transform:'none',opacity:1}],{duration:1050,easing,fill:'forwards'});
 const veil=backdrop.animate([{opacity:.96},{opacity:.96,offset:.2},{opacity:0}],{duration:1050,easing,fill:'forwards'});
 const stop=()=>{motion.cancel();veil.cancel();logo.remove();backdrop.remove();brand.style.opacity='';for(const event of ['pointerdown','keydown','scroll','resize'])window.removeEventListener(event,stop);reduced.removeEventListener('change',stop);};
 motion.onfinish=stop;
 for(const event of ['pointerdown','keydown','scroll','resize'])window.addEventListener(event,stop,{once:true,passive:true});
 reduced.addEventListener('change',stop,{once:true});
}
introduceBrand();
// Gold SVG stars reveal once on entry and remain still afterwards.
if(!reduced.matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('stars-revealed');observer.unobserve(entry.target);}},{threshold:.7});
 document.querySelectorAll('.golden-stars').forEach(stars=>observer.observe(stars));
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();document.querySelectorAll('.stars-revealed').forEach(e=>e.classList.remove('stars-revealed'));}});
}
// The header scrolls with the page; no scroll-triggered repositioning.
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const track=carousel.querySelector('.carousel-track'),cards=[...track.children],prev=carousel.querySelector('[data-carousel-prev]'),next=carousel.querySelector('[data-carousel-next]');let index=0,frame=0;
 const update=()=>{frame=0;index=cards.reduce((best,c,i)=>Math.abs(c.offsetLeft-track.offsetLeft-track.scrollLeft)<Math.abs(cards[best].offsetLeft-track.offsetLeft-track.scrollLeft)?i:best,0);carousel.querySelector('.carousel-position').textContent=`${index+1} / ${cards.length}`;prev.disabled=track.scrollLeft<3;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;cards.forEach((c,i)=>c.classList.toggle('is-current',i===index));};
 const go=(delta,keyboard=false)=>{const card=cards[Math.max(0,Math.min(cards.length-1,index+delta))];track.scrollTo({left:card.offsetLeft-track.offsetLeft,behavior:reduced.matches||keyboard?'instant':'smooth'});if(carousel.dataset.carousel==='reviews'&&!reduced.matches&&!keyboard)card.animate([{transform:'translateY(3px)'},{transform:'translateY(-1px)',offset:.75},{transform:'translateY(0)'}],{duration:250,easing});};
 prev.addEventListener('click',e=>go(-1,e.detail===0));next.addEventListener('click',e=>go(1,e.detail===0));track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1,true);}});
 let drag;track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button,input,label'))return;drag={id:e.pointerId,x:e.clientX,scroll:track.scrollLeft};track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');});track.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id)track.scrollLeft=drag.scroll-(e.clientX-drag.x);});const stop=()=>{drag=null;track.classList.remove('is-dragging');};track.addEventListener('pointerup',stop);track.addEventListener('pointercancel',stop);new ResizeObserver(update).observe(track);carousel.querySelector('.carousel-controls').hidden=false;update();
});
document.querySelectorAll('.comparison-card input').forEach(input=>input.addEventListener('input',()=>{const photo=input.closest('.comparison-card').querySelector('.comparison-photo');photo.querySelector('.comparison-after').style.clipPath=`inset(0 0 0 ${input.value}%)`;photo.querySelector('.compare-divider').style.left=input.value+'%';}));
// Keep native details semantics; animate between the current and desired height.
document.querySelectorAll('.faq-list details').forEach(details=>{
 const summary=details.querySelector('summary');let motion,expanded=details.open;
 summary.addEventListener('click',event=>{
  if(reduced.matches)return;
  event.preventDefault();expanded=!expanded;
  const start=details.getBoundingClientRect().height;
  motion?.cancel();details.style.height='';details.open=true;
  const border=parseFloat(getComputedStyle(details).borderTopWidth)+parseFloat(getComputedStyle(details).borderBottomWidth);
  const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+border;
  motion=details.animate({height:[start+'px',end+'px']},{duration:220,easing});
  motion.onfinish=()=>{details.open=expanded;motion=null;};
 });
 reduced.addEventListener('change',()=>{if(reduced.matches){motion?.cancel();motion=null;details.open=expanded;}});
});
// SVG images have no native loading=lazy; hydrate a small viewport look-ahead.
const deferredImages=[...document.querySelectorAll('image[data-href]')];
const reveal=el=>{el.setAttribute('href',el.dataset.href);delete el.dataset.href;};
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.querySelectorAll('image[data-href]').forEach(reveal);observer.unobserve(entry.target);}},{rootMargin:'300px'});document.querySelectorAll('.comparison-card,.result-card').forEach(card=>observer.observe(card));}else deferredImages.forEach(reveal);
