"""
Unit Tests for Indonesian Flight Miles Valuation Logic & Credit Card Metrics
"""
import unittest

def calculate_valuation(cash_price, taxes, miles, benchmark=160):
    if miles <= 0:
        return {"isValid": False, "error": "Miles must be > 0"}
    
    net_saved = cash_price - taxes
    value_per_mile = net_saved / miles
    breakeven = (benchmark * miles) + taxes
    ratio = value_per_mile / benchmark if benchmark > 0 else 1.0

    if net_saved <= 0:
        code = "WORST"
        title = "Loss / Negative Value 🛑"
        worth_it = False
    elif ratio >= 1.50:
        code = "EXCEPTIONAL"
        title = "Exceptional Deal 🔥"
        worth_it = True
    elif ratio >= 1.15:
        code = "GREAT"
        title = "Great Redemption ✅"
        worth_it = True
    elif ratio >= 0.90:
        code = "FAIR"
        title = "Fair / Break-Even ⚖️"
        worth_it = True
    else:
        code = "POOR"
        title = "Poor Value ❌"
        worth_it = False

    return {
        "isValid": True,
        "netCashSaved": net_saved,
        "valuePerMile": value_per_mile,
        "breakevenCashPrice": breakeven,
        "ratio": ratio,
        "code": code,
        "title": title,
        "isWorthIt": worth_it
    }

def calculate_card_spend(miles, spend_per_mile):
    return miles * spend_per_mile

class TestValuationEngine(unittest.TestCase):
    def test_exceptional_deal_jakarta_tokyo_business(self):
        # CGK - HND Business: Cash Rp 26.500.000, Taxes Rp 1.450.000, KrisFlyer miles 52.000
        # Net saved = 25.050.000 -> Value per mile = 25.050.000 / 52.000 = ~481.7 IDR/mile
        # Benchmark = 160 IDR/mile -> Ratio = 481.7 / 160 = ~3.01 (301%)
        result = calculate_valuation(26500000, 1450000, 52000, benchmark=160)
        self.assertTrue(result["isValid"])
        self.assertAlmostEqual(result["valuePerMile"], 481.73, places=1)
        self.assertEqual(result["code"], "EXCEPTIONAL")
        self.assertTrue(result["isWorthIt"])
        self.assertEqual(result["breakevenCashPrice"], (160 * 52000) + 1450000) # 9.770.000

    def test_poor_deal_economy_short_haul(self):
        # CGK - SIN Economy: Cash Rp 1.500.000, Taxes Rp 600.000, Miles 12.000
        # Net saved = 900.000 -> Value per mile = 900.000 / 12.000 = 75 IDR/mile
        # Benchmark = 160 IDR/mile -> Ratio = 75 / 160 = ~0.468
        result = calculate_valuation(1500000, 600000, 12000, benchmark=160)
        self.assertTrue(result["isValid"])
        self.assertEqual(result["valuePerMile"], 75.0)
        self.assertEqual(result["code"], "POOR")
        self.assertFalse(result["isWorthIt"])

    def test_taxes_exceed_ticket_price(self):
        # Cash ticket Rp 1.000.000, Taxes Rp 1.200.000 (carrier surcharges)
        result = calculate_valuation(1000000, 1200000, 10000, benchmark=160)
        self.assertTrue(result["isValid"])
        self.assertEqual(result["code"], "WORST")
        self.assertFalse(result["isWorthIt"])

    def test_zero_miles_validation(self):
        result = calculate_valuation(10000000, 1000000, 0, benchmark=160)
        self.assertFalse(result["isValid"])

    def test_credit_card_spending_calculation(self):
        # 52,000 miles on BCA SQ Infinite (Rp 8.000 / mile) -> Rp 416.000.000
        spend = calculate_card_spend(52000, 8000)
        self.assertEqual(spend, 416000000)

        # 52,000 miles on CIMB JCB Ultimate Dining (Rp 5.000 / mile) -> Rp 260.000.000
        spend_dining = calculate_card_spend(52000, 5000)
        self.assertEqual(spend_dining, 260000000)

if __name__ == '__main__':
    unittest.main()
