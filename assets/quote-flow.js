import {calculate,priceLabel,formatMoney,includedRates,includedRooms,receiptLines,whatsappMessage} from './estimate.mjs';
import {submitEnquiry,failureMessage} from './enquiry.mjs';
const ICON_ARROW='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const ICON_EXTERNAL='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>';
const ICON_CHECK='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const ICON_PLUS='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const form=document.querySelector('#quote-form'),stage=document.querySelector('#quote-stage'),next=document.querySelector('#quote-next'),back=document.querySelector('#quote-back'),builder=document.querySelector('#quote-builder');
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let catalog;
try{const response=await fetch(new URL('./catalog.json',import.meta.url));if(!response.ok)throw Error();catalog=await response.json();}catch{stage.innerHTML='<p class="form-error">Please refresh to load the estimate builder, or <a href="https://wa.me/917610000654">contact us on WhatsApp</a>.</p>';next.hidden=true;back.hidden=true;throw Error('Catalog unavailable');}
const options=[...catalog.services,...(catalog.extras||[])];
const rates=Object.fromEntries(catalog.groups.flatMap(g=>g.items).map(r=>[r.id,r]));
const params=new URLSearchParams(location.search),preselected=params.get('service');
let step=0;
const state={selected:options.some(s=>s.id===preselected)?[preselected]:[],configs:{},name:'',phone:'',city:'',locality:'',notes:'',date:''};
const config=id=>{
 if(!state.configs[id]){
  const home=catalog.homes[params.get('home')]?params.get('home'):'',inc=includedRooms(catalog,home);
  state.configs[id]={qty:1,tier:0,home,bathrooms:inc.bathrooms,kitchens:inc.kitchens,recliners:0,floorRate:'tile-floor'};
 }
 return state.configs[id];
};
const service=id=>options.find(s=>s.id===id);
const covered=()=>includedRates(state.selected,catalog);
const effective=()=>state.selected.filter(id=>!covered().has(service(id).rate));
const choice=(s,extra=false)=>{const included=covered().has(s.rate),selected=state.selected.includes(s.id);return `<label class="tap-service ${extra?'extra-service':''} ${included?'included-service':''}">${extra||!s.image?'':`<img src="${s.image}" alt="" width="100" height="75" loading="lazy">`}<span><strong>${s.name}</strong><small>${included?'Included in your selection':s.price}</small></span><input type="checkbox" data-service="${s.id}" ${selected||included?'checked':''} ${included?'disabled':''}><span class="tap-check" aria-hidden="true">${ICON_CHECK}</span></label>`;};
function pills(id,key,label,values){const value=config(id)[key];return `<fieldset class="tap-field"><legend>${label}</legend><div class="tap-options">${values.map(([v,text,sub])=>`<button type="button" class="tap-option" data-id="${id}" data-key="${key}" data-value="${v}" aria-pressed="${String(v)===String(value)}"><strong>${text}</strong>${sub?'<small>'+sub+'</small>':''}</button>`).join('')}</div></fieldset>`;}
function preference(key,label,values){const value=state[key];return `<fieldset class="tap-field"><legend>${label}</legend><div class="tap-options">${values.map(v=>`<button type="button" class="tap-option" data-pref="${key}" data-value="${v}" aria-pressed="${String(v)===String(value)}"><strong>${v}</strong></button>`).join('')}</div></fieldset>`;}
function count(id,key,label,min=1,max=100000){return `<div class="count-field"><span id="label-${id}-${key}">${label}</span><div class="stepper"><button type="button" data-count="-1" data-id="${id}" data-key="${key}" aria-label="Decrease ${label}">−</button><input aria-labelledby="label-${id}-${key}" data-id="${id}" data-key="${key}" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${config(id)[key]}" required><button type="button" data-count="1" data-id="${id}" data-key="${key}" aria-label="Increase ${label}">+</button></div></div>`;}
// The steppers start at what the package already covers and can only go up, so
// every count above the included number is visibly a priced extra.
function roomsNote(id){const inc=includedRooms(catalog,config(id).home),b=rates.bathroom,k=rates['kitchen-add'];
 if(config(id).home==='villa')return 'A villa is quoted after a visit. Tell us the room count and we’ll prepare the estimate with you.';
 const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
 return `Includes ${plural(inc.bathrooms,'bathroom')} and ${plural(inc.kitchens,'kitchen')}. Extra bathrooms ${formatMoney(b.base)}${b.high?' – '+formatMoney(b.high):''} each, extra kitchens ${formatMoney(k.base)}${k.high?' – '+formatMoney(k.high):''} each.`;}
