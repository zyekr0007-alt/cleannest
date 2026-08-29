#!/usr/bin/env python3
"""Generate CleanNest service detail pages from the existing single-page index.html.

Each page reuses the exact shell (head/header/footer/menu/quote-modal/JS) from
index.html and only swaps the <main> content + <title>/<meta>/canonical/schema.
Also generates services.html (all services, with starting prices).
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
    "Free quote · No booking fee · 50% advance to book, 50% after service",
    "Rated 4.9/5 from 468 Google reviews in Jalandhar",
]

STD_AREA = ("Jalandhar · Phagwara · Kapurthala · Hoshiarpur · Nakodar · Goraya · "
            "Adampur · Kartarpur · Sultanpur Lodhi · Nawanshahr · Phillaur · Ludhiana")

# Each service: slug, label (shown & used in WhatsApp prefill), title, desc,
# h1, sub, img, includes list, faqs [(q,a)], related slugs, price label
SERVICES = [
    dict(slug="full-house-cleaning", label="Full House Deep Cleaning",
        title="Full House Deep Cleaning in Jalandhar | CleanNest",
        desc="Professional full-house deep cleaning in Jalandhar — every room, kitchen, bathroom, windows & floors. From ₹4,900. Free quote on WhatsApp.",
        h1="Full House Deep Cleaning in Jalandhar",
        sub="A top-to-bottom clean of your whole home — every room, every surface, from dust to shine.",
        img="assets/img/services/full-house-cleaning.jpg",
        price="From ₹4,900",
        includes=["Interior dusting & wipe-down of furniture and surfaces",
                  "Kitchen deep clean (countertop, stove, degrease)",
                  "Bathroom descale, sanitise & fittings polish",
                  "Floor vacuuming & mopping throughout",
                  "Windows, mirrors & glass cleaning",
                  "Appliance exterior cleaning",
                  "Skirting boards, switchboards & door frames"],
        faqs=[("How long does a full house deep cleaning take?", "It depends on the size and condition of your home. Message us on WhatsApp with your home size and we'll give you an honest time estimate and a free quote."),
              ("How does payment work?", "A 50% advance is required to confirm your booking, with the remaining 50% payable after the service is completed."),
              ("Are the products safe for kids and pets?", "Yes — we use professional, eco-friendly products that leave no harsh smells and are safe for your family and pets.")],
        related=["kitchen-cleaning", "bathroom-cleaning", "sofa-cleaning", "carpet-steam-cleaning"]),

    dict(slug="kitchen-cleaning", label="Kitchen Deep Cleaning",
        title="Kitchen Deep Cleaning in Jalandhar | CleanNest",
        desc="Kitchen deep cleaning in Jalandhar — chimney, gas stove, cabinets, countertop & tile degrease. From ₹2,490. Free quote on WhatsApp.",
        h1="Kitchen Deep Cleaning in Jalandhar",
        sub="Degrease and refresh your kitchen — chimney, stove, cabinets and tiles, cleaned right.",
        img="assets/img/services/kitchen-deep-cleaning.jpg",
        price="From ₹2,490",
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
        desc="Bathroom deep cleaning in Jalandhar — tiles, grout, fittings, shower, mirror & descaling. From ₹890. Free quote on WhatsApp.",
        h1="Bathroom Deep Cleaning in Jalandhar",
        sub="Remove grime, limescale and soap scum to leave your bathroom fresh and sparkling.",
        img="assets/img/services/bathroom-deep-cleaning.jpg",
        price="From ₹890",
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
        desc="Sofa dry cleaning in Jalandhar — fabric sofas deep cleaned, stains & odours removed. From ₹199/seat. Free quote on WhatsApp.",
        h1="Sofa Dry Cleaning in Jalandhar",
        sub="Deep-clean your fabric sofa to lift dirt, stains and odours — best sofa dry cleaning service in Jalandhar.",
        img="assets/img/services/sofa-dry-cleaning.jpg",
        price="From ₹199 / seat",
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
        desc="Carpet & steam cleaning in Jalandhar — carpets, rugs & mattresses deep cleaned. From ₹25/sq.ft. Free quote on WhatsApp.",
        h1="Carpet & Steam Cleaning in Jalandhar",
        sub="Steam-clean carpets, rugs and mattresses to remove embedded dirt, stains and allergens.",
        img="assets/img/services/carpet-steam-cleaning.jpg",
        price="From ₹25 / sq.ft",
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
        desc="AC cleaning & servicing in Jalandhar — filter, coil & blower cleaning for split & window ACs. From ₹490. Improves cooling & air quality. Free quote.",
        h1="AC Service & Deep Cleaning in Jalandhar",
        sub="Improve cooling and air quality — a professional deep clean of your split or window AC.",
        img="assets/img/services/ac-services.jpg",
        price="From ₹490",
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
        desc="Kitchen chimney cleaning in Jalandhar — filter, motor & duct cleaning for better airflow & safety. From ₹690. Free quote on WhatsApp.",
        h1="Chimney Cleaning in Jalandhar",
        sub="A clean chimney means better airflow, less grease build-up and a safer kitchen.",
        img="assets/img/services/chimney-cleaning.jpg",
        price="From ₹690",
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
        desc="Commercial & office cleaning in Jalandhar — offices, shops & workspaces deep cleaned. From ₹6/sq.ft. Free quote on WhatsApp.",
        h1="Commercial Cleaning in Jalandhar",
        sub="Keep your office, shop or workspace spotless and hygienic for your team and customers.",
        img="assets/img/services/commercial-cleaning.jpg",
        price="From ₹6 / sq.ft",
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

    # ---- New services (from the official rate card) ----
    dict(slug="balcony-cleaning", label="Balcony Deep Cleaning",
        title="Balcony Deep Cleaning in Jalandhar | CleanNest",
        desc="Balcony deep cleaning in Jalandhar — floor scrubbing, railing wash & stain lifting. From ₹490. Free quote on WhatsApp.",
        h1="Balcony Deep Cleaning in Jalandhar",
        sub="Scrub away grime, stains and weather marks from your balcony, floor to railing.",
        img="assets/img/services/balcony-cleaning.webp",
        price="From ₹490",
        includes=["Floor rotary scrubbing",
                  "Glass & metal railing wash",
                  "Stain & weather-mark lifting",
                  "Pigeon droppings removal",
                  "Wall & corner scrub"],
        faqs=[("Can you clean a covered balcony?", "Yes — we clean covered and open balconies, including railings, tiles and glass. Message us on WhatsApp for a free quote."),
              ("How do I get a quote?", "Share your balcony size and condition on WhatsApp — we reply quickly with a free, no-obligation quote.")],
        related=["full-house-cleaning", "kitchen-cleaning"]),

    dict(slug="gas-stove-cleaning", label="Gas Stove / Cooktop Cleaning",
        title="Gas Stove & Cooktop Cleaning in Jalandhar | CleanNest",
        desc="Gas stove & cooktop cleaning in Jalandhar — burner de-clogging, tray cleaning & grease removal. From ₹290. Free quote on WhatsApp.",
        h1="Gas Stove / Cooktop Cleaning in Jalandhar",
        sub="De-clog burners and strip years of grease from your cooktop — looks and cooks like new.",
        img="assets/img/services/gas-stove-cleaning.webp",
        price="From ₹290",
        includes=["Burner de-clogging",
                  "Tray & drip-pan cleaning",
                  "Grease scraping",
                  "Surface & nozzle detailing"],
        faqs=[("Is the stove disassembled for cleaning?", "We clean burners, trays and surfaces thoroughly on-site — no plumbing or gas line work. Message us on WhatsApp for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with your stove type and condition — we reply quickly with a free, no-obligation quote.")],
        related=["kitchen-cleaning", "chimney-cleaning"]),

    dict(slug="exhaust-fan-cleaning", label="Exhaust Fan Cleaning",
        title="Exhaust Fan Cleaning in Jalandhar | CleanNest",
        desc="Exhaust fan cleaning in Jalandhar — industrial degreasing of blades & frame. From ₹290. Free quote on WhatsApp.",
        h1="Exhaust Fan Cleaning in Jalandhar",
        sub="Strip heavy grease from your kitchen exhaust fan — cleaner air, safer kitchen.",
        img="assets/img/services/exhaust-fan-cleaning.webp",
        price="From ₹290",
        includes=["Blade degreasing",
                  "Frame & grill cleaning",
                  "Motor casing wipe",
                  "Grease & grime removal"],
        faqs=[("How often should an exhaust fan be cleaned?", "Every 2–3 months for kitchens that cook regularly. Heavy grease reduces airflow and is a fire risk. Message us on WhatsApp for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with the number of fans — we reply quickly with a free, no-obligation quote.")],
        related=["chimney-cleaning", "kitchen-cleaning"]),

    dict(slug="refrigerator-cleaning", label="Refrigerator Deep Clean",
        title="Refrigerator Deep Cleaning in Jalandhar | CleanNest",
        desc="Refrigerator deep cleaning in Jalandhar — trays, gaskets & shelves scrubbed, odours removed. From ₹699. Free quote on WhatsApp.",
        h1="Refrigerator Deep Clean in Jalandhar",
        sub="Trays, gaskets and shelves deep-cleaned and de-odourised — with optional steam sanitisation.",
        img="assets/img/services/refrigerator-cleaning.webp",
        price="From ₹699",
        includes=["Removable tray & shelf scrub",
                  "Gasket de-molding",
                  "Interior odour kill",
                  "Steam clean + sanitisation option",
                  "Exterior polish"],
        faqs=[("Do I need to empty the fridge first?", "It helps if perishables are moved to a cooler, but we handle the shelves and trays. Message us on WhatsApp with your fridge type for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with your fridge type (single/double/side-by-side) — we reply quickly with a free, no-obligation quote.")],
        related=["kitchen-cleaning", "full-house-cleaning"]),

    dict(slug="mattress-steam-cleaning", label="Mattress Sanitisation",
        title="Mattress Steam Cleaning & Sanitisation in Jalandhar | CleanNest",
        desc="Mattress steam cleaning & sanitisation in Jalandhar — deep extraction & high-temp steam kill. From ₹799. Free quote on WhatsApp.",
        h1="Mattress Steam Cleaning & Sanitisation in Jalandhar",
        sub="Deep extraction and high-temperature steam — an anti-allergen treatment for a hygienic mattress.",
        img="assets/img/services/mattress-steam-cleaning.webp",
        price="From ₹799",
        includes=["Deep dirt & dust extraction",
                  "High-temperature steam kill",
                  "Anti-allergen & dust mite treatment",
                  "Odour removal",
                  "Fresh, dry finish"],
        faqs=[("How long does a mattress take to dry?", "With steam extraction, most mattresses dry within a few hours depending on ventilation. Message us on WhatsApp for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with your mattress size (single/queen/king) — we reply quickly with a free, no-obligation quote.")],
        related=["carpet-steam-cleaning", "sofa-cleaning"]),

    dict(slug="curtain-cleaning", label="Curtain Dry Cleaning",
        title="Curtain Dry Cleaning in Jalandhar | CleanNest",
        desc="Curtain dry cleaning in Jalandhar — on-site vacuuming & dry treatment, no removal needed. From ₹190/panel. Free quote on WhatsApp.",
        h1="Curtain Dry Cleaning in Jalandhar",
        sub="Clean curtains right where they hang — industrial vacuuming and dry treatment that lifts dust and odours.",
        img="assets/img/services/curtain-cleaning.webp",
        price="From ₹190 / panel",
        includes=["On-site industrial vacuuming",
                  "Dry cleaning treatment",
                  "Dust & odour removal",
                  "Standard or lined curtains"],
        faqs=[("Do I need to take the curtains down?", "No — we clean them on-site while hanging. Message us on WhatsApp with the number of panels for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with your curtain count and type — we reply quickly with a free, no-obligation quote.")],
        related=["window-blinds-cleaning", "sofa-cleaning"]),

    dict(slug="window-blinds-cleaning", label="Window Blinds Cleaning",
        title="Window Blinds Cleaning in Jalandhar | CleanNest",
        desc="Window blinds cleaning in Jalandhar — venetian, roller & vertical blinds wiped clean. From ₹25/sq.ft. Free quote on WhatsApp.",
        h1="Window Blinds Cleaning in Jalandhar",
        sub="Venetian, roller and vertical blinds wiped clean — every slat, streak-free.",
        img="assets/img/services/window-blinds-cleaning.webp",
        price="From ₹25 / sq.ft",
        includes=["Venetian blind wipe-down",
                  "Roller blind cleaning",
                  "Vertical blind cleaning",
                  "Dust & stain removal"],
        faqs=[("Can you clean all blind types?", "Yes — venetian, roller and vertical blinds. Message us on WhatsApp with your blind sizes for a free quote."),
              ("How do I get a quote?", "Message us on WhatsApp with the number and size of blinds — we reply quickly with a free, no-obligation quote.")],
        related=["curtain-cleaning", "full-house-cleaning"]),

    dict(slug="floor-renewal", label="Floor Renewal & Polishing",
        title="Floor Renewal & Polishing in Jalandhar | CleanNest",
        desc="Floor renewal & polishing in Jalandhar — tile, marble, granite & Italian marble restored. From ₹8/sq.ft. Free quote on WhatsApp.",
        h1="Floor Renewal & Polishing in Jalandhar",
        sub="Restore the showroom shine on tiles, marble, granite and Italian marble.",
        img="assets/img/services/floor-renewal.webp",
        price="From ₹8 / sq.ft",
        includes=["Tile grout scrubbing & buffing",
                  "Marble diamond-pad honing",
                  "Granite machine scrub & gloss buff",
                  "Italian marble restoration & polish",
                  "Crystallisation treatment"],
        faqs=[("Which floors can you renew?", "Tiles, marble, granite and Italian marble — including commercial spaces. Message us on WhatsApp with your floor area for a free quote."),
              ("How do I get a quote?", "Share your floor type and area on WhatsApp — we reply quickly with a free, no-obligation quote.")],
        related=["commercial-cleaning", "full-house-cleaning"]),

    dict(slug="jet-washing", label="High-Pressure Jet Washing",
        title="High-Pressure Jet Washing in Jalandhar | CleanNest",
        desc="High-pressure jet washing in Jalandhar — patios, driveways, pavers & exterior stone. From ₹3/sq.ft. Free quote on WhatsApp.",
        h1="High-Pressure Jet Washing in Jalandhar",
        sub="150+ bar water blasting for patios, driveways, pavers and exterior stone.",
        img="assets/img/services/jet-washing.webp",
        price="From ₹3 / sq.ft",
        includes=["Patio & driveway washing",
                  "Paver & ramp cleaning",
                  "Exterior stone & facade wash",
                  "Stubborn stain blasting"],
        faqs=[("Can you jet-wash any outdoor surface?", "We clean concrete, stone, pavers and similar hard surfaces. Message us on WhatsApp with your area for a free quote."),
              ("How do I get a quote?", "Share the surface type and area on WhatsApp — we reply quickly with a free, no-obligation quote.")],
        related=["commercial-cleaning", "floor-renewal"]),

    dict(slug="pool-cleaning", label="Swimming Pool Deep Cleaning",
        title="Swimming Pool Deep Cleaning in Jalandhar | CleanNest",
        desc="Swimming pool deep cleaning in Jalandhar — drain down, acid descaling & algae removal. Custom quote. Free quote on WhatsApp.",
        h1="Swimming Pool Deep Cleaning in Jalandhar",
        sub="Drain-down, descaling and algae removal for pools — heavy-duty equipment, careful work.",
        img="assets/img/services/pool-cleaning.webp",
        price="Custom quote",
        includes=["Drain down & acid descaling",
                  "Algae removal",
                  "Suction brushing",
                  "Heavy-duty pool equipment"],
        faqs=[("How is a pool deep clean quoted?", "Pool quotes depend on size, type and condition — message us on WhatsApp with your pool details and we'll arrange a visit and quote."),
              ("How do I book?", "Message us on WhatsApp with your pool details — we'll confirm availability and schedule.")],
        related=["commercial-cleaning", "jet-washing"]),

    dict(slug="chandelier-cleaning", label="Chandelier & Crystal Cleaning",
        title="Chandelier & Crystal Cleaning in Jalandhar | CleanNest",
        desc="Chandelier & crystal fixture cleaning in Jalandhar — delicate crystal-by-crystal care. Custom quote. Free quote on WhatsApp.",
        h1="Chandelier & Crystal Cleaning in Jalandhar",
        sub="Delicate crystal-by-crystal cleaning and metal polish — handled with care.",
        img="assets/img/services/chandelier-cleaning.webp",
        price="Custom quote",
        includes=["Individual crystal teardrop wipe",
                  "Non-corrosive crystal spray",
                  "Metal & frame polish",
                  "Delicate handling"],
        faqs=[("Can you clean any chandelier?", "We clean most chandeliers and crystal fixtures — message us on WhatsApp with photos and details for a quote."),
              ("How do I book?", "Message us on WhatsApp with your fixture details — we'll confirm availability and schedule.")],
        related=["curtain-cleaning", "commercial-cleaning"]),
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
        '\n      <a class="service-tile" href="%s.html">\n        <img src="%s" alt="%s" width="640" height="400" loading="lazy">\n        <span class="service-tag">%s</span>\n      </a>' %
        (r["slug"], r["img"], r["label"], r["label"])
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
        '    <p class="cta-sub">Get your free quote in minutes — 50%% to book, 50%% after service.</p>\n'
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
    faq_ent = ",".join(
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
        '    "@context":"https://schema.org",\n'
        '    "@type":"FAQPage","mainEntity":[%s]\n'
        '  }</script>\n'
        % (json.dumps(s["h1"]), json.dumps(s["h1"]), WA, faq_ent))

def build_all_services(html):
    """services.html — every service in one grid, with starting prices."""
    tiles = []
    for s in SERVICES:
        tiles.append(
            '\n      <a class="service-tile" href="%s.html">\n        <img src="%s" alt="%s" width="640" height="400" loading="lazy">\n        <span class="service-price-tag">%s</span>\n        <span class="service-tag">%s</span>\n      </a>'
            % (s["slug"], s["img"], s["label"], s.get("price", "Custom quote"), s["label"]))
    # Recurring cleaning page exists but isn't in SERVICES — add its tile manually
    tiles.append(
        '\n      <a class="service-tile" href="recurring-cleaning.html">\n        <img src="assets/img/services/recurring-cleaning.webp" alt="Recurring Cleaning" width="640" height="400" loading="lazy">\n        <span class="service-price-tag">Custom quote</span>\n        <span class="service-tag">Recurring Cleaning</span>\n      </a>')
    grid = "".join(tiles)

    head_idx = html.index('<main class="hero"')
    tail_marker = '</footer>'
    tail_idx = html.index(tail_marker)
    shell_head = html[:head_idx]
    shell_tail = html[tail_idx:]

    # Title/description swaps
    shell_head = shell_head.replace(
        "CleanNest — Jalandhar's Most Trusted Cleaning Service",
        "All Services | CleanNest Jalandhar", 1)
    shell_head = shell_head.replace(
        "From dust to shine everytime! CleanNest is Jalandhar's most trusted cleaning service. Get a free quote on WhatsApp.",
        "Every CleanNest service in one place — deep cleaning for homes, kitchens, bathrooms, appliances, upholstery, floors, commercial spaces and more. Free quotes on WhatsApp.", 1)
    # Keep canonical/schema of index for the services page
    canonical = '\n  <link rel="canonical" href="https://www.cleannest.in/services.html">\n'
    shell_head = shell_head.replace('</head>', canonical + '\n</head>')

    wa = wa_prefill("a service")
    main = (
        '\n  <main class="hero">\n'
        '  <section class="cta-band" id="top">\n'
        '    <span class="section-badge">CleanNest · Jalandhar</span>\n'
        '    <h1 class="cta-title">All <span class="star">Services</span></h1>\n'
        '    <p class="cta-sub">Every CleanNest service in one place — tap any service for details and a free quote.</p>\n'
        '    <div class="cta-actions">\n'
        '      <a class="cta-btn cta-wa" href="%s" target="_blank" rel="noopener">Get Free Quote on WhatsApp</a>\n'
        '      <a class="cta-btn cta-call" href="pricing.html">See Pricing</a>\n'
        '    </div>\n'
        '  </section>\n'
        '  <section class="services" id="services">\n'
        '    <div class="section-head">\n'
        '      <span class="section-badge">All Services</span>\n'
        '      <p class="section-sub">Starting prices shown on each card — tap for full details.</p>\n'
        '    </div>\n'
        '    <div class="services-grid">%s\n    </div>\n'
        '  </section>\n'
        '  </main>\n' % (wa, grid))

    page = shell_head + main + shell_tail
    # Menu anchors: services -> services.html, pricing -> pricing.html, others -> home
    for anchor in ["gallery", "reviews", "faqs", "contact"]:
        page = page.replace('href="#%s"' % anchor, 'href="/index.html#%s"' % anchor)
    page = page.replace('href="#services"', 'href="services.html"')
    page = page.replace('href="#pricing"', 'href="pricing.html"')
    # Tile entrance animation for the services grid
    page = page.replace(
        "</body>",
        '<script>\n(function(){\n  var tiles = document.querySelectorAll(\'.service-tile\');\n'
        '  if (\'IntersectionObserver\' in window) {\n'
        '    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add(\'in\'); io.unobserve(e.target); } }); }, {threshold: 0.05});\n'
        '    tiles.forEach(function(t){ io.observe(t); });\n'
        '  } else { tiles.forEach(function(t){ t.classList.add(\'in\'); }); }\n'
        '})();\n</script>\n</body>')

    out = os.path.join(SITE, "services.html")
    open(out, "w", encoding="utf-8").write(page)
    print("wrote services.html (%d bytes)" % len(page))

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

        # 4) Menu anchor links -> home page sections / new pages
        for anchor in ["gallery", "reviews", "faqs", "contact"]:
            page = page.replace('href="#%s"' % anchor, 'href="/index.html#%s"' % anchor)
        page = page.replace('href="#services"', 'href="services.html"')
        page = page.replace('href="#pricing"', 'href="pricing.html"')

        out = os.path.join(SITE, s["slug"] + ".html")
        open(out, "w", encoding="utf-8").write(page)
        print("wrote %s (%d bytes)" % (s["slug"] + ".html", len(page)))

    build_all_services(html)

if __name__ == "__main__":
    main()
