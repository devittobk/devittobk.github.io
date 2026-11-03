import subprocess
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--disable-gpu",
    "--dump-dom",
    "https://devittobk.github.io/flight-miles-calculator/"
]
res = subprocess.run(cmd, capture_output=True, text=True, timeout=20, encoding='utf-8')
dom = res.stdout

checks = [
    "Miles vs Cash Advisor",
    "lucide-plane",
    "KrisFlyer Visa Infinite",
    "UOB PRIVI Miles",
    "DBS Travel Signature",
    "Jakarta (CGK)",
    "card-wallet-tab",
    "btn-theme-toggle",
    "btn-lang-toggle"
]

print("--- Live Website Verification ---")
success = True
for c in checks:
    present = c in dom
    print(f"Check '{c}': {present}")
    if not present:
        success = False

if success:
    print("SUCCESS: Everything on live GitHub Pages site is fully operational!")
else:
    print("WARNING: Some elements missing from live DOM")
