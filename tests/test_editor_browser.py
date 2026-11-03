"""
Headless Chrome Browser Automation Test for Universal Card Parameter Editor & New Metrics
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
PORT = 8099
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOT_EDITOR_PATH = os.path.join(DIRECTORY, "tests", "verified_card_editor.png")

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
    print(f"Launching Chrome Headless to verify Card Editor & Parameters: {url}")

    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1400,1050",
        f"--screenshot={SCREENSHOT_EDITOR_PATH}",
        "--dump-dom",
        url
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    server.shutdown()
    server.server_close()

    dom_output = html.unescape(result.stdout)
    print(f"DOM length: {len(dom_output)} characters")

    assertions = [
        ("edit-card-domestic-rate", "Domestic rate input present in edit modal"),
        ("edit-card-overseas-rate", "Overseas rate input present in edit modal"),
        ("edit-card-limit", "Credit limit input present in edit modal"),
        ("edit-card-expiry", "Expiry policy input present in edit modal"),
        ("card-turnover-metric", "Credit limit turnover metric present in calculator"),
        ("card-expiry-display", "Points expiry display present in calculator"),
        ("modal-edit-card", "Universal edit card modal present in DOM")
    ]

    all_passed = True
    for text_fragment, desc in assertions:
        if text_fragment in dom_output:
            print(f"PASS: {desc}")
        else:
            print(f"FAIL: {desc}")
            all_passed = False

    if os.path.exists(SCREENSHOT_EDITOR_PATH):
        print(f"PASS: Screenshot captured at {SCREENSHOT_EDITOR_PATH} ({os.path.getsize(SCREENSHOT_EDITOR_PATH)} bytes)")
    else:
        print("FAIL: Screenshot was not generated.")
        all_passed = False

    if all_passed:
        print("\nALL CARD EDITOR & PARAMETERS VERIFICATIONS PASSED SUCCESSFULLY! 100% OK")
        sys.exit(0)
    else:
        print("\nTEST FAILED")
        sys.exit(1)

if __name__ == "__main__":
    run()
