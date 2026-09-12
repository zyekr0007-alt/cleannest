import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cities} from '../site/business.mjs';
import {blogArticles} from '../site/blog.mjs';
import {slug} from '../site/catalog.mjs';

const read=file=>fs.readFileSync(file,'utf8');
const noindex=/name="robots" content="noindex(,follow)?"/;

test('duplicate city templates are retained but excluded from indexing',()=>{
 const sitemap=read('sitemap.xml');
 assert.doesNotMatch(read('jalandhar.html'),/name="robots" content="[^"]*noindex/);
 assert.match(sitemap,/jalandhar\.html/);
 for(const city of cities.slice(1)){
  const file=slug(city)+'.html';
  assert.match(read(file),noindex,file);
  assert.doesNotMatch(sitemap,new RegExp(`${slug(city)}\\.html`),city);
 }
 for(const city of ['Dasuya','Hariana']){
  const file=slug(city)+'.html';
  assert.match(read(file),noindex,file);
  assert.doesNotMatch(sitemap,new RegExp(`${slug(city)}\\.html`),city);
 }
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

test('home, service directory and Jalandhar page keep distinct search roles',()=>{
 assert.match(read('index.html'),/<title>Deep Cleaning Services in Jalandhar \| CleanNest<\/title>/);
 assert.match(read('services.html'),/<title>Home &amp; Commercial Cleaning Services \| CleanNest<\/title>/);
 assert.match(read('jalandhar.html'),/<title>Professional Cleaning in Jalandhar \| CleanNest<\/title>/);
});

// Deliberately not asserted by this release: responsive image derivatives on
// results.html and a server-rendered first quote step. Both belong to the later
// generation of the site and are not part of the mint build.
