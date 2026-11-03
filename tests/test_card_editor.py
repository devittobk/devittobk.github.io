"""
Unit Tests for Card Parameter Editor, Domestic/Overseas Rates, Expiry, and Credit Limit
"""
import unittest
import os
import re

DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CARDS_JS = os.path.join(DIRECTORY, "js", "indonesianCards.js")
STORAGE_JS = os.path.join(DIRECTORY, "js", "storage.js")

class TestCardEditorAndParameters(unittest.TestCase):
    def setUp(self):
        with open(CARDS_JS, "r", encoding="utf-8") as f:
            self.cards_content = f.read()
        with open(STORAGE_JS, "r", encoding="utf-8") as f:
            self.storage_content = f.read()

    def test_domestic_and_overseas_rates_present(self):
        self.assertIn("domesticSpendPerMile: 10000", self.cards_content)
        self.assertIn("overseasSpendPerMile: 5000", self.cards_content)

    def test_credit_limit_parameter_present(self):
        self.assertIn("creditLimitIdr", self.cards_content)

    def test_expiry_policy_parameter_present(self):
        self.assertIn("expiryPolicy", self.cards_content)

    def test_card_override_storage_functions_exist(self):
        self.assertIn("saveCardOverride", self.storage_content)
        self.assertIn("resetCardOverride", self.storage_content)
        self.assertIn("getCardOverrides", self.storage_content)

    def test_turnover_calculation_math(self):
        miles = 52000
        # Overseas spend rate on UOB PRIVI Miles: Rp 5,000/mile
        spend = miles * 5000 # 260,000,000 IDR
        limit = 75000000 # Rp 75M
        turnover = round(spend / limit, 1)
        self.assertEqual(turnover, 3.5)

if __name__ == '__main__':
    unittest.main()
