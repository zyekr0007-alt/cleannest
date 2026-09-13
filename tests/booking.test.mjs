import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {services,groups,homes,supplements} from '../site/catalog.mjs';
import {booking} from '../site/booking.mjs';
import {calculate,whatsappMessage} from '../assets/estimate.mjs';

const catalog={services,groups,homes,supplements,booking,kitchenIncludesChimney:false};

test('live page sources agree on 30/70 payment and the 48-hour cancellation boundary',()=>{
 for(const file of ['refund.html','terms.html','pricing.html','quote.html','faqs.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/30%/,file);assert.match(html,/70%/,file);assert.match(html,/48 hours/,file);
  assert.doesNotMatch(html,/50%|Cancellations inside 24 hours/,file);
 }
});

test('the guided estimate treats wooden floor care as a custom quote',()=>{
 const state={selected:['wooden-floor-polishing'],configs:{'wooden-floor-polishing':{qty:2}},name:'QA',phone:'9999999999'};
 const result=calculate(catalog,state);
 assert.equal(result.custom,true);
 assert.equal(result.low,0);
});

test('the WhatsApp handoff carries the published payment and cancellation terms',()=>{
 const state={selected:['full-house-cleaning'],configs:{'full-house-cleaning':{home:'2'}},name:'QA',phone:'9999999999'};
 const message=whatsappMessage(catalog,state,calculate(catalog,state));
 assert.match(message,/30%/);assert.match(message,/70%/);assert.match(message,/48 hours/);
 assert.doesNotMatch(message,/50%/);
});
