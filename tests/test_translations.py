"""
Automated Unit Tests for Bilingual (EN / ID) Translations and Verdict Engine
"""
import unittest
import json
import re
import os

DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TRANSLATIONS_JS = os.path.join(DIRECTORY, "js", "translations.js")

def extract_translations():
    with open(TRANSLATIONS_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple regex extraction of TRANSLATIONS object
    m = re.search(r"const TRANSLATIONS = (\{[\s\S]+?\});\s*(?:if \(typeof module|$)", content)
    if not m:
        raise ValueError("Could not extract TRANSLATIONS from translations.js")
    
    raw_js = m.group(1)
    # Convert JS object to JSON-like (replace unquoted keys)
    # Or test key existence using regex patterns
    return raw_js

class TestBilingualSystem(unittest.TestCase):
    def setUp(self):
        with open(TRANSLATIONS_JS, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_translation_languages_exist(self):
        self.assertIn("en: {", self.content)
        self.assertIn("id: {", self.content)

    def test_verdict_keys_present_in_both_languages(self):
        for lang in ["en", "id"]:
            self.assertIn(f"exceptional: {{", self.content)
            self.assertIn(f"great: {{", self.content)
            self.assertIn(f"fair: {{", self.content)
            self.assertIn(f"poor: {{", self.content)
            self.assertIn(f"worst: {{", self.content)

    def test_english_defaults(self):
        self.assertIn('appTitle: "Miles vs Cash Advisor"', self.content)
        self.assertIn('cabinBusiness: "Business Class"', self.content)
        self.assertIn('btnSave: "Save Calculation"', self.content)
        self.assertIn('metricLabel: "Value of 1 Mile for this Flight:"', self.content)

    def test_indonesian_translations(self):
        self.assertIn('appSubtitle: "Kalkulator Nilai Miles Indonesia', self.content)
        self.assertIn('cabinBusiness: "Business Class (Bisnis)"', self.content)
        self.assertIn('btnSave: "Simpan Perhitungan"', self.content)
        self.assertIn('metricLabel: "Nilai 1 Mile untuk Tiket Ini:"', self.content)

    def test_shareable_summary_keys(self):
        for marker in ["✈️ *FLIGHT MILES VALUATION REPORT*", "✈️ *LAPORAN VALUASI MILES PENERBANGAN*"]:
            self.assertIn(marker, self.content)

if __name__ == '__main__':
    unittest.main()
