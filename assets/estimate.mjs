export const formatMoney=n=>'₹'+n.toLocaleString('en-IN');
export function priceLabel(result){
 const amount=result.low===result.high?formatMoney(result.low):`${formatMoney(result.low)} – ${formatMoney(result.high)}`;
 return result.custom?(result.low?amount+' + custom quote':'Custom quote'):amount;
}
export function includedRates(selected,catalog){
 const ids=new Set(Array.isArray(selected)?selected:[selected]),included=new Set();
 if(ids.has('full-house-cleaning'))['kitchen-add','bathroom','fan','gas-stove','exhaust','tile-floor'].forEach(id=>included.add(id));
 if(ids.has('kitchen-cleaning')&&!ids.has('full-house-cleaning'))['gas-stove','exhaust','cabinets',...(catalog?.kitchenIncludesChimney!==false?['chimney']:[])].forEach(id=>included.add(id));
 if(ids.has('sofa-cleaning'))included.add('cushions');
 return included;
}
export function calculate(catalog,state){
 const selected=[...new Set(state.selected||[])];
 if(!selected.length)throw Error('Choose at least one service.');
 const rates=Object.fromEntries(catalog.groups.flatMap(g=>g.items).map(r=>[r.id,r]));
 const included=includedRates(selected,catalog),lines=[],includedNames=[];
 const quantity=(value,min=1)=>{const n=Number(value);if(!Number.isInteger(n)||n<min||n>100000)throw Error('Enter a valid whole-number quantity.');return n;};
 for(const id of selected){
  const s=[...catalog.services,...(catalog.extras||[])].find(s=>s.id===id);if(!s)throw Error('Unknown service.');
  const config=state.configs?.[id]||{};
  const rateId=s.id==='floor-renewal'?(config.floorRate||'tile-floor'):s.rate;
  if(s.id==='floor-renewal'&&!['tile-floor','marble','granite','italian-marble'].includes(rateId))throw Error('Choose a valid floor material.');
  if(included.has(rateId)){includedNames.push(s.name);continue;}
  if(rateId==='home'){
   const h=catalog.homes[config.home];if(!h)throw Error('Choose how many bedrooms your home has.');
   const baths=quantity(config.bathrooms??1,0),kitchens=quantity(config.kitchens??1,0);
   lines.push({id,label:config.home==='villa'?'5+ bedrooms / villa':config.home+' BHK full-home cleaning',detail:`${baths} bathroom${baths===1?'':'s'} · ${kitchens} kitchen${kitchens===1?'':'s'} included`,low:h.low,high:h.high,custom:config.home==='villa'});
  }else if(rateId){
   const rate=rates[rateId];if(!rate)throw Error('Unknown rate.');
   const qty=quantity(config.qty??1),option=rate.tiers?.[Number(config.tier??0)];
   if(rate.tiers&&!option)throw Error('Choose a valid cleaning option.');
   const low=option?.p??rate.base,high=option?.p??rate.high??rate.base;
   const unit=rate.unit.replace('/','').trim();
   lines.push({id,label:s.name,detail:`${qty} ${unit}${qty!==1&&unit!=='sq.ft'?'s':''}${option?' · '+option.label:''}${s.id==='floor-renewal'?' · '+rate.label:''}`,low:low*qty,high:high*qty});
   if(rateId==='sofa'){
    const recliners=quantity(config.recliners??0,0);if(recliners>qty)throw Error('Recliners cannot exceed the total sofa seats.');
    if(recliners)lines.push({id:id+'-recliners',label:'Recliner surcharge',detail:`${recliners} × ₹150`,low:recliners*150,high:recliners*150});
   }
  }else lines.push({id,label:s.name,detail:'We’ll confirm the scope with you',low:0,high:0,custom:true});
 }
 return {lines,includedNames,custom:lines.some(l=>l.custom),low:lines.reduce((n,l)=>n+l.low,0),high:lines.reduce((n,l)=>n+l.high,0)};
}
export function whatsappMessage(catalog,state,result){return [
 'Hi CleanNest! I’d like a cleaning quote.','',
 ...result.lines.map(l=>`• ${l.label}: ${l.detail} — ${l.custom?'Custom quote':l.low===l.high?formatMoney(l.low):formatMoney(l.low)+' – '+formatMoney(l.high)}`),
 ...(result.includedNames.length?['Already included: '+result.includedNames.join(', ')]:[]),'',
 'Rough estimate: '+priceLabel(result),'Name: '+state.name,'Phone: '+state.phone,
 state.city?'City: '+state.city:'',state.locality?'Locality: '+state.locality:'',state.notes?'Notes: '+state.notes:'','',
 'Please confirm the final price and available booking dates.'
].join('\n');}