// A full re-render (rather than patching the counters in place) is needed because
// the room-count fields don't exist in the DOM until a bedroom size is chosen —
// see the `c.home` check in details() below.
function applyHomeRooms(id){const inc=includedRooms(catalog,config(id).home);
 config(id).bathrooms=inc.bathrooms;config(id).kitchens=inc.kitchens;
 render(false);
 form.querySelector(`[data-id="${id}"][data-key="home"][data-value="${config(id).home}"]`)?.focus({preventScroll:true});}
function details(id){const s=service(id),c=config(id);let content='';
 if(s.rate==='home'){const inc=includedRooms(catalog,c.home);content=pills(id,'home','How many bedrooms?',[[1,'1 BHK'],[2,'2 BHK'],[3,'3 BHK'],[4,'4 BHK'],['villa','5+ / Villa']])
  // Nothing is included yet until a bedroom size is picked, so the counters and
  // the "Includes N bathrooms" note stay hidden rather than showing a misleading 0.
  +(c.home?`<div class="room-counts">${count(id,'bathrooms','Bathrooms',inc.bathrooms,100)}${count(id,'kitchens','Kitchens',inc.kitchens,100)}</div><p class="included-note" id="note-${id}">${roomsNote(id)}</p>`:'<p class="included-note">Choose a bedroom size above to see what’s included.</p>');}
 else if(s.rate){const r=rates[s.id==='floor-renewal'?c.floorRate:s.rate];
  if(s.id==='floor-renewal')content+=pills(id,'floorRate','Floor material',['tile-floor','marble','granite','italian-marble'].map(v=>[v,rates[v].label]));
  if(r.tiers)content+=pills(id,'tier',s.rate==='sofa'?'Choose your sofa treatment':'Choose your AC service',r.tiers.map((t,i)=>[i,t.label,formatMoney(t.p)+' '+r.unit]));
  if(r.unit.includes('sq.ft'))content+=`<label class="field">Approximate area (sq.ft)<input type="number" inputmode="numeric" min="1" max="100000" step="1" value="${c.qty}" data-id="${id}" data-key="qty" required></label>`;
  else content+=count(id,'qty',s.rate==='sofa'?'Total sofa seats':s.rate==='bathroom'?'Bathrooms':s.rate==='kitchen-add'?'Kitchens':s.rate==='ac'?'AC units':'How many?');
  if(s.rate==='sofa')content+=`<p class="small">Count a chaise as 2 seats.</p><details class="optional-details"><summary>Any recliner seats?</summary>${count(id,'recliners','Recliners (+'+formatMoney(catalog.supplements.recliner)+' each)',0,c.qty)}</details>`;
  if(r.high)content+='<p class="range-note">One service. Final price depends on size and condition.</p>';
 }else content='<p class="small">We’ll discuss the size and scope with you and provide a custom quote.</p>';
 return `<section class="service-question concentric" data-question="${id}"><div class="question-heading">${s.image?`<img src="${s.image}" alt="" width="52" height="52">`:'<span class="extra-question-icon" aria-hidden="true">＋</span>'}<h3>${s.name}</h3><button type="button" class="remove-service" data-remove="${id}" aria-label="Remove ${s.name}">×</button></div>${content}</section>`;
}
function collect(){for(const key of ['name','phone','city','locality','notes']){const el=document.getElementById(key);if(el)state[key]=el.value;}form.querySelectorAll('input[data-id][data-key]').forEach(el=>config(el.dataset.id)[el.dataset.key]=el.value);}
function selectionSummary(){const label=document.querySelector('#selection-count');if(label)label.textContent=effective().length+' service'+(effective().length===1?'':'s')+' selected';}
function render(focus=true){
 document.querySelectorAll('[data-step-label]').forEach((el,i)=>{el.classList.toggle('active',i===step);el.classList.toggle('done',i<step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 document.querySelector('#quote-builder').dataset.step=step;
 back.hidden=step===0;next.hidden=step===3;next.innerHTML=(step===2?'See my estimate ':'Next ')+ICON_ARROW;
 if(step===0){stage.innerHTML=`<h2 tabindex="-1">What needs cleaning?</h2><p>Tap everything you need.</p><div class="tap-service-grid">${options.slice(0,6).map(s=>choice(s)).join('')}</div><details class="more-services" ${state.selected.some(id=>options.findIndex(s=>s.id===id)>5)?'open':''}><summary>More services</summary><div class="tap-service-grid">${options.slice(6).map(s=>choice(s,!s.image)).join('')}</div></details><p class="selection-count" id="selection-count" aria-live="polite"></p>`;selectionSummary();}
 if(step===1){
  const selected=effective(),extras=state.selected.includes('kitchen-cleaning')?['chimney-cleaning','refrigerator-cleaning']:state.selected.includes('full-house-cleaning')?['sofa-cleaning','chimney-cleaning','ac-services']:['kitchen-cleaning','bathroom-cleaning'];
  const suggestions=extras.filter(id=>!state.selected.includes(id)&&!covered().has(service(id).rate));
  stage.innerHTML=`<h2 tabindex="-1">Just a few details.</h2><p>Only questions for the services you picked.</p>${selected.map(details).join('')}${suggestions.length?`<section class="quick-extras"><h3>While we’re there?</h3><p class="small">Optional extras. Tap to add.</p><div class="tap-service-grid">${suggestions.map(id=>choice(service(id),true)).join('')}</div></section>`:''}<button type="button" class="button secondary sm" id="change-services">${ICON_PLUS} Choose other services</button>`;
 }
 if(step===2)stage.innerHTML=`<h2 tabindex="-1">Who’s the quote for?</h2><p>Two details, then your estimate.</p><label class="field">Your name<input id="name" name="name" autocomplete="name" required maxlength="80" value="${esc(state.name)}" placeholder="Your name"></label><label class="field">Mobile number<input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20" value="${esc(state.phone)}" placeholder="Your contact number"></label>${preference('date','Preferred date',['Within 2 days','Within this week','Flexible'])}<details class="optional-details" ${state.city||state.locality||state.notes?'open':''}><summary>Add your location or a note <span>Optional</span></summary><label class="field">City<input id="city" name="city" autocomplete="address-level2" list="quote-cities" value="${esc(state.city)}"><datalist id="quote-cities">${catalog.cities.map(c=>'<option value="'+c+'">').join('')}</datalist></label><label class="field">Locality<input id="locality" name="locality" autocomplete="street-address" maxlength="250" value="${esc(state.locality)}"></label><label class="field">Anything we should know?<textarea id="notes" maxlength="1500">${esc(state.notes)}</textarea></label></details><p class="<div class="turnstile-slot" id="turnstile-slot"></div><p class="privacy-note">We use these details only to prepare and confirm your quote. They are sent to CleanNest when you ask for your estimate. <a href="privacy.html">Privacy policy</a></p>`;
 if(step===3){const result=calculate(catalog,state);stage.innerHTML=`<div class="estimate-ready"><span class="eyebrow">YOUR ROUGH ESTIMATE</span><h2 tabindex="-1">Here you go, ${esc(state.name.trim().split(' ')[0])}.</h2><p>A fresh start, made for your space.</p><div class="estimate-receipt concentric"><div class="receipt-total"><span>Estimated price</span><strong id="estimate-total">${priceLabel(result)}</strong><small>${result.custom?'Custom services will be quoted separately.':'Final price depends on size, condition and scope.'}</small></div><div id="estimate-lines">${result.lines.map(l=>`<div class="estimate-line"><span>${esc(l.label)}<small>${esc(l.detail)}</small></span><strong>${l.custom?'Custom quote':l.low===l.high?formatMoney(l.low):formatMoney(l.low)+'–'+formatMoney(l.high)}</strong></div>`).join('')}</div>${result.includedNames.length?`<p class="included-note">${esc(result.includedNames.join(', '))}: already included.</p>`:''}<div class="receipt-contact"><span>${esc(state.name)}</span><span>${esc(state.phone)}</span></div></div>${state.send&&state.send.ok?`<p class="sent-note" role="status">${ICON_CHECK} Your inquiry has been sent. We’ll contact you on ${esc(state.phone)} soon to confirm the price and book a date.</p>`:`<p class="form-error" role="alert">${esc(failureMessage(state.send&&state.send.error,state.send&&state.send.status))} You can send it on WhatsApp instead.</p><a class="button primary whatsapp-send" href="${esc('https://wa.me/917610000654?text='+encodeURIComponent(whatsappMessage(catalog,state,result)))}" target="_blank" rel="noopener">Message on WhatsApp ${ICON_EXTERNAL}</a>`}<button type="button" class="button secondary sm" id="edit-details">Edit services & details</button></div>`;}
 if(focus){stage.querySelector('h2')?.focus({preventScroll:true});document.querySelector('#quote-builder').scrollIntoView({behavior:'instant',block:'start'});}
}
function error(message){let el=document.querySelector('#quote-error');if(!el){el=document.createElement('p');el.id='quote-error';el.className='form-error';el.setAttribute('role','alert');stage.append(el);}el.textContent=message;el.scrollIntoView({block:'nearest',behavior:'instant'});}
let sending=false;
// Runs from step 2: sends the enquiry, then the estimate step reports the outcome.
async function sendWithEstimate(button){
 if(sending)return;
 const result=calculate(catalog,state),label=button.innerHTML;
 sending=true;button.disabled=true;button.textContent='Getting your estimate…';
 const outcome=await submitEnquiry({
  endpoint:builder.dataset.endpoint,
  sitekey:builder.dataset.turnstile||'',
  container:document.querySelector('#turnstile-slot'),
  // `scope` and `estimate` carry the itemised receipt and the figure the visitor
  // was shown, so the owner's notification states what was chosen and for how much.
  payload:{name:state.name,phone:state.phone,when:state.date,notes:state.notes,services:effective().map(id=>service(id).name),scope:receiptLines(result),included:result.includedNames,estimate:priceLabel(result),source:'quote.html'},
 });
 sending=false;button.disabled=false;button.innerHTML=label;
 state.send=outcome;
}
form.addEventListener('change',e=>{collect();if(e.target.matches('[data-service]')){const id=e.target.dataset.service;state.selected=e.target.checked?[...new Set([...state.selected,id])]:state.selected.filter(v=>v!==id);config(id);const y=scrollY;render(false);const control=form.querySelector(`input[data-service="${id}"]:not(:disabled)`);(control||stage.querySelector('h2'))?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});}});
form.addEventListener('input',e=>{collect();if(e.target.matches('input[data-key="qty"]')){const id=e.target.dataset.id,value=Number(e.target.value),recliner=form.querySelector(`input[data-id="${id}"][data-key="recliners"]`);if(recliner&&Number.isInteger(value)&&value>0){recliner.max=value;if(Number(recliner.value)>value){recliner.value=value;config(id).recliners=value;}}}});
form.addEventListener('click',e=>{
 const pref=e.target.closest('[data-pref]');if(pref){state[pref.dataset.pref]=pref.dataset.value;const prefGroup=pref.closest('.tap-options');prefGroup.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===pref)));return;}
 // Keep the anchor's own target=_blank handoff, then confirm in this tab.
 const send=e.target.closest('.whatsapp-send');if(send){const status=document.querySelector('#send-status');if(status)status.textContent='Opening WhatsApp…';setTimeout(()=>{location.href='thank-you.html';},700);return;}
 const pill=e.target.closest('[data-value]:not([data-pref])');if(pill){const {id,key,value}=pill.dataset;config(id)[key]=value;const group=pill.closest('.tap-options');group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===pill)));if(key==='floorRate'){config(id).tier=0;render(false);form.querySelector(`[data-id="${id}"][data-value="${value}"]`)?.focus({preventScroll:true});}if(key==='home')applyHomeRooms(id);return;}
 const counter=e.target.closest('[data-count]');if(counter){const {id,key,count}=counter.dataset,input=counter.parentElement.querySelector('input');const value=Math.min(Number(input.max),Math.max(Number(input.min),Number(input.value||0)+Number(count)));config(id)[key]=value;input.value=value;if(key==='qty'){const recliner=form.querySelector(`input[data-id="${id}"][data-key="recliners"]`);if(recliner){recliner.max=value;if(Number(recliner.value)>value){recliner.value=value;config(id).recliners=value;}}}return;}
 const remove=e.target.closest('[data-remove]');if(remove){state.selected=state.selected.filter(id=>id!==remove.dataset.remove);if(!state.selected.length)step=0;render();return;}
 if(e.target.closest('#change-services')){collect();step=0;render();}
 if(e.target.closest('#edit-details')){step=1;render();}
});
form.addEventListener('submit',async e=>{e.preventDefault();collect();if(!form.reportValidity())return;
 if(step===0&&!state.selected.length){error('Tap at least one service to continue.');return;}
 if(step===1){try{calculate(catalog,state);}catch(err){error(err.message);return;}}
 if(step===2){
  if(!state.name.trim()){error('Please enter your name.');return;}
  if(!/^\+?[\d ()-]+$/.test(state.phone)||state.phone.replace(/\D/g,'').length<10||state.phone.replace(/\D/g,'').length>15){error('Please enter a valid mobile number.');return;}
  // The enquiry is sent from here, so "See my estimate" is the only action the
  // visitor takes. The estimate is shown either way — if sending failed, the
  // estimate step offers WhatsApp instead of a "sent" confirmation.
  await sendWithEstimate(next);
 }
 if(step<3){step++;render();}
});
back.addEventListener('click',()=>{collect();if(step>0){step--;render();}});
render(false);
