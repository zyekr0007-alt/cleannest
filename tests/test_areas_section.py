from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AreasSectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.home = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.areas = (ROOT / "areas-we-serve.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "style.css").read_text(encoding="utf-8")

    def test_homepage_uses_a_compact_page_link_not_a_map_popup(self):
        section = re.search(r'<section class="cities" id="cities".*?</section>', self.home, re.DOTALL).group(0)
        self.assertIn('href="areas-we-serve.html"', section)
        self.assertNotIn('data-open-areas-map', self.home)
        self.assertNotIn('id="areas-map-dialog"', self.home)
        self.assertLessEqual(section.count('class="city-chip"'), 3)

    def test_removed_cities_are_not_offered_as_service_areas(self):
        for html in (self.home, self.areas):
            self.assertNotIn('hariana.html', html)
            self.assertNotIn('dasuya.html', html)
            self.assertNotIn('>Hariana<', html)
            self.assertNotIn('>Dasuya<', html)

    def test_areas_page_has_a_full_page_animated_coverage_map(self):
        self.assertIn('id="coverage-map"', self.areas)
        self.assertIn('Jalandhar', self.areas)
        self.assertEqual(len(re.findall(r'class="coverage-city-link"', self.areas)), 11)
        self.assertIn('class="coverage-route"', self.areas)
        self.assertRegex(self.areas, r'class="coverage-signal(?:\s|\")')
        self.assertIn('@keyframes coverage-signal-travel', self.css)
        self.assertIn('@media (prefers-reduced-motion: reduce)', self.css)


if __name__ == "__main__":
    unittest.main()
