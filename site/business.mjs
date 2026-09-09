// Verified existing business data: see REDESIGN.md (owner decisions).
export const businessInfo = {
  name: 'CleanNest',
  url: 'https://cleannest.in/',
  id: 'https://cleannest.in/#business',
  telephone: '+917610000654',
  displayPhone: '+91 76100 00654',
  email: 'cleannestclub@gmail.com',
  hours: '9 AM–8 PM, seven days a week',
  openingHours: 'Mo-Su 09:00-20:00',
  whatsapp: 'https://wa.me/917610000654',
  instagram: 'https://www.instagram.com/cleannest.co',
  map: 'https://maps.app.goo.gl/ZdvdWPmDTeBtYeqAA',
  justdial: 'https://www.justdial.com/Jalandhar/CleanNest-Palm-Royale-Estate-Khurla-Kingra/0181PX181-X181-250306105239-A6Q9_BZDET',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop 3, Wadala Road, opposite Palm Royale Estate, Guru Teg Bahadur Nagar, Green Model Town',
    addressLocality: 'Jalandhar', addressRegion: 'Punjab', postalCode: '144003', addressCountry: 'IN',
  },
};
export const address = `${businessInfo.address.streetAddress}, Jalandhar, Punjab ${businessInfo.address.postalCode}`;
export const cities = ['Jalandhar','Phagwara','Kapurthala','Nakodar','Hoshiarpur','Banga','Ludhiana','Kartarpur','Goraya','Phillaur','Adampur','Sultanpur Lodhi','Nawanshahr'];
export const businessSchema = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': businessInfo.id,
  name: businessInfo.name, url: businessInfo.url,
  logo: businessInfo.url + 'assets/img/wordmark.svg',
  telephone: businessInfo.telephone, email: businessInfo.email,
  openingHours: businessInfo.openingHours, address: businessInfo.address,
  areaServed: cities.map(name => ({'@type': 'City', name})),
  sameAs: [businessInfo.instagram, businessInfo.justdial], hasMap: businessInfo.map,
};
