from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
CORE = ["index.html", "services.html", "pricing.html", "areas-we-serve.html", "faqs.html"]
FORBIDDEN = ("CLEAN10", "10% OFF", "no advance payment", "most trusted")
EMOJI = re.compile(r"[\U0001F300-\U0001FAFF\uFE0F]")


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


if __name__ == "__main__":
    unittest.main()
