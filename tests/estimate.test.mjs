import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,priceLabel,whatsappMessage} from '../assets/estimate.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../assets/catalog.json',import.meta.url)));
const state=(selected,configs={},extra={})=>({selected,configs,...extra});
test('home range and add-ons avoid double charging rooms',()=>{
 const r=calculate(catalog,state(['full-house-cleaning','bathroom-cleaning','sofa-cleaning','chimney-cleaning'],{'full-house-cleaning':{home:'2',bathrooms:2,kitchens:1},'sofa-cleaning':{qty:5,tier:1}}));
 assert.equal(r.low,11585);assert.equal(r.high,13985);assert.equal(r.lines.length,3);assert.equal(r.includedNames.length,1);
});
test('bathrooms and kitchens are ranges, not treatment tiers',()=>{
 const r=calculate(catalog,state(['bathroom-cleaning','kitchen-cleaning']));assert.equal(r.low,3380);assert.equal(r.high,5680);
 const b=calculate(catalog,state(['bathroom-cleaning'],{'bathroom-cleaning':{qty:7,tier:1}}));assert.equal(b.low,6230);assert.equal(b.high,8330);
});
test('kitchen chimney is a separately charged ₹690 optional extra',()=>{
 const s=state(['kitchen-cleaning','chimney-cleaning']);assert.equal(catalog.kitchenIncludesChimney,false);assert.equal(calculate(catalog,s).low,3180);assert.equal(calculate(catalog,s).high,5180);assert.equal(calculate(catalog,state(['kitchen-cleaning'])).low,2490);
});
test('custom work is not presented as a complete priced total',()=>{
 const r=calculate(catalog,state(['full-house-cleaning','chimney-cleaning'],{'full-house-cleaning':{home:'villa'}}));assert.equal(r.custom,true);assert.equal(priceLabel(r),'₹690 + custom quote');
 assert.equal(priceLabel(calculate(catalog,state(['pool-cleaning']))),'Custom quote');
});
test('invalid selections, options and quantities are rejected',()=>{
 assert.throws(()=>calculate(catalog,state([])),/Choose/);assert.throws(()=>calculate(catalog,state(['unknown'])),/Unknown/);assert.throws(()=>calculate(catalog,state(['full-house-cleaning'])),/bedrooms/);
 for(const qty of [-1,NaN,1.5,100001,'x'])assert.throws(()=>calculate(catalog,state(['sofa-cleaning'],{'sofa-cleaning':{qty}})),/quantity/);
 assert.throws(()=>calculate(catalog,state(['sofa-cleaning'],{'sofa-cleaning':{tier:9}})),/option/);
});
test('sofa and AC options retain published prices',()=>{
 for(const [tier,price] of [199,279,349].entries())assert.equal(calculate(catalog,state(['sofa-cleaning'],{'sofa-cleaning':{qty:3,tier}})).low,price*3);
 for(const [tier,price] of [490,690].entries())assert.equal(calculate(catalog,state(['ac-services'],{'ac-services':{qty:2,tier}})).low,price*2);
});
test('recliner surcharge is bounded by seats',()=>{
 assert.equal(calculate(catalog,state(['sofa-cleaning'],{'sofa-cleaning':{qty:3,recliners:2}})).low,897);
 assert.throws(()=>calculate(catalog,state(['sofa-cleaning'],{'sofa-cleaning':{qty:2,recliners:3}})),/Recliners/);
});
test('repeated selections do not duplicate charges',()=>assert.equal(calculate(catalog,state(['bathroom-cleaning','bathroom-cleaning'])).low,890));
test('an included kitchen selection cannot remove a home chimney add-on charge',()=>{
 const r=calculate(catalog,state(['full-house-cleaning','kitchen-cleaning','chimney-cleaning'],{'full-house-cleaning':{home:'2'}}));assert.equal(r.low,10190);assert.equal(r.lines.length,2);
});
test('WhatsApp includes scope, contact and final price caveat',()=>{
 const s=state(['full-house-cleaning'],{'full-house-cleaning':{home:'2',bathrooms:2,kitchens:1}},{name:'Test Customer',phone:'+919999999999',city:'Banga',locality:'Test locality',notes:'Delicate stone'});
 const message=whatsappMessage(catalog,s,calculate(catalog,s));
 for(const text of ['2 BHK','2 bathrooms','Test Customer','Banga','Test locality','Delicate stone','₹9,500 – ₹11,900','final price','booking dates'])assert.ok(message.includes(text),text);
});
test('floor renewal applies the material range',()=>{
 const r=calculate(catalog,state(['floor-renewal'],{'floor-renewal':{floorRate:'italian-marble',qty:200}}));assert.equal(r.low,3600);assert.equal(r.high,6000);
 assert.throws(()=>calculate(catalog,state(['floor-renewal'],{'floor-renewal':{floorRate:'invalid'}})),/material/);
});
test('smaller extras remain selectable and package inclusions avoid duplicate charges',()=>{
 const extras=calculate(catalog,state(['extra-dining-chairs','extra-fan','extra-cabinets','extra-cushions']));assert.equal(extras.low,760);assert.equal(extras.high,1800);
 const sofa=calculate(catalog,state(['sofa-cleaning','extra-cushions']));assert.equal(sofa.low,199);assert.equal(sofa.includedNames.length,1);
});
