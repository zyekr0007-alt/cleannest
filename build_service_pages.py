#!/usr/bin/env python3
"""Generate CleanNest service detail pages from the existing single-page index.html.

Each page reuses the exact shell (head/header/footer/menu/quote-modal/JS) from
index.html and only swaps the <main> content + <title>/<meta>/canonical/schema.
"""
import os, json, re

SITE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(SITE, "index.html")
WA = "917610000654"   # WhatsApp / booking number (business)
TEL = "+91 76100 00654"

STD_WHY = [
    "Professional equipment & eco-friendly, hospital-grade products",
    "Verified, trained and uniformed cleaners — no casual labour",
    "On-time arrival and honest, transparent pricing",
    "Free quote · No booking fee · No advance payment — pay after the job",
    "Rated 4.9/5 from 221+ Google reviews in Jalandhar",
]

STD_AREA = ("Jalandhar · Phagwara · Kapurthala · Hoshiarpur · Nakodar · Goraya · "
            "Adampur · Kartarpur · Sultanpur Lodhi · Nawanshahr · Phillaur · Ludhiana")

# Each service: slug, label (shown & used in WhatsApp prefill), title, desc,
# h1, sub, img, includes list, faqs [(q,a)], related slugs
SERVICES = [
    dict(slug="full-house-cleaning", label="Full House Deep Cleaning",
        title="Full House Deep Cleaning in Jalandhar | CleanNest",
        desc="Professional full-house deep cleaning in Jalandhar — every room, kitchen, bathroom, windows & floors. Free quote, no booking fee — get yours on WhatsApp.",
        h1="Full House Deep Cleaning in Jalandhar",
        sub="A top-to-bottom clean of your whole home — every room, every surface, from dust to shine.",
        img="assets/img/services/full-house-cleaning.jpg",
        includes=["Interior dusting & wipe-down of furniture and surfaces",
                  "Kitchen deep clean (countertop, stove, degrease)",
                  "Bathroom descale, sanitise & fittings polish",
                  "Floor vacuuming & mopping throughout",
                  "Windows, mirrors & glass cleaning",
                  "Appliance exterior cleaning",
                  "Skirting boards, switchboards & door frames"],
        faqs=[("How long does a full house deep cleaning take?", "It depends on the size and condition of your home. Message us on WhatsApp with your home size and we'll give you an honest time estimate and a free quote."),
              ("Do I need to pay in advance?", "No. There is no booking fee and no advance payment — you only pay after the job is done."),
              ("Are the products safe for kids and pets?", "Yes — we use professional, eco-friendly products that leave no harsh smells and are safe for your family and pets.")],
        related=["kitchen-cleaning", "bathroom-cleaning", "sofa-cleaning", "carpet-steam-cleaning"]),

    dict(slug="kitchen-cleaning", label="Kitchen Deep Cleaning",
        title="Kitchen Deep Cleaning in Jalandhar | CleanNest",
        desc="Kitchen deep cleaning in Jalandhar — chimney, gas stove, cabinets, countertop & tile degrease. Free quote on WhatsApp, no booking fee.",
        h1="Kitchen Deep Cleaning in Jalandhar",
        sub="Degrease and refresh your kitchen — chimney, stove, cabinets and tiles, cleaned right.",
        img="assets/img/services/kitchen-deep-cleaning.jpg",
        includes=["Chimney & exhaust cleaning",
                  "Gas stove & hob degrease",
                  "Cabinets & drawers wiped down inside and out",
                  "Countertop & sink deep clean",
                  "Backsplash & wall tile scrubbing",
                  "Appliance exterior cleaning",
                  "Grease & grime removal"],
        faqs=[("Can you clean the chimney as part of the kitchen service?", "Yes — chimney filter and duct cleaning is included in our kitchen deep cleaning. We also offer a dedicated chimney cleaning service if you prefer."),
              ("How do I get a quote?", "Message us on WhatsApp with your kitchen size and condition — we reply quickly with a free, no-obligation quote."),
              ("Do you use harsh chemicals?", "No — we use professional, eco-friendly products that leave no harsh smells and are safe for your kitchen and family.")],
        related=["full-house-cleaning", "chimney-cleaning", "commercial-cleaning"]),

    dict(slug="bathroom-cleaning", label="Bathroom Deep Cleaning",
        title="Bathroom Deep Cleaning in Jalandhar | CleanNest",
        desc="Bathroom deep cleaning in Jalandhar — tiles, grout, fittings, shower, mirror & descaling. Free quote on WhatsApp, no booking fee.",
        h1="Bathroom Deep Cleaning in Jalandhar",
        sub="Remove grime, limescale and soap scum to leave your bathroom fresh and sparkling.",
        img="assets/img/services/bathroom-deep-cleaning.jpg",
        includes=["Tile & grout deep scrubbing",
                  "Basin, faucet & fittings polish",
                  "Shower & bathtub descale",
                  "Mirror & glass cleaning",
                  "Sanitising & hygiene treatment",
                  "Floor scrub & drain cleaning"],
        faqs=[("Can you remove limescale and hard water stains?", "Yes — we use specialist descalers to lift limescale from tiles, fittings and glass. Message us on WhatsApp for a free quote."),
              ("How long does a bathroom deep clean take?", "Typically a few hours per bathroom depending on condition. Share your bathroom size on WhatsApp and we'll give you an honest estimate."),
              ("Are your products safe for kids and pets?", "Yes — we use professional, eco-friendly products that are safe for your family and pets.")],
        related=["full-house-cleaning", "kitchen-cleaning"]),

    dict(slug="sofa-cleaning", label="Sofa Dry Cleaning",
        title="Sofa Dry Cleaning in Jalandhar | CleanNest",
        desc="Sofa dry cleaning in Jalandhar — fabric sofas deep cleaned, stains & odours removed. Free quote on WhatsApp, no booking fee.",
        h1="Sofa Dry Cleaning in Jalandhar",
        sub="Deep-clean your fabric sofa to lift dirt, stains and odours — best sofa dry cleaning service in Jalandhar.",
        img="assets/img/services/sofa-dry-cleaning.jpg",
        includes=["Fabric deep cleaning (dry-clean method)",
                  "Stain & spot treatment",
                  "Odour neutralising",
                  "Upholstery & cushion cleaning",
                  "Quick-dry treatment"],
        faqs=[("Which types of sofa can you clean?", "We clean most fabric sofas and upholstery. Message us on WhatsApp with your sofa type (fabric/leather, 2/3/5-seater) and we'll confirm and quote."),
              ("Will my sofa be dry quickly?", "Yes — we use a quick-dry method so your sofa is comfortable again within the day."),
              ("Do you remove stains?", "We treat common stains and odours as part of the service; deep-set stains may need extra treatment which we'll advise honestly.")],
        related=["carpet-steam-cleaning", "full-house-cleaning", "bathroom-cleaning"]),

    dict(slug="carpet-steam-cleaning", label="Carpet and Steam Cleaning",
        title="Carpet & Steam Cleaning in Jalandhar | CleanNest",
        desc="Carpet & steam cleaning in Jalandhar — carpets, rugs & mattresses deep cleaned. Free quote on WhatsApp, no booking fee.",
        h1="Carpet & Steam Cleaning in Jalandhar",
        sub="Steam-clean carpets, rugs and mattresses to remove embedded dirt, stains and allergens.",
        img="assets/img/services/carpet-steam-cleaning.jpg",
        includes=["Carpet deep clean & steam treatment",
                  "Rug & mat cleaning",
                  "Stain & odour treatment",
                  "Mattress deep clean (optional)",
                  "Dirt, dust & allergen removal",
                  "Quick-dry treatment"],
        faqs=[("Is steam cleaning good for carpets?", "Yes — steam cleaning lifts embedded dirt, dust mites and allergens from deep in the fibres, leaving carpets fresh and hygienic."),
              ("How long until it dries?", "With our quick-dry treatment, most carpets are dry within a few hours."),
              ("How do I get a quote?", "Message us on WhatsApp with the carpet sizes or number of rooms — we reply quickly with a free, no-obligation quote.")],
        related=["sofa-cleaning", "full-house-cleaning"]),

    dict(slug="ac-services", label="AC Services",
        title="AC Service & Deep Cleaning in Jalandhar | CleanNest",
        desc="AC cleaning & servicing in Jalandhar — filter, coil & blower cleaning for split & window ACs. Improves cooling & air quality. Free quote.",
        h1="AC Service & Deep Cleaning in Jalandhar",
        sub="Improve cooling and air quality — a professional deep clean of your split or window AC.",
        img="assets/img/services/ac-services.jpg",
        includes=["Filter cleaning",
                  "Evaporator coil cleaning",
                  "Blower / fan cleaning",
                  "Drain tray & pipe cleaning",
                  "Air outlet grille cleaning",
                  "Cooling & airflow performance check"],
        faqs=[("How often should an AC be deep cleaned?", "Every 3–6 months, or before and after peak summer use. Regular cleaning improves cooling, reduces power use and prevents musty smell."),
              ("Will cleaning improve cooling?", "Yes — dust-clogged coils and filters reduce cooling dramatically. After a deep clean, most ACs cool faster and use less power."),
              ("Is gas refill included?", "Cleaning is separate from gas refilling. If your AC needs gas, we'll advise you honestly after the cleaning check — no unnecessary upselling.")],
        related=["full-house-cleaning", "commercial-cleaning"]),

    dict(slug="chimney-cleaning", label="Chimney Cleaning",
        title="Chimney Cleaning in Jalandhar | CleanNest",
        desc="Kitchen chimney cleaning in Jalandhar — filter, motor & duct cleaning for better airflow & safety. Free quote on WhatsApp, no booking fee.",
        h1="Chimney Cleaning in Jalandhar",
        sub="A clean chimney means better airflow, less grease build-up and a safer kitchen.",
        img="assets/img/services/chimney-cleaning.jpg",
        includes=["Chimney filter cleaning",
                  "Motor & baffle cleaning",
                  "Duct / flue cleaning",
                  "Grease & soot removal",
                  "Outer body polish",
                  "Airflow check"],
        faqs=[("How often should my chimney be cleaned?", "Every 3–6 months depending on how often you cook. A clean chimney runs better and reduces fire risk from grease build-up."),
              ("Does cleaning improve performance?", "Yes — a greasy filter reduces suction. After cleaning, your chimney pulls smoke and odours far better."),
              ("How do I get a quote?", "Message us on WhatsApp with your chimney type and size — we reply quickly with a free, no-obligation quote.")],
        related=["kitchen-cleaning", "full-house-cleaning"]),

    dict(slug="commercial-cleaning", label="Commercial Cleaning",
        title="Commercial Cleaning in Jalandhar | CleanNest",
        desc="Commercial & office cleaning in Jalandhar — offices, shops & workspaces deep cleaned. Free quote on WhatsApp, no booking fee.",
        h1="Commercial Cleaning in Jalandhar",
        sub="Keep your office, shop or workspace spotless and hygienic for your team and customers.",
        img="assets/img/services/commercial-cleaning.jpg",
        includes=["Office floor vacuuming & mopping",
                  "Desks, counters & workstations",
                  "Washroom cleaning & replenishment",
                  "Reception & common areas",
                  "Glass & frontage cleaning",
                  "Waste removal & free quote"],
        faqs=[("Can you clean on a schedule?", "Yes — we offer one-off deep cleans and regular recurring visits. Message us on WhatsApp with your space size and we'll recommend a plan."),
              ("Do you clean after business hours?", "We can arrange cleaning at a time that suits your business. Share your hours on WhatsApp and we'll fit around you."),
              ("How do I get a quote?", "Tell us the nature and size of your space on WhatsApp — we reply quickly with a free, no-obligation quote.")],
        related=["full-house-cleaning", "ac-services"]),
]

