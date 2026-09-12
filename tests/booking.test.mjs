import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {services,groups,homes,supplements} from '../site/catalog.mjs';
import {booking} from '../site/booking.mjs';
import {calculate,whatsappMessage} from '../assets/estimate.mjs';
const catalog={services,groups,homes,supplements,booking,kitchenIncludesChimney:false};
test('wooden floor starting price stays a custom quote, not an invented total',()=>{
 const state={selected:['wooden-floor-polishing'],configs:{'wooden-floor-polishing':{qty:2}},name:'QA',phone:'9999999999'};
 const result=calculate(catalog,state);
 assert.equal(result.custom,true);assert.equal(result.low,0);
 assert.match(result.lines[0].detail,/2 room\(s\); from ₹2,490/);
 const message=whatsappMessage(catalog,state,result);
 assert.match(message,/30%/);assert.match(message,/70%/);assert.match(message,/48 hours/);
});
test('recurring quote handoff retains frequency and initial deep-clean requirement',()=>{
 const state={selected:['recurring-cleaning'],configs:{'recurring-cleaning':{frequency:'Weekly'}},name:'QA',phone:'9999999999'};
 const result=calculate(catalog,state);
 assert.equal(result.custom,true);
 assert.match(whatsappMessage(catalog,state,result),/Weekly after an initial deep clean/);
});
test('live page sources agree on 30/70 payment and the 48-hour cancellation boundary',()=>{
 for(const file of ['refund.html','terms.html','pricing.html','quote.html','faqs.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/30%/,file);assert.match(html,/70%/,file);assert.match(html,/48 hours/,file);
  assert.doesNotMatch(html,/50%|Cancellations inside 24 hours/,file);
 }
});
