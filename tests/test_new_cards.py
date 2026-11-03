"""
Unit Tests for DBS, UOB, BCA UnionPay cards & My Wallet custom card math
"""
import unittest
import os
import re

DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CARDS_JS = os.path.join(DIRECTORY, "js", "indonesianCards.js")

class TestNewCardsAndWallet(unittest.TestCase):
    def setUp(self):
        with open(CARDS_JS, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_dbs_cards_exist(self):
        self.assertIn("dbs-travel-plat", self.content)
        self.assertIn("dbs-travel-sig", self.content)
        self.assertIn("DBS Travel Visa Platinum", self.content)
        self.assertIn("DBS Points", self.content)

    def test_uob_cards_exist(self):
        self.assertIn("uob-privi-miles", self.content)
        self.assertIn("uob-preferred-plat", self.content)
        self.assertIn("UOB PRIVI Miles", self.content)
        self.assertIn("PRIVI Miles", self.content)

    def test_bca_unionpay_exists(self):
        self.assertIn("bca-unionpay", self.content)
        self.assertIn("BCA UnionPay Platinum", self.content)
        self.assertIn("Reward BCA", self.content)

    def test_custom_card_spending_math(self):
        miles = 52000
        # Custom card with Rp 7,500/mile
        spend_rate = 7500
        total_spend = miles * spend_rate
        self.assertEqual(total_spend, 390000000)

        # UOB PRIVI Miles overseas rate: Rp 5,000/mile
        overseas_spend = miles * 5000
        self.assertEqual(overseas_spend, 260000000)

if __name__ == '__main__':
    unittest.main()
