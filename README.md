# Miles vs Cash Advisor ✈️🇮🇩
### Indonesian Frequent Flyer Miles & Credit Card Valuation Tool
*(Kalkulator Nilai Miles Indonesia: KrisFlyer, GarudaMiles, Asia Miles & Kartu Kredit)*

A modern, responsive web application tailored for Indonesian credit card point collectors and frequent flyers to calculate whether redeeming airline miles is worth it compared to buying cash tickets in Indonesian Rupiah (IDR).

---

## ✨ Key Features (Fitur Utama)

1. **Pure Black AMOLED (#000000) Dark Mode & Light Theme Toggle**:
   - Modern, sleek pitch-black `#000000` AMOLED theme designed for OLED displays with neon emerald and electric blue accents.
   - Quick 1-click `[☀️ / 🌙]` theme toggle button in the navbar.
   - Theme preference saved in `localStorage`.

2. **Bilingual Support (English Default & Bahasa Indonesia)**:
   - English interface by default out of the box.
   - Quick 1-click `[🌐 EN / ID]` pill button in the navbar to switch all UI labels, form fields, verdicts, credit card details, and shareable summaries into Bahasa Indonesia.
   - Language preference saved in `localStorage`.

3. **Smart Value per Mile Calculation**:
   - Formula: `Value per Mile (IDR) = (Cash Ticket Price - Cash Taxes & Surcharges) / Miles Required`
   - **Break-Even Cash Price**: The exact threshold where paying cash becomes cheaper than redeeming miles.
   - **Net Economic Gain**: Compares cash savings against the baseline value of your accumulated miles.

4. **Tiered Verdict Engine**:
   - 🔥 **Exceptional Deal (>1.5x Benchmark)**: Immediate redemption recommendation!
   - ✅ **Great Redemption (1.15x - 1.5x Benchmark)**: High value, comfortably beats benchmark.
   - ⚖️ **Fair / Break-Even (0.9x - 1.15x Benchmark)**: Decent value, good if miles are expiring.
   - ❌ **Poor Value (<0.9x Benchmark)**: Burning miles is wasteful; buy with cash instead!
   - 🛑 **Loss / Negative Value**: Cash taxes exceed normal ticket price.

5. **1-Click Indonesian Route Presets**:
   - Jakarta (CGK) ⇄ Tokyo (HND/NRT) [SQ 52k, Garuda 45k, Cathay 45k, ANA 31.5k]
   - Jakarta (CGK) ⇄ Singapore (SIN) [SQ 8.5k/21k, Garuda 7k/14k]
   - Jakarta (CGK) ⇄ Hong Kong (HKG) [Asia Miles 12.5k/32k, Garuda 25k/40k]
   - Jakarta (CGK) ⇄ Seoul (ICN)
   - Bali (DPS) ⇄ Sydney (SYD)
   - Jakarta (CGK) ⇄ London (LHR)
   - Jakarta (CGK) ⇄ Doha (DOH)
   - Jakarta (CGK) ⇄ Bangkok (BKK)

6. **Indonesian Credit Card Points Accumulator & Custom Wallet**:
   - Supports: **BCA SQ Visa Infinite/Signature**, **BCA UnionPay**, **CIMB Niaga JCB Ultimate (9x dining/Japan = Rp 5,000/mile)**, **DBS Travel Platinum/Signature**, **UOB PRIVI Miles & Preferred Platinum**, **Danamon World Elite / JCB Precious**, **Mandiri Prioritas**, and **Maybank BMW/Mini**.
   - Full parameter editing: customize domestic & overseas earning rates, expiry dates, credit limits, and annual turnover.
   - Add custom cards or delete unused cards directly in "My Wallet".

7. **Mobile Progressive Web App (PWA) & Offline Mode**:
   - 1-click install on iPhone (Safari) and Android (Chrome) without app stores.
   - Runs fullscreen in pure black AMOLED mode.
   - Pre-cached offline support: calculate miles valuation mid-flight in airplane mode.

8. **Multi-Airline Comparator Table**:
   - Compare KrisFlyer, GarudaMiles, Asia Miles, ANA, Qatar Avios, and Flying Blue side-by-side with "★ BEST VALUE" highlighting.

9. **Saved History & 1-Click WhatsApp Export**:
   - Bookmarks valuations in `localStorage`.
   - "Copy Summary" produces a neatly formatted report in the active language (English or Indonesian) ready for WhatsApp, Telegram, or Notes.

---

## 🚀 How to Run & Deploy Online

### 🌐 Deploy 100% Free Online to GitHub Pages (Access Anywhere)
1. Create a free GitHub repository at [https://github.com/new](https://github.com/new).
2. Double-click `push_to_github.bat` and paste your repository link.
3. In GitHub repo **Settings** -> **Pages**, change Source to **GitHub Actions**.
4. Your app is live at `https://<username>.github.io/flight-miles-calculator/`!
*(See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step mobile installation).*

### 💻 Run Locally on PC
- Double-click `run_app.bat` or run `python server.py`.
- Opens automatically in your browser at `http://localhost:8080/index.html`.
