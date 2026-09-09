import {businessSchema, businessInfo} from './business.mjs';
import {faqSections} from './catalog.mjs';

export const textContent = html => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const crumbs = items => ({
  '@context':'https://schema.org', '@type':'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({'@type':'ListItem', position:i+1, name, item})),
});
export function pageSchema({file, page, canonical, service, isArticle, metadata = {}}) {
  const schema = [businessSchema];
  const trail = [['Home', businessInfo.url]];
  if (service) {
    schema.push({'@context':'https://schema.org', '@type':'Service',
      '@id':canonical+'#service', name:service.name, serviceType:service.name,
      description:page.description, provider:{'@id':businessInfo.id},
      areaServed:businessSchema.areaServed, url:canonical});
    // Offers deliberately omitted: per-unit starting rates are not whole-job quotes.
    trail.push(['Services',businessInfo.url+'services.html'],[service.name,canonical]);
  } else if (isArticle) {
    schema.push({'@context':'https://schema.org', '@type':'BlogPosting',
      '@id':canonical+'#article', headline:page.h1 || page.title.split('|')[0].trim(),
      description:page.description, mainEntityOfPage:{'@type':'WebPage','@id':canonical},
      publisher:{'@id':businessInfo.id},
      ...(metadata.image ? {image:new URL(metadata.image,businessInfo.url).href} : {}),
      ...(metadata.author ? {author:metadata.author} : {}),
      ...(metadata.datePublished ? {datePublished:metadata.datePublished} : {}),
      ...(metadata.dateModified ? {dateModified:metadata.dateModified} : {}),
    });
    trail.push(['Cleaning Journal',businessInfo.url+'blog/index.html'],[page.h1 || page.title,canonical]);
  }
  if(file === 'faqs.html') schema.push({'@context':'https://schema.org','@type':'FAQPage',
    '@id':canonical+'#faqs',mainEntity:faqSections.flatMap(([,items])=>items).map(([q,a])=>({
      '@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a},
    }))});
  if(file === 'reviews.html') schema.push({'@context':'https://schema.org','@type':'CollectionPage', name:page.title,url:canonical,about:{'@id':businessInfo.id}});
  if(trail.length>1) schema.push(crumbs(trail));
  return schema;
}
