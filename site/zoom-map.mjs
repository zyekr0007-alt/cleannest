import fs from 'node:fs';
import {cities,slug} from './catalog.mjs';
// Approximate city centres retained from the verified service-area data.
// Outline and pins now share one geographic projection, not a separate illustration.
const places=[
 ['Jalandhar',75.57618,31.326015],['Kartarpur',75.4997,31.4427],
 ['Kapurthala',75.38,31.38],['Adampur',75.72,31.43],
 ['Phagwara',75.77,31.22],['Nakodar',75.4781,31.1275],
 ['Sultanpur Lodhi',75.1985,31.2132],['Hoshiarpur',75.92,31.53],
 ['Goraya',75.77,31.13],['Phillaur',75.78,31.03],
 ['Banga',75.9947,31.188],['Nawanshahr',76.1333,31.1167],
 ['Ludhiana',75.8516,30.909]
];
const boundary=JSON.parse(fs.readFileSync(new URL('./punjab.geojson',import.meta.url),'utf8'));
const ring=boundary.geometry.coordinates[0];
const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
const west=Math.min(...xs),east=Math.max(...xs),south=Math.min(...ys),north=Math.max(...ys);
const cosine=Math.cos((north+south)/2*Math.PI/180);
const scale=Math.min(400/((east-west)*cosine),410/(north-south));
export const mapPoint=(lon,lat)=>[250+(lon-(east+west)/2)*cosine*scale,235- (lat-(north+south)/2)*scale];
const outline=ring.filter((_,i)=>i%3===0).map(([lon,lat],i)=>(i?'L':'M')+mapPoint(lon,lat).map(v=>v.toFixed(2)).join(' ')).join('')+'Z';
export function zoomMap(){return `<section class="coverage-band zoom-coverage" id="coverage"><div class="container zoom-layout"><div class="coverage-heading"><span class="eyebrow">ROOTED IN JALANDHAR</span><h2>Your city.<br>Our care.</h2><p>A local team. Thirteen cities.<br>Thoughtful cleaning, closer to home.</p><a class="text-link" href="areas-we-serve.html">Explore our service areas →</a></div><div class="zoom-map-card"><div class="map-topline"><span>PUNJAB · OUR SERVICE AREA</span><span class="map-home-key">● Jalandhar base</span></div><svg class="coverage-svg" viewBox="0 0 500 470" role="img" aria-label="Punjab outline with city-centre markers. CleanNest is based in Jalandhar."><path class="coverage-outline" d="${outline}"/>${places.map(([name,lon,lat],i)=>{const [x,y]=mapPoint(lon,lat);return `<g class="coverage-place ${i===0?'coverage-home':''}" data-city="${name}" data-lon="${lon}" data-lat="${lat}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><title>${name}${i===0?' — our home city':''}</title>${i===0?'<circle class="home-halo" r="10"/>':''}<circle class="coverage-dot" r="${i===0?5.5:3}"/>${i===0?'<g class="home-map-label" transform="translate(-111 -35)"><rect width="84" height="29" rx="14.5"/><text x="42" y="19" text-anchor="middle">Jalandhar</text></g>':''}</g>`;}).join('')}<text class="coverage-state" x="210" y="365">PUNJAB</text></svg><nav class="coverage-city-index" aria-label="Cities we serve">${cities.map(c=>`<a href="${slug(c)}.html">${c}</a>`).join('')}</nav><p class="map-footnote">City centres shown approximately, not individual office locations.<br>Boundary: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener">geoBoundaries / DataMeet · CC BY 2.5 IN</a></p></div></div></section>`;}
