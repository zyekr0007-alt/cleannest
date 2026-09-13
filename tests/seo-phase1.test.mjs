import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cities} from '../site/business.mjs';
import {blogArticles} from '../site/blog.mjs';
import {served} from '../site/geo.mjs';
import {slug} from '../site/catalog.mjs';

const read=file=>fs.readFileSync(file,'utf8');
const noindex=/name="robots" content="noindex(,follow)?"/;

test('service-area pages are indexable and each carries its own geography',()=>{
 const sitemap=read('sitemap.xml');
 for(const city of cities){
  const file=slug(city)+'.html';
  assert.doesNotMatch(read(file),noindex,file);
  assert.match(sitemap,new RegExp(`${slug(city)}\\.html`),city);
 }
 // Unconfirmed coverage stays out of the index.
 for(const city of ['Dasuya','Hariana']){
  const file=slug(city)+'.html';
  assert.match(read(file),noindex,file);
  assert.doesNotMatch(sitemap,new RegExp(`${slug(city)}\\.html`),city);
 }
 // Every town outside the base states its own distance, direction and neighbours,
 // so the pages are not near-duplicates of one another.
 for(const place of served){
  const html=read(slug(place.name)+'.html');
  assert.match(html,new RegExp(`roughly ${Math.round(place.km)} km ${place.direction}`),place.name);
  assert.match(html,new RegExp(`Towns we also serve near ${place.name}`),place.name);
 }
 const pages=cities.map(city=>read(slug(city)+'.html'));
 assert.equal(new Set(pages).size,cities.length,'service-area pages must not be duplicates');
});

// The invariant is that no author or publication date is ever invented. A
// datePublished is allowed only when the owner supplied one; everything else
// keeps null. The visible date must be rendered from the ISO field, so it can
// never drift out of step with the metadata.
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
test('articles expose only supported publication metadata',()=>{
 assert.ok(Object.keys(blogArticles).length>=15);
 for(const [id,article] of Object.entries(blogArticles)){
  assert.equal(article.author,null,'article authors are never invented');
  assert.ok(article.datePublished===null||/^\d{4}-\d{2}-\d{2}$/.test(article.datePublished),`${id}: unsupported datePublished`);
  assert.match(article.dateModified,/^\d{4}-\d{2}-\d{2}$/,`${id}: unsupported dateModified`);
  assert.ok(article.image?.url);
  const html=read(`blog/${id}.html`);
  assert.match(html,/CleanNest Cleaning Journal/);
  const [y,m,d]=article.dateModified.split('-').map(Number);
  assert.match(html,new RegExp(`<time datetime="${article.dateModified}">Updated ${d} ${MONTHS[m-1]} ${y}</time>`),`${id}: visible date must match dateModified`);
 }
});

test('home, service directory and Jalandhar page keep distinct search roles',()=>{
 assert.match(read('index.html'),/<title>Deep Cleaning Services in Jalandhar \| CleanNest<\/title>/);
 assert.match(read('services.html'),/<title>Home &amp; Commercial Cleaning Services \| CleanNest<\/title>/);
 assert.match(read('jalandhar.html'),/<title>Deep Cleaning Services in Jalandhar \| CleanNest<\/title>/);
});

// Deliberately not asserted by this release: responsive image derivatives on
// results.html and a server-rendered first quote step. Both belong to the later
// generation of the site and are not part of the mint build.
