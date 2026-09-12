const menu=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
let menuTimer;
function closeMenu(){if(!mobileNav)return;clearTimeout(menuTimer);mobileNav.removeAttribute('data-open');mobileNav.inert=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menuTimer=setTimeout(()=>{mobileNav.hidden=true;},220);}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';if(!open)return closeMenu();clearTimeout(menuTimer);mobileNav.hidden=false;mobileNav.inert=false;menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Close navigation');void mobileNav.offsetHeight;requestAnimationFrame(()=>{if(menu.getAttribute('aria-expanded')==='true')mobileNav.setAttribute('data-open','');});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!mobileNav.hidden&&!e.target.closest('.header'))closeMenu();});
mobileNav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('focusin',e=>{if(menu?.getAttribute('aria-expanded')==='true'&&!e.target.closest('.header'))closeMenu();});
const lightbox=document.querySelector('#lightbox');let imageTrigger;
document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{imageTrigger=button;lightbox.querySelector('svg').setAttribute('viewBox',button.dataset.crop||'0 0 1000 780');lightbox.querySelector('image').setAttribute('href',button.dataset.lightbox);lightbox.showModal();document.body.style.overflow='hidden';}));
lightbox?.querySelector('.dialog-close').addEventListener('click',()=>lightbox.close());
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
lightbox?.addEventListener('close',()=>{document.body.style.overflow='';imageTrigger?.focus();});
let category='All';const search=document.querySelector('#service-search');
function filter(){let visible=0;document.querySelectorAll('.service-card').forEach(card=>{const show=(category==='All'||card.dataset.category===category)&&card.dataset.name.includes((search?.value||'').toLowerCase().trim());card.hidden=!show;if(show)visible++;});const empty=document.querySelector('#no-services');if(empty)empty.hidden=visible!==0;}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();}));search?.addEventListener('input',filter);
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealing');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.section-heading,.care-copy,.process-grid').forEach(el=>observer.observe(el));}
document.querySelectorAll('.map-card').forEach(card=>{
 const select=name=>{card.querySelectorAll('[data-map-city]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapCity===name)));card.querySelectorAll('[data-city]').forEach(pin=>pin.classList.toggle('is-active',pin.dataset.city===name));const caption=card.querySelector('.map-caption');caption.replaceChildren(document.createTextNode(name+' '));const detail=document.createElement('span');detail.textContent=name==='Jalandhar'?'Our home city':'Cleaning available here';caption.append(detail);};
 card.querySelectorAll('[data-map-city]').forEach(b=>{b.addEventListener('click',()=>select(b.dataset.mapCity));b.addEventListener('focus',()=>select(b.dataset.mapCity));b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(b.dataset.mapCity);});});
 select('Jalandhar');
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){card.classList.add('map-ready');const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){card.classList.add('map-visible');observer.disconnect();}},{threshold:.15});observer.observe(card);}
});
