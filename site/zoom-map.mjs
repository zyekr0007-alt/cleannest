// Service-area band. Instead of a district map, thirteen cities are plotted at
// their true distance and bearing from the Jalandhar base, on distance rings.
// Positions are computed from the same coordinates the site already publishes.
import {glyph} from './components.mjs';
import {rings} from './geo.mjs';

const base={lon:75.57618,lat:31.326015};
const places=[
 ['Kartarpur',75.4997,31.4427],
 ['Kapurthala',75.38,31.38],
 ['Adampur',75.72,31.43],
 ['Phagwara',75.77,31.22],
 ['Nakodar',75.4781,31.1275],
 ['Sultanpur Lodhi',75.1985,31.2132],
 ['Hoshiarpur',75.92,31.53],
 ['Goraya',75.77,31.13],
 ['Phillaur',75.78,31.03],
 ['Banga',75.9947,31.188],
 ['Nawanshahr',76.1333,31.1167],
 ['Ludhiana',75.8516,30.909]
];

const rad=value=>value*Math.PI/180;
function distanceKm(lon,lat){
 const R=6371, dLat=rad(lat-base.lat), dLon=rad(lon-base.lon);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(base.lat))*Math.cos(rad(lat))*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(h));
}
function bearing(lon,lat){
 const dLon=rad(lon-base.lon), lat1=rad(base.lat), lat2=rad(lat);
 const y=Math.sin(dLon)*Math.cos(lat2);
 const x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
 return (Math.atan2(y,x)*180/Math.PI+360)%360;
}

// Chart geometry: the outer ring marks MAX_KM.
const MAX_KM=60, RADIUS=248, CX=310, CY=286;

const project=(km,bearingDeg)=>{
 const r=km/MAX_KM*RADIUS, t=rad(bearingDeg);
 return [CX+r*Math.sin(t), CY-r*Math.cos(t)];
};

// Ordered by distance from the base, so the reveal can travel outward.
const ordered=places.map(([name,lon,lat])=>({name,lon,lat,km:distanceKm(lon,lat)})).sort((a,b)=>a.km-b.km);

const slug=name=>name.toLowerCase().replaceAll(' ','-');

// Each city is a link to its own page. A hairline spoke runs back to the base and
// draws itself on hover or keyboard focus, so a name is never orphaned from the
// marker it belongs to.
const marks=ordered.map(({name,lon,lat,km},i)=>{
 const deg=bearing(lon,lat);
 const [x,y]=project(km,deg);
 const east=Math.sin(rad(deg))>=0;
 const lx=(x+(east?11:-11)).toFixed(1), ly=(y+4.2).toFixed(1);
 // A 13px SVG name is a 13px tap target. The dot and the name are one destination,
 // so a transparent rect covers both and gives the link a target a thumb can hit
 // without overlapping the neighbouring city.
 const labelW=name.length*7+11;
 const hitW=12+labelW+2, hitX=east?-12:-(labelW+2);
 return '<g class="radius-city" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')">'
  +'<line class="radius-spoke" x1="'+(CX-x).toFixed(1)+'" y1="'+(CY-y).toFixed(1)+'" x2="0" y2="0" pathLength="1"/>'
  +'<a class="radius-city__link" href="'+slug(name)+'.html" aria-label="Cleaning services in '+name+'">'
  +'<title>Cleaning services in '+name+'</title>'
  +'<rect class="radius-city__hit" x="'+hitX.toFixed(1)+'" y="-14" width="'+hitW.toFixed(1)+'" height="28" rx="8"/>'
  +'<circle class="radius-city__dot" r="4.5" data-reveal="pop" data-delay="'+(900+i*55)+'"/>'
  +'<text class="radius-city__name" x="'+(lx-x).toFixed(1)+'" y="'+(ly-y).toFixed(1)+'" text-anchor="'+(east?'start':'end')+'" data-reveal="rise" data-delay="'+(945+i*55)+'">'+name+'</text>'
  +'</a></g>';
}).join('');

// The rings bloom outward one at a time, then the cities land on the finished
// scale. They stay in the same reveal path as every other mark so the watchdog
// that guarantees a finished chart can always put them back.
const ringMarkup=rings.map((km,i)=>{
 const r=(km/MAX_KM*RADIUS).toFixed(1);
 return '<circle class="radius-ring" data-reveal="bloom" data-delay="'+(i*110)+'" cx="'+CX+'" cy="'+CY+'" r="'+r+'"/>';
}).join('');

// `onAreasPage` is true when this chart is reused on areas-we-serve.html itself,
// where "Show all cities" linking to that same page would be a no-op link. There
// it instead jumps to the full city list already lower on that page.
export function zoomMap(onAreasPage=false){
 return '<section class="coverage-band zoom-coverage" id="coverage"><div class="container zoom-layout">'
  +'<div class="coverage-heading"><span class="eyebrow">ROOTED IN JALANDHAR</span>'
  +'<h2>Your city.<br>Our care.</h2>'
  +'<p>A local team. Thirteen cities, all within about an hour of our Jalandhar base.</p>'
  +(onAreasPage?'':'<a class="button primary" href="areas-we-serve.html">Show all cities '+glyph()+'</a>')+'</div>'
  +'<div class="radius-chart" data-sweep><svg viewBox="0 0 620 580" role="group" aria-label="The thirteen cities CleanNest serves, shown around our Jalandhar base">'
  +'<g class="radius-chart__rings">'+ringMarkup+'</g>'
  +'<g class="radius-sweep"><line x1="'+CX+'" y1="'+CY+'" x2="'+CX+'" y2="'+(CY-RADIUS)+'"/></g>'
  +'<g class="radius-chart__marks">'+marks+'</g>'
  +'<g class="radius-chart__hq"><circle class="radius-hq__ping" cx="'+CX+'" cy="'+CY+'" r="14"/>'
 +'<circle class="radius-hq__halo" cx="'+CX+'" cy="'+CY+'" r="13" data-reveal="rise" data-delay="820"/>'
 +'<circle class="radius-hq__core" cx="'+CX+'" cy="'+CY+'" r="6.5" data-reveal="rise" data-delay="820"/>'
 +'<g class="radius-hq__label" data-reveal="fade" data-delay="900" transform="translate('+CX+' '+(CY+13)+')"><rect x="-44" y="0" width="88" height="25" rx="12.5"/><text x="0" y="17" text-anchor="middle">Jalandhar</text></g></g>'
  +'</svg></div></div></section>';
}
