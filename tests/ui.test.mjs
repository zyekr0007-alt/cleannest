import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPoint,zoomMap} from '../site/zoom-map.mjs';
import {glyph,simpleProcess} from '../site/components.mjs';

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
});