BY_SLUG = {s["slug"]: s for s in SERVICES}

def enc(text):
    return str(text).replace("%", "%25").replace(" ", "%20").replace("'", "%27").replace("&", "%26")

def wa_prefill(label):
    msg = "Hi CleanNest! I'd like a quote for %s." % label
    return "https://wa.me/%s?text=%s" % (WA, enc(msg))

def build_faq_block(faqs):
    items = "".join(
        '\n      <details class="faq-item">\n        <summary>%s</summary>\n        <p>%s</p>\n      </details>' % (q, a)
        for (q, a) in faqs)
    return ('\n  <section class="faqs" id="faqs">\n'
            '    <div class="section-head">\n'
            '      <span class="section-badge">FAQs</span>\n'
            '      <h2 class="section-title">%s <span class="star">questions</span></h2>\n'
            '    </div>\n'
            '    <div class="faq-list">%s\n    </div>\n  </section>' %
            ("Common", items))

def build_main(s):
    wa = wa_prefill(s["label"])
    related_links = "".join(
        '\n      <a class="service-tile" href="%s.html">\n        <img src="assets/img/services/%s.jpg" alt="%s" width="640" height="400" loading="lazy">\n        <span class="service-tag">%s</span>\n      </a>' %
        (r["slug"], r["img"].split("/")[-1][:-4], r["label"], r["label"])
        for r in (BY_SLUG[x] for x in s["related"]))

    why = "".join("\n      <li>%s</li>" % w for w in STD_WHY)
    return (
        '\n  <main>\n'
        # --- Hero (navy band) ---
        '\n  <section class="cta-band" id="top">\n'
        '    <span class="section-badge">CleanNest · Jalandhar</span>\n'
        '    <h1 class="cta-title">%s</h1>\n'
        '    <p class="cta-sub">%s</p>\n'
        '    <div class="cta-actions">\n'
        '      <a class="cta-btn cta-wa" href="%s" target="_blank" rel="noopener">Get Free Quote on WhatsApp</a>\n'
        '      <a class="cta-btn cta-call" href="tel:+%s">Call %s</a>\n'
        '    </div>\n'
        '  </section>\n'
        # --- Intro ---
        '  <section class="services" id="about">\n'
        '    <div class="section-head">\n'
        '      <span class="section-badge">Our Services</span>\n'
        '      <h2 class="section-title">%s</h2>\n'
        '      <p class="section-sub">%s</p>\n'
        '    </div>\n'
        '    <div class="srv-hero-media"><img src="%s" alt="%s" width="1260" height="700" loading="lazy"></div>\n'
        '  </section>\n'
        # --- What's included ---
        '  <section class="services" id="included">\n'
        '    <div class="section-head">\n'
        '      <span class="section-badge">What\'s Included</span>\n'
        '      <h2 class="section-title">Every detail covered</h2>\n'
        '      <p class="section-sub">A thorough, professional clean for %s.</p>\n'
        '    </div>\n'
        '    <ul class="srv-included">\n%s\n    </ul>\n'
        '  </section>\n'
        # --- Why choose ---
        '  <section class="services" id="why">\n'
        '    <div class="section-head">\n'
        '      <span class="section-badge">Why CleanNest</span>\n'
        '      <h2 class="section-title">Trusted by <span class="star">Jalandhar</span></h2>\n'
        '      <p class="section-sub">Here\'s why locals choose us.</p>\n'
        '    </div>\n'
        '    <ul class="srv-included">\n%s\n    </ul>\n'
        '  </section>\n'
        # --- Reviews (real) ---
        '  <section class="reviews" id="reviews">\n'
        '    <div class="reviews-head">\n'
        '      <span class="reviews-badge">Reviews</span>\n'
        '      <h2 class="reviews-title">Rated <span class="star">4.9/5</span> on Google</h2>\n'
        '      <p class="reviews-count">From real customers in Jalandhar &amp; nearby</p>\n'
        '    </div>\n'
        '    <div class="reviews-grid">\n'
        '      <div class="review-card">\n'
        '        <div class="review-top"><span class="review-avatar">NV</span>'
        '          <div class="review-meta"><span class="review-name">Neha Verma</span>'
        '          <span class="review-stars" aria-label="5 out of 5 stars">★★★★★</span></div></div>\n'
        '        <p class="review-text">We are so grateful to CleanNest for helping us clean up our home after the flood. Their team responded quickly, provided excellent service, and completed the work efficiently.</p>\n'
        '        <span class="review-tag">Google Review</span>\n'
        '      </div>\n'
        '      <div class="review-card">\n'
        '        <div class="review-top"><span class="review-avatar avatar-g">G</span>'
        '          <div class="review-meta"><span class="review-name">Google review</span>'
        '          <span class="review-stars" aria-label="5 out of 5 stars">★★★★★</span></div></div>\n'
        '        <p class="review-text">Best sofa dry cleaning service I ever received.</p>\n'
        '        <span class="review-tag">Sofa cleaning</span>\n'
        '      </div>\n'
        '      <div class="review-card">\n'
        '        <div class="review-top"><span class="review-avatar avatar-g">G</span>'
        '          <div class="review-meta"><span class="review-name">Google review</span>'
        '          <span class="review-stars" aria-label="5 out of 5 stars">★★★★★</span></div></div>\n'
        '        <p class="review-text">No harsh smells, just a fresh and hygienic environment.</p>\n'
        '        <span class="review-tag">Google Review</span>\n'
        '      </div>\n'
        '    </div>\n'
        '  </section>\n'
        # --- FAQs ---
        '%s\n'
        # --- Related services ---
        '  <section class="services" id="related">\n'
        '    <div class="section-head">\n'
        '      <span class="section-badge">Related</span>\n'
        '      <h2 class="section-title">You may also <span class="star">like</span></h2>\n'
        '    </div>\n'
        '    <div class="services-grid">%s\n    </div>\n'
        '  </section>\n'
        # --- Bottom CTA ---
        '  <section class="cta-band" id="contact">\n'
        '    <h2 class="cta-title">Ready for a <span class="star">spotless space?</span></h2>\n'
        '    <p class="cta-sub">Get your free quote in minutes — no booking fee, no advance payment.</p>\n'
        '    <div class="cta-actions">\n'
        '      <a class="cta-btn cta-wa" href="%s" target="_blank" rel="noopener">Get Free Quote on WhatsApp</a>\n'
        '      <a class="cta-btn cta-call" href="tel:+%s">Call %s</a>\n'
        '    </div>\n'
        '  </section>\n'
        '  </main>\n'
        % (s["h1"], s["sub"], wa, WA, TEL,
           s["h1"], s["sub"], s["img"], s["h1"],
           s["label"], "\n".join("<li>%s</li>" % i for i in s["includes"]),
           why,
           build_faq_block(s["faqs"]),
           related_links,
           wa, WA, TEL)
    )

