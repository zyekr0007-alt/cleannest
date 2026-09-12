import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {businessInfo,cities} from '../site/business.mjs';
import {blogArticles} from '../site/blog.mjs';
import {slug} from '../site/catalog.mjs';

const read=file=>fs.readFileSync(file,'utf8');

test('duplicate city templates are retained but excluded from indexing',()=>{
 const sitemap=read('sitemap.xml');
 assert.doesNotMatch(read('jalandhar.html'),/name="robots" content="[^"]*noindex/);
 assert.match(sitemap,/jalandhar\.html/);
 for(const city of cities.slice(1)){
  const file=slug(city)+'.html';
  assert.match(read(file),/name="robots" content="noindex,follow"/);
  assert.doesNotMatch(sitemap,new RegExp(`${slug(city)}\\.html`));
 }
 for(const city of ['Dasuya','Hariana']){
  const file=slug(city)+'.html';
  assert.match(read(file),/name="robots" content="noindex,follow"/);
  assert.doesNotMatch(sitemap,new RegExp(`${slug(city)}\\.html`));
 }
});

test('results page serves responsive derivatives and never references PNG originals',()=>{
 const html=read('results.html');
 assert.match(html,/<source type="image\/avif" srcset=/);
 assert.match(html,/srcset="[^"]+-480\.webp 480w,[^"]+-720\.webp 720w,[^"]+ 880w"/);
 assert.match(html,/sizes="\(max-width: 700px\)/);
 assert.doesNotMatch(html,/assets\/img\/results\/before-after-[^"]+\.png/);
 assert.equal(fs.readdirSync('assets/img/results/responsive').length,145);
});

test('quote first step is server rendered and contact data comes from business source',()=>{
 const html=read('quote.html');
 assert.match(html,/id="quote-stage"><h2[^>]*>What needs cleaning\?/);
 assert.match(html,new RegExp(`data-whatsapp="${businessInfo.whatsapp}"`));
 assert.doesNotMatch(read('assets/quote-flow.js'),/917610000654/);
});

test('articles expose only supported publication metadata',()=>{
 assert.equal(Object.keys(blogArticles).length,15);
 for(const [id,article] of Object.entries(blogArticles)){
  assert.equal(article.author,null);
  assert.equal(article.datePublished,null);
  assert.equal(article.dateModified,'2026-09-12');
  assert.ok(article.image?.url);
  const html=read(`blog/${id}.html`);
  assert.match(html,/CleanNest Cleaning Journal/);
  assert.match(html,/<time datetime="2026-09-12">Updated 12 September 2026<\/time>/);
 }
});

test('home, service directory and Jalandhar page have distinct search roles',()=>{
 assert.match(read('index.html'),/<title>CleanNest \| Professional Cleaning in Jalandhar<\/title>/);
 assert.match(read('services.html'),/<title>Cleaning Services Directory \| CleanNest Jalandhar<\/title>/);
 assert.match(read('jalandhar.html'),/<title>Cleaning Company in Jalandhar \| CleanNest<\/title>/);
});
