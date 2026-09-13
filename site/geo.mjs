// One source of truth for service-area geography. The homepage distance chart
// and the city pages both read from here, so a distance can never disagree with
// the chart a visitor just looked at.
export const base={name:'Jalandhar',lon:75.57618,lat:31.326015};

export const places=[
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

export function distanceKm(lon,lat){
 const R=6371, dLat=rad(lat-base.lat), dLon=rad(lon-base.lon);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(base.lat))*Math.cos(rad(lat))*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(h));
}

export function bearing(lon,lat){
 const dLon=rad(lon-base.lon), lat1=rad(base.lat), lat2=rad(lat);
 const y=Math.sin(dLon)*Math.cos(lat2);
 const x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
 return (Math.atan2(y,x)*180/Math.PI+360)%360;
}

const COMPASS=['north','north-east','east','south-east','south','south-west','west','north-west'];
export const directionName=deg=>COMPASS[Math.round(deg/45)%8];

// The rings the homepage chart draws: one every 10 km out to the 60 km edge.
export const rings=[10,20,30,40,50,60];

// Bands used in the service-area copy. These follow the chart's scale.
export function ringBand(km){
 if(km<=20)return {id:'inner',label:'the inner part of our service area'};
 if(km<=40)return {id:'middle',label:'the middle of our service area'};
 return {id:'outer',label:'the outer part of our service area'};
}

// Every served place with its geometry, nearest-first.
export const served=places
 .map(([name,lon,lat])=>({name,lon,lat,km:distanceKm(lon,lat),bearing:bearing(lon,lat)}))
 .map(place=>({...place,direction:directionName(place.bearing),band:ringBand(place.km)}))
 .sort((a,b)=>a.km-b.km);

export const byName=Object.fromEntries(served.map(place=>[place.name,place]));

// Where a town sits in the round: closest first, furthest last. Used on the
// service-area pages so each one states something only true of that town.
export function rankNote(name){
 const i=served.findIndex(place=>place.name===name);
 if(i<0)return '';
 if(i===0)return 'the closest town we serve outside Jalandhar';
 if(i===served.length-1)return 'the furthest town on our list';
 return `the ${['','','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh'][i]||(i+1)+'th'}-closest town we serve`;
}

// The nearest other towns we serve, measured town-to-town, for the "nearby"
// links on a city page. This is real geography, not a template decision.
export function nearestTo(name,count=3){
 const from=byName[name];
 return served
  .filter(place=>place.name!==name)
  .map(place=>({...place,apart:distanceBetween(from,place)}))
  .sort((a,b)=>a.apart-b.apart)
  .slice(0,count);
}

export function distanceBetween(a,b){
 const R=6371, dLat=rad(b.lat-a.lat), dLon=rad(b.lon-a.lon);
 const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(h));
}
