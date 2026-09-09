const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const easing='cubic-bezier(.23,1,.32,1)';
// Meaningful content is available immediately; no blocking brand overlay.
const header=document.querySelector('.header');
let previous=scrollY, direction=0, distance=0;
window.addEventListener('scroll',()=>{
 const y=Math.max(0,scrollY),delta=y-previous;previous=y;
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
document.querySelectorAll('.comparison-card input').forEach(input=>input.addEventListener('input',()=>{const photo=input.closest('.comparison-card').querySelector('.comparison-photo');photo.querySelector('.comparison-after').style.clipPath=`inset(0 0 0 ${input.value}%)`;photo.querySelector('.compare-divider').style.left=input.value+'%';}));
// Native details/summary handles pointer, keyboard and rapid repeated activation.
const animateMap=matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)');
document.querySelectorAll('.zoom-map-card').forEach(card=>{
 const play=()=>{card.classList.remove('map-animating');if(animateMap.matches&&!navigator.connection?.saveData){void card.offsetHeight;card.classList.add('map-animating');}};
 const replay=card.querySelector('.map-replay');if(replay){replay.hidden=!animateMap.matches;replay.addEventListener('click',play);}
 animateMap.addEventListener('change',()=>{card.classList.remove('map-animating');if(replay)replay.hidden=!animateMap.matches;});
 if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){play();obs.disconnect();}},{threshold:.25});obs.observe(card);}
});


// SVG images have no native loading=lazy; hydrate a small viewport look-ahead.
const deferredImages=[...document.querySelectorAll('image[data-href]')];
const reveal=el=>{el.setAttribute('href',el.dataset.href);delete el.dataset.href;};
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.querySelectorAll('image[data-href]').forEach(reveal);observer.unobserve(entry.target);}},{rootMargin:'300px'});document.querySelectorAll('.comparison-card,.result-card').forEach(card=>observer.observe(card));}else deferredImages.forEach(reveal);
