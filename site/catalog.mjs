import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync(new URL('./content.json',import.meta.url),'utf8'));
import {cities,address} from './business.mjs';
export {cities,address};
export const slug=s=>s.toLowerCase().replaceAll(' ','-');
export const homes=source.homes;
// Owner correction: size/condition ranges, not selectable package tiers.
export const groups=source.rates.map(group=>({...group,items:group.items.map(rate=>{
 if(rate.tiers&&!['sofa','ac'].includes(rate.id))return {...rate,base:Math.min(...rate.tiers.map(t=>t.p)),high:Math.max(...rate.tiers.map(t=>t.p)),tiers:null};
 if(rate.id==='sofa')return {...rate,tiers:rate.tiers.map((t,i)=>({...t,label:['Standard','Premium','Premium + steam'][i]}))};
 return {...rate};
})}));
export const money=n=>'₹'+n.toLocaleString('en-IN');
const definitions=[
 ['full-house-cleaning','Full home','Every room. A fresh beginning.','Homes','home','hero'],
 ['kitchen-cleaning','Kitchen','A little less grease. A lot more joy.','Homes','kitchen-add','kitchen'],
 ['bathroom-cleaning','Bathroom','Fresh tiles, fittings and everything between.','Homes','bathroom','bathroom'],
 ['sofa-cleaning','Sofa & upholstery','Make your favourite seat feel new again.','Furnishings','sofa','sofa'],
 ['chimney-cleaning','Chimney','Care for the hardest-working corner.','Appliances','chimney','chimney'],
 ['ac-services','AC cleaning','Give your cooling a clean start.','Appliances','ac'],
 ['carpet-steam-cleaning','Carpet cleaning','A deeper clean beneath your feet.','Furnishings','carpet'],
 ['mattress-steam-cleaning','Mattress cleaning','A fresh foundation for a good night.','Furnishings','mattress'],
 ['curtain-cleaning','Curtain cleaning','Refresh the fabric that frames your home.','Furnishings','curtains'],
 ['window-blinds-cleaning','Window blinds','Careful cleaning, slat by slat.','Furnishings','blinds'],
 ['refrigerator-cleaning','Refrigerator','A cleaner home for your fresh food.','Appliances','fridge'],
 ['gas-stove-cleaning','Gas stove & cooktop','Lift everyday grease and spills.','Appliances','gas-stove'],
 ['exhaust-fan-cleaning','Exhaust fan','Clear away built-up grease and dust.','Appliances','exhaust'],
 ['balcony-cleaning','Balcony','Bring the outside space back to life.','Homes','balcony'],
 ['commercial-cleaning','Commercial cleaning','A space that is ready for business.','Specialist','commercial-floor'],
 ['floor-renewal','Floor renewal','Care that goes beneath the surface.','Specialist','tile-floor'],
 ['post-construction-cleaning','Post-construction','From building site to ready-to-use space.','Specialist','post-construction'],
 ['post-renovation-cleaning','Post-renovation','The finishing touch to your renovation.','Specialist',null],
 ['newborn-prep-cleaning','Newborn preparation','Prepare your space for a new arrival.','Homes',null],
 ['sanitisation-service','Sanitisation','Targeted care for high-touch surfaces.','Specialist',null],
 ['chandelier-cleaning','Chandelier & crystal','Careful attention to delicate details.','Specialist',null],
 ['pool-cleaning','Swimming pool','A fresh start for your pool.','Specialist',null],
 ['jet-washing','Pressure washing','Powerful cleaning for outdoor surfaces.','Specialist','jet-washing'],
 ['recurring-cleaning','Regular cleaning','Keep that freshly-cleaned feeling.','Homes',null]
];
const rateMap=Object.fromEntries(groups.flatMap(g=>g.items).map(r=>[r.id,r]));
const refreshedImages={'mattress-steam-cleaning':'mattress','curtain-cleaning':'curtains','window-blinds-cleaning':'blinds','carpet-steam-cleaning':'carpet','refrigerator-cleaning':'fridge','floor-renewal':'floor'};
export const extras=['cabinets','fan','dining-chairs','cushions'].map(id=>{const r=rateMap[id];return {id:'extra-'+id,name:r.label,rate:id,image:'',price:`${money(r.base)}${r.high?'–'+money(r.high):''} ${r.unit}`};});
export const services=definitions.map(([id,name,tagline,category,rate,image])=>({id,name,tagline,category,rate,
 image:refreshedImages[id]?'assets/img/editorial/'+refreshedImages[id]+'-v2.webp':image?'assets/img/editorial/'+image+'.webp':source.pages[id+'.html']?.image||'assets/img/services/recurring-cleaning.webp',
 price:rate==='home'?'From '+money(homes['1'].low):rate?`${rateMap[rate].high?money(rateMap[rate].base)+'–'+money(rateMap[rate].high):'From '+money(rateMap[rate].base)} ${rateMap[rate].unit}`:'Custom quote',
 ...{includes:source.pages[id+'.html']?.includes||['A cleaning plan matched to your space','Scope and frequency agreed before booking','Professional equipment and trained staff'],faqs:source.pages[id+'.html']?.faqs||[]}
}));
// Owner-confirmed kitchen scope: chimney is a separately selected ₹690 extra.
const kitchen=services.find(s=>s.id==='kitchen-cleaning');
kitchen.includes=kitchen.includes.map(t=>t==='Chimney & exhaust cleaning'?'Exhaust cleaning':t);
kitchen.faqs=kitchen.faqs.map(([q,a])=>/chimney/i.test(q)?[q,'Yes. Add chimney cleaning to your kitchen service for ₹690. It is optional and is not included in the kitchen price.']:[q,a]);
export const faqs=[
 ['How do I get a quote?','Select one or more services, answer a few questions about your space, then enter your name and mobile number to see a rough estimate. Send your summary on WhatsApp and we’ll confirm the scope, price and available dates with you.'],
 ['Is the estimate the final price?','It is a guide based on our published rates. Size, condition, access and the agreed scope can affect the final quote. We confirm the price with you before booking.'],
 ['What is included in a full-home clean?','Interior surface cleaning, kitchen degreasing, bathroom cleaning, floors, windows and appliance exteriors. Sofa treatments, AC servicing and specialist work are separate. Share your room counts so we can confirm the full scope.'],
 ['Are your products safe for children and pets?','We use professional products suitable for homes with children and pets. Tell us about sensitivities or delicate surfaces, and follow the team’s guidance on access while cleaning and drying.'],
 ['How do payment and booking work?','Once we agree the scope, price and date, 50% is payable to confirm your booking and the remaining 50% after the service. The online estimate itself does not reserve a slot.'],
 ['Can I book for today?','We try to accommodate same-day requests, subject to team availability. Message or call us between 9 AM and 8 PM, any day of the week, to check.'],
 ['What if an area needs another clean?','Let us know which area needs attention. Our free re-clean promise covers missed areas within the agreed cleaning scope. See our refund policy for the process.'],
 ['Which areas do you serve?',`We serve ${cities.join(', ')}. Share your locality and job details when requesting a quote so we can plan the visit.`]
];
export const faqSections = [
 ['Planning your clean',[faqs[0],faqs[1],['Is chimney cleaning included with a kitchen clean?','Chimney cleaning is a separate optional add-on at ₹690. Select it with your kitchen cleaning if you would like both services.']]],
 ['Care for your home',[faqs[2],faqs[3],faqs[6]]],
 ['Booking your visit',[faqs[4],faqs[5],faqs[7]]],
];
export {source};
