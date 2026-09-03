from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
CORE = ["index.html", "services.html", "pricing.html", "areas-we-serve.html", "faqs.html"]
FORBIDDEN = ("CLEAN10", "10% OFF", "no advance payment", "most trusted")
EMOJI = re.compile(r"[\U0001F300-\U0001FAFF\uFE0F]")
ALIASES = {"bathroom-cleaning.html", "full-house-cleaning.html", "kitchen-cleaning.html", "sofa-cleaning.html"}
CITY_PAGES = {
    "adampur.html",
    "banga.html",
    "dasuya.html",
    "goraya.html",
    "hariana.html",
    "hoshiarpur.html",
    "kapurthala.html",
    "kartarpur.html",
    "nakodar.html",
    "nawanshahr.html",
    "phagwara.html",
    "phillaur.html",
    "sultanpur-lodhi.html",
}
HUB_PAGES = set(CORE) | {"index.html", "services.html", "pricing.html", "areas-we-serve.html", "faqs.html"}


def sitemap_pages():
    text = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    pages = re.findall(r"<loc>https://cleannest\.in/([^<]+)</loc>", text)
    return [
        page
        for page in pages
        if page.endswith(".html")
        and page not in HUB_PAGES
        and page not in CITY_PAGES
        and page not in ALIASES
        and page != ""
    ]


