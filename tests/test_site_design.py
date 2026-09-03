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

    def test_no_forbidden_copy_or_emoji(self):
        for path in list(ROOT.glob("*.html")) + [ROOT / "CONTENT_ARCHITECTURE.md"]:
            text = path.read_text(encoding="utf-8")
            lower = text.lower()
            for phrase in FORBIDDEN:
                self.assertNotIn(phrase.lower(), lower, f"{path.name}: {phrase}")
            self.assertIsNone(EMOJI.search(text), path.name)

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
