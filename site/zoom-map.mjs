// City-centre positions are approximate. District geometry is from the owner's SVG.
const places=[
 ['Jalandhar',75.57618,31.326015,149,144,'end'],
 ['Kartarpur',75.4997,31.4427,150,116,'end'],
 ['Kapurthala',75.38,31.38,138,130,'end'],
 ['Adampur',75.72,31.43,175,108,'end'],
 ['Phagwara',75.77,31.22,185,143,'start'],
 ['Nakodar',75.4781,31.1275,147,174,'end'],
 ['Sultanpur Lodhi',75.1985,31.2132,138,157,'end'],
 ['Hoshiarpur',75.92,31.53,193,106,'start'],
 ['Goraya',75.77,31.13,188,164,'start'],
 ['Phillaur',75.78,31.03,179,182,'start'],
 ['Banga',75.9947,31.188,207,137,'start'],
 ['Nawanshahr',76.1333,31.1167,230,171,'end'],
 ['Ludhiana',75.8516,30.909,196,197,'start']
];
const point=(lon,lat)=>[28+(lon-73.87985)/3.05957*246,303-(lat-29.54208)/2.97062*272];
const home=point(places[0][1],places[0][2]);
export function zoomMap(){return `<section class="coverage-band zoom-coverage" id="coverage"><div class="container zoom-layout"><div class="coverage-heading"><span class="eyebrow">ROOTED IN JALANDHAR</span><h2>Your city.<br>Our care.</h2><p>A local team. Thirteen cities.<br>Thoughtful cleaning, closer to home.</p><a class="text-link" href="areas-we-serve.html">Explore our service areas →</a></div><div class="zoom-map-card"><div class="map-topline"><span>PUNJAB · OUR SERVICE AREA</span><button type="button" class="map-replay" aria-label="Replay service area map animation">↻ Replay</button></div><svg class="coverage-svg" viewBox="0 0 300 320" role="img" aria-label="Punjab district map showing Jalandhar and twelve nearby service cities"><g class="map-camera" transform="translate(-175 -140) scale(2)"><image href="assets/img/punjab-districts.svg" width="276.38782" height="306.35364"/>${places.map(([name,lon,lat,lx,ly,anchor],i)=>{const [x,y]=point(lon,lat),delay=900+i*90;return `<g class="city-arrival" style="--arrival:${delay}ms">${i?`<path class="city-route" d="M${home.join(' ')} Q${home[0]} ${y-10} ${x} ${y}" pathLength="1"/>`:''}<path class="city-label-line" d="M${x} ${y}L${lx} ${ly-1.5}"/><g class="city-pin" transform="translate(${x} ${y})"><path d="M0 0C-1.7-2.5-3.3-4.3-3.3-6a3.3 3.3 0 0 1 6.6 0C3.3-4.3 1.7-2.5 0 0Z"/><circle cy="-6" r="1"/></g><text class="city-label ${i===0?'home-city-label':''}" x="${lx}" y="${ly}" text-anchor="${anchor}">${name}</text></g>`;}).join('')}</g></svg><p class="map-footnote">Based in Jalandhar · Share your locality to arrange a visit</p></div></div></section>`;}