def build_schema(s):
    """JSON-LD for the service (Service + FAQPage, no invented prices)."""
    faq_ent = "".join(
        '{"@type":"Question","name":%s,"acceptedAnswer":{"@type":"Answer","text":%s}}' %
        (json.dumps(q), json.dumps(a)) for (q, a) in s["faqs"])
    return (
        '  <script type="application/ld+json">{\n'
        '    "@context":"https://schema.org",\n'
        '    "@type":"Service",\n'
        '    "name":%s,\n'
        '    "serviceType":%s,\n'
        '    "provider":{"@type":"LocalBusiness","name":"CleanNest",'
        '"telephone":"+%s","areaServed":"Jalandhar",'
        '"address":{"@type":"PostalAddress","addressLocality":"Jalandhar","addressRegion":"Punjab","addressCountry":"IN"}},\n'
        '    "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"221"}\n'
        '  }</script>\n'
        '  <script type="application/ld+json">{\n'
        '    "@context":"https://schema.org","@type":"FAQPage","mainEntity":[%s]\n'
        '  }</script>\n'
        % (json.dumps(s["h1"]), json.dumps(s["h1"]), WA, faq_ent))

def main():
    html = open(INDEX, encoding="utf-8").read()
    # Split into shell head (through hero <main>) and tail (from </footer>)
    head_idx = html.index('<main class="hero"')
    tail_marker = '</footer>'
    tail_idx = html.index(tail_marker)
    shell_head = html[:head_idx]
    shell_tail = html[tail_idx:]   # includes '</footer>' onward (footer+menu+quote+script)

    for s in SERVICES:
        # 1) Title + description (direct replace of known originals; no regex/None)
        page = shell_head
        page = page.replace("CleanNest — Jalandhar's Most Trusted Cleaning Service",
                            s["title"], 1)
        page = page.replace(
            "From dust to shine everytime! CleanNest is Jalandhar's most trusted cleaning service. Get a free quote on WhatsApp.",
            s["desc"], 1)

        # 2) Canonical + schema before </head>
        canonical = ('\n  <link rel="canonical" href="https://www.cleannest.in/%s.html">\n' % s["slug"])
        page = page.replace('</head>', canonical + build_schema(s) + '\n</head>')

        # 3) Service <main> + shell tail
        page += build_main(s) + shell_tail

        # 4) Menu anchor links -> return to home page sections
        for anchor in ["services", "gallery", "reviews", "faqs", "contact"]:
            page = page.replace('href="#%s"' % anchor, 'href="/index.html#%s"' % anchor)

        out = os.path.join(SITE, s["slug"] + ".html")
        open(out, "w", encoding="utf-8").write(page)
        print("wrote %s (%d bytes)" % (s["slug"] + ".html", len(page)))

if __name__ == "__main__":
    main()
