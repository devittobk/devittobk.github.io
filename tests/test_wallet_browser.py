"""
Headless Chrome Browser Automation Test for DBS, UOB, BCA UnionPay and My Wallet UI
"""
import subprocess
import threading
import time
import socketserver
import http.server
import os
import sys
import html

DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 8098
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOT_WALLET_PATH = os.path.join(DIRECTORY, "tests", "verified_my_wallet.png")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    server = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    time.sleep(0.5)

    url = f"http://127.0.0.1:{PORT}/index.html"
    print(f"Launching Chrome Headless to verify My Wallet & New Cards: {url}")

    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1400,1050",
        f"--screenshot={SCREENSHOT_WALLET_PATH}",
        "--dump-dom",
        url
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    server.shutdown()
    server.server_close()

    dom_output = html.unescape(result.stdout)
    print(f"DOM length: {len(dom_output)} characters")

    assertions = [
        ("UOB PRIVI Miles", "UOB PRIVI Miles card present"),
        ("DBS Travel Visa Platinum", "DBS Travel Visa Platinum present"),
        ("BCA UnionPay Platinum", "BCA UnionPay card present"),
        ("checkbox-only-owned", "Only My Cards filter checkbox present"),
        ("subtab-wallet-btn", "My Wallet sub-tab button present"),
        ("subtab-catalog-btn", "All Cards Catalog sub-tab button present"),
        ("btn-open-add-card-modal", "Add Custom Card button present"),
        ("modal-add-custom-card", "Custom Card modal present in DOM")
    ]

    all_passed = True
    for text_fragment, desc in assertions:
        if text_fragment in dom_output:
            print(f"PASS: {desc}")
        else:
            print(f"FAIL: {desc}")
            all_passed = False

    if os.path.exists(SCREENSHOT_WALLET_PATH):
        print(f"PASS: Screenshot captured at {SCREENSHOT_WALLET_PATH} ({os.path.getsize(SCREENSHOT_WALLET_PATH)} bytes)")
    else:
        print("FAIL: Screenshot was not generated.")
        all_passed = False

    if all_passed:
        print("\nALL MY WALLET & NEW CARDS VERIFICATIONS PASSED SUCCESSFULLY! 100% OK")
        sys.exit(0)
    else:
        print("\nTEST FAILED")
        sys.exit(1)

if __name__ == "__main__":
    run()
