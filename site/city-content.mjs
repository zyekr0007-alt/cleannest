import {cities,businessInfo,address} from './business.mjs';
import {serviceContent} from './service-content.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

// Owner content hooks. Do not populate with scraped landmarks or synthetic work.
// Each optional module requires a sourceReference and ownerVerified:true.
// project: {photo,alt,serviceId,locality,month,result,sourceReference,ownerVerified}
// review: {text,name,sourceUrl,sourceReference,ownerVerified}
// locality: {name,sourceReference,ownerVerified}
// scheduling: {text,sourceReference,ownerVerified}
export const cityContent=Object.fromEntries([...cities,'Dasuya','Hariana'].map(name=>[name,{
 confirmed:cities.includes(name), localities:[], projects:[], reviews:[], scheduling:null,
 introduction:null, serviceIds:['full-house-cleaning','kitchen-cleaning','bathroom-cleaning'],
}]));
const verified=item=>item?.ownerVerified===true&&typeof item.sourceReference==='string'&&item.sourceReference.trim();
export function cityPage(name){
 const data=cityContent[name], home=name==='Jalandhar';
 const localities=data.localities.filter(verified),projects=data.projects.filter(verified),reviews=data.reviews.filter(verified);
 const intro=verified(data.introduction)?data.introduction.text:home
  ?'CleanNest operates from Jalandhar and provides home and commercial cleaning in the city. Contact the team at our listed office or send your locality and cleaning requirements on WhatsApp.'
  :data.confirmed
   ?`${name} is one of CleanNest’s confirmed service areas. Your enquiry is handled by our Jalandhar-based team; this is a service-area page, not a separate branch address.`
   :`Availability in ${name} needs to be checked for your exact location. Contact our Jalandhar team with your locality and cleaning requirements before making plans.`;
 return `<section class="page-intro container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="areas-we-serve.html">Service areas</a> / ${esc(name)}</nav><span class="eyebrow">${home?'OUR OPERATING BASE':data.confirmed?'CONFIRMED SERVICE AREA':'COVERAGE ENQUIRY'}</span><h1>${data.confirmed?'Deep Cleaning Services':'Cleaning Enquiries'}<br>in ${esc(name)}</h1><p>${esc(intro)}</p></section>
 <section class="container prose">
 ${home?`<section><h2>Contact our Jalandhar office</h2><address>${esc(address)}</address><p>Call <a href="tel:${businessInfo.telephone}">${businessInfo.displayPhone}</a> during ${businessInfo.hours}. Share your locality, access details and preferred date so we can plan the visit.</p><p><a href="${businessInfo.map}" target="_blank" rel="noopener">Directions to CleanNest</a></p></section>`:''}
 ${localities.length?`<section><h2>Confirmed localities</h2><ul>${localities.map(l=>`<li>${esc(l.name)}</li>`).join('')}</ul></section>`:''}
 <section><h2>${data.confirmed?'Plan your cleaning request':'Check your location first'}</h2><p>Include ${esc(name)}, your locality, the size of the space and the services you need. Share access restrictions or useful photos. The team will confirm availability, scope and price before booking.</p>${verified(data.scheduling)?`<p>${esc(data.scheduling.text)}</p>`:'<p>Ask the team to confirm any travel arrangements or charges for your exact address. The estimate does not reserve a slot.</p>'}</section>
 <section><h2>Choose a service and check its scope</h2><p>These are standard CleanNest services. Open a service page to review inclusions and preparation, then use the central rate card for the published price guide.</p><ul>${data.serviceIds.map(id=>`<li><a href="${id}.html">${esc(serviceContent[id].title)}</a></li>`).join('')}</ul><p><a href="services.html">All cleaning services</a> · <a href="pricing.html">Published pricing</a></p></section>
 ${projects.length?`<section><h2>Work in ${esc(name)}</h2>${projects.map(p=>`<figure><img src="${esc(p.photo)}" alt="${esc(p.alt)}" width="880" height="660" loading="lazy"><figcaption><a href="${esc(p.serviceId)}.html">${esc(serviceContent[p.serviceId].title)}</a> · ${esc(p.locality)} · ${esc(p.month)}<p>${esc(p.result)}</p></figcaption></figure>`).join('')}</section>`:''}
 ${reviews.length?`<section><h2>Customer feedback from ${esc(name)}</h2>${reviews.map(r=>`<figure><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.name)} — <a href="${esc(r.sourceUrl)}" rel="noopener" target="_blank">Original review</a></figcaption></figure>`).join('')}</section>`:''}
 <section><h2>Booking questions for ${esc(name)}</h2><div class="faq-list"><details><summary>Is there a CleanNest branch in ${esc(name)}?</summary><p>${home?'Our listed business address is the Jalandhar office shown above.':'Our listed business address is in Jalandhar. This page does not represent a branch in '+esc(name)+'.'}</p></details><details><summary>Can I book same-day cleaning here?</summary><p>Same-day requests depend on team availability and your location. Call or message during our working hours to confirm a suitable date.</p></details></div></section>
 <p><a class="button primary" href="quote.html">Build a cleaning estimate</a></p><p><a href="areas-we-serve.html">Back to all service areas</a></p>
 </section>`;
}
