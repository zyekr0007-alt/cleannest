from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AreasSectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "style.css").read_text(encoding="utf-8")

    def test_compact_areas_section_has_a_map_launcher(self):
        match = re.search(r'<section class="cities" id="cities".*?</section>', self.html, re.DOTALL)
        self.assertIsNotNone(match)
        section = match.group(0)
        self.assertIn('class="areas-launcher"', section)
        self.assertIn('data-open-areas-map', section)
        self.assertIn('id="areas-map-dialog"', self.html)
        self.assertIn('aria-controls="areas-map-dialog"', section)
        self.assertLessEqual(section.count('class="city-chip"'), 6)

    def test_map_marks_jalandhar_and_links_every_service_city(self):
        dialog = self.html[self.html.index('id="areas-map-dialog"'):]
        self.assertIn('Jalandhar', dialog)
        for city in (
            'Phagwara', 'Kapurthala', 'Kartarpur', 'Adampur', 'Phillaur',
            'Sultanpur Lodhi', 'Nakodar', 'Goraya', 'Hoshiarpur', 'Banga',
            'Nawanshahr', 'Dasuya', 'Hariana',
        ):
            self.assertIn(f'>{city}<', dialog)
        self.assertEqual(len(re.findall(r'class="map-city-link"', dialog)), 13)

    def test_home_city_name_and_status_are_visually_separate(self):
        self.assertIn('<small>Home city</small>', self.html)
        self.assertIn('.areas-home-city span:last-child {', self.css)

    def test_map_routes_have_real_wave_styling(self):
        self.assertIn('class="areas-route"', self.html)
        self.assertIn('.areas-route {', self.css)
        self.assertIn('animation: areas-wave-travel', self.css)

    def test_map_has_repeatable_motion_with_reduced_motion_fallback(self):
        self.assertIn('@keyframes areas-wave-travel', self.css)
        self.assertIn('@keyframes areas-node-pulse', self.css)
        self.assertIn('@media (prefers-reduced-motion: reduce)', self.css)
        self.assertIn('.areas-map-dialog[hidden]', self.css)


if __name__ == "__main__":
    unittest.main()