class SiteDesignTests(unittest.TestCase):
    def text(self, name):
        return (ROOT / name).read_text(encoding="utf-8")

    def test_core_pages_have_one_h1_and_shared_stylesheet(self):
        for name in CORE:
            html = self.text(name)
            self.assertEqual(len(re.findall(r"<h1\b", html, re.I)), 1, name)
            self.assertRegex(html, r'href="style\.css\?v=\d+"', name)

    def test_homepage_section_order(self):
        html = self.text("index.html")
        markers = [
            'id="home"', 'id="trust-strip"', 'id="services"', 'id="results"',
            'id="reviews"', 'id="cities"', 'id="faq"', 'id="final-cta"'
        ]
        positions = [html.index(marker) for marker in markers]
        self.assertEqual(positions, sorted(positions))

    def test_homepage_has_single_primary_h1(self):
        html = self.text("index.html")
        self.assertEqual(len(re.findall(r"<h1\b", html, re.I)), 1)
        self.assertIn("Professional", html)
        self.assertIn("Done Right", html)
        self.assertIn("Home and commercial deep cleaning in Jalandhar", html)
        self.assertIn('href="#results"', html)

    def test_homepage_hero_uses_real_result_proof(self):
        html = self.text("index.html")
        self.assertIn('class="hero-proof-card"', html)
        self.assertIn('assets/img/results/sink-vanity.webp', html)
        self.assertIn('width="640" height="640"', html)

    def test_homepage_uses_compact_trust_strip(self):
        html = self.text("index.html")
        self.assertIn('id="trust-strip"', html)
        self.assertNotIn('<section class="about" id="about">', html)

    def test_shared_section_rhythm_tokens_exist(self):
        css = self.text("style.css")
        for token in ("--section-space", "--content-wide", "--content-reading"):
            self.assertIn(token, css)

    def test_homepage_service_grid_is_curated(self):
        html = self.text("index.html")
        block = html[html.index('id="services"'):html.index('id="results"')]
        self.assertEqual(block.count('class="service-tile"'), 6)
        self.assertEqual(block.count('class="service-tile-all"'), 1)

    def test_results_are_primary_visual_proof(self):
        html = self.text("index.html")
        css = self.text("style.css")
        self.assertIn("Results you can inspect", html)
        self.assertIn("Tap any CleanNest job", html)
        self.assertIn("prefers-reduced-motion: reduce", html)
        self.assertRegex(css, r"\.gallery-dots button\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;", re.S)

    def test_reviews_keep_five_named_cards_without_verified_wording(self):
        html = self.text("index.html")
        block = html[html.index('id="reviews"'):html.index('id="cities"')]
        self.assertEqual(block.count('class="review-card"'), 5)
        self.assertNotIn("verified", block.lower())
        for name in ("Neha Verma", "gurjit bhangu", "Kamal Jeet", "Shelly Bajwa", "Harshalipreet Kaur Bhangu"):
            self.assertIn(name, block)

    def test_no_forbidden_copy_or_emoji(self):
        for path in ROOT.glob("*.html"):
            text = path.read_text(encoding="utf-8")
            lower = text.lower()
            for phrase in FORBIDDEN:
                self.assertNotIn(phrase.lower(), lower, f"{path.name}: {phrase}")
            self.assertIsNone(EMOJI.search(text), path.name)

        architecture = self.text("CONTENT_ARCHITECTURE.md")
        self.assertIn("unsupported superlative", architecture)
        self.assertIsNone(EMOJI.search(architecture), "CONTENT_ARCHITECTURE.md")

    def test_phone_and_whatsapp_number_are_canonical(self):
        for path in ROOT.glob("*.html"):
            html = path.read_text(encoding="utf-8")
            for number in re.findall(r"wa\.me/(\d+)", html):
                self.assertEqual(number, "917610000654", path.name)
            for number in re.findall(r"tel:([^\"']+)", html):
                self.assertEqual(re.sub(r"\D", "", number), "917610000654", path.name)

    def test_pricing_uses_shared_design_system(self):
        html = self.text("pricing.html")
        self.assertRegex(html, r'href="style\.css\?v=\d+"')
        self.assertNotIn("<style>\n:root{", html)

    def test_areas_hub_uses_linked_city_grid(self):
        html = self.text("areas-we-serve.html")
        self.assertIn("Jalandhar", html)
        self.assertIn("Availability depends on the job and location", html)
        self.assertIn("WhatsApp", html)
        self.assertNotIn("area-city-block", html)
        self.assertEqual(html.count('class="area-link"'), 14)
        for name in sorted(CITY_PAGES):
            self.assertIn(f'href="{name}"', html, name)

    def test_faq_page_matches_payment_and_grouping_rules(self):
        html = self.text("faqs.html")
        self.assertIn("Booking &amp; Quotes", html)
        self.assertIn("Services &amp; Pricing", html)
        self.assertIn("Care &amp; Safety", html)
        self.assertIn("Areas &amp; Good to Know", html)
        self.assertLess(html.index("How payment works"), html.index("How to get a quote"))
        self.assertGreaterEqual(html.count("50%"), 2)
        self.assertNotIn("verified, trained and uniformed", html.lower())
        self.assertNotIn("eco-friendly products", html.lower())

    def test_service_pages_follow_shared_information_order(self):
        for name in sitemap_pages():
            html = self.text(name)
            with self.subTest(page=name):
                self.assertEqual(len(re.findall(r"<h1\b", html, re.I)), 1, name)
                self.assertRegex(html, r'"@type"\s*:\s*"Service"', name)
                self.assertTrue('data-open-quote' in html or 'wa.me/917610000654' in html, name)
                self.assertIn('<footer class="footer"', html, name)
                self.assertGreaterEqual(len(re.findall(r'class="faq-item"', html)), 2, name)
                self.assertIn("Who this is for / when to book", html, name)
                self.assertTrue(
                    any(phrase in html for phrase in ("What is included", "What we cover", "Every detail covered")),
                    name,
                )

    def test_city_pages_are_locally_specific_and_non_duplicate(self):
        seen = {}
        for name in sorted(CITY_PAGES):
            city = name.removesuffix(".html").replace("-", " ").title()
            html = self.text(name)
            title = re.search(r"<title>(.*?)</title>", html, re.S).group(1)
            h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
            paragraph = re.search(r"<main.*?<p[^>]*>(.*?)</p>", html, re.S)
            intro = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", paragraph.group(1) if paragraph else "")).strip().lower()
            seen.setdefault(intro, []).append(name)
            with self.subTest(page=name):
                self.assertIn(city, title, name)
                self.assertIn(f"Professional Cleaning Services in {city}", h1.group(1) if h1 else "", name)
                self.assertIn(f'href="https://cleannest.in/{name}"', html, name)
                self.assertRegex(html, r'"@type"\s*:\s*"Service"', name)
                self.assertIn(f"WhatsApp for {city} Quote", html, name)
                self.assertIn(city, html, name)
        duplicates = [pages for pages in seen.values() if len(pages) > 1]
        self.assertFalse(duplicates, f"Duplicate city intros: {duplicates}")


if __name__ == "__main__":
    unittest.main()
