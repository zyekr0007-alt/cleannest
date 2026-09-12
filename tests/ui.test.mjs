import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPoint,zoomMap} from '../site/zoom-map.mjs';
import {glyph,simpleProcess} from '../site/components.mjs';
import {footerFinal,fromPrice,googleProfile} from '../site/final-home.mjs';
import {reviewsFinal,servicesFinal} from '../site/final-pages.mjs';
import {services} from '../site/catalog.mjs';
import {businessInfo} from '../site/business.mjs';

test('map uses shared geographic coordinates and no connector lines',()=>{
 const [x,y]=mapPoint(75.57618,31.326015);
 const html=zoomMap();
 assert.ok(x>0&&x<500&&y>0&&y<470);
 assert.ok(mapPoint(75.38,31.38)[0]<x,'Kapurthala is west of Jalandhar');
 assert.ok(mapPoint(75.92,31.53)[1]<y,'Hoshiarpur is north of Jalandhar');
 assert.match(html,/data-city="Jalandhar" data-lon="75.57618" data-lat="31.326015"/);
 assert.match(html,new RegExp('translate\\('+x.toFixed(2)+' '+y.toFixed(2)+'\\)'));
 assert.equal((html.match(/class="coverage-place /g)||[]).length,13);
 assert.doesNotMatch(html,/city-route|city-label-line|punjab-districts\.svg|map-replay/);
});

test('booking journey has three ordered steps and two arrows',()=>{
 const html=simpleProcess();
 assert.match(html,/<ol class="process-journey"/);
 assert.equal((html.match(/class="journey-step"/g)||[]).length,3);
 assert.equal((html.match(/class="journey-arrow"/g)||[]).length,2);
});

test('brand SVGs and shared email/FAQ glyphs are available',()=>{
 for(const brand of ['whatsapp','instagram']){
  assert.match(glyph(brand),new RegExp('data-brand="'+brand+'"'));
  assert.match(glyph(brand),/fill="currentColor" stroke="none"/);
 }
 assert.match(glyph('mail'),/<rect/);
 assert.match(glyph('help'),/<path/);
 assert.match(glyph('chevron'),/m7 10 5 5 5-5/);
 assert.match(glyph('external'),/M14 4h6v6/);
});

test('service cards only badge full-home and use mobile card prices',()=>{
 const html=servicesFinal();
 assert.equal((html.match(/WHOLE-HOME RESET/g)||[]).length,1);
 assert.match(html,/service-card-featured[^>]*>[\s\S]*?full-house-cleaning\.html[\s\S]*?WHOLE-HOME RESET/);
 assert.equal(fromPrice(services.find(s=>s.id==='kitchen-cleaning')),'From ₹2,490');
 assert.equal(fromPrice(services.find(s=>s.id==='sofa-cleaning')),'From ₹199 / seat');
});

test('external destinations use vector icons instead of arrow characters',()=>{
 const html=footerFinal()+reviewsFinal();
 assert.doesNotMatch(html,/↗/);
 assert.match(reviewsFinal(),/Open Justdial<\/span><svg[^>]+>[\s\S]*?M14 4h6v6/);
});

test('Google review actions never reuse the directions URL',()=>{
 assert.notEqual(googleProfile,businessInfo.map);
 const html=reviewsFinal();
 assert.doesNotMatch(html,new RegExp(`href="${businessInfo.map.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*>[^<]*Read Google`));
 assert.match(html,/href="#google-review-excerpts"/);
});
