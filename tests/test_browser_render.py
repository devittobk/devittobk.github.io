"""
Headless Chrome Browser Automation Test for AMOLED Dark Mode (EN) & Light Mode (ID)
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
PORT = 8097
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SCREENSHOT_DARK_PATH = os.path.join(DIRECTORY, "tests", "verified_amoled_dark_en.png")
SCREENSHOT_LIGHT_PATH = os.path.join(DIRECTORY, "tests", "verified_light_id.png")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    server = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    time.sleep(0.5)

    all_passed = True

    # 1. Test AMOLED Dark Mode in English (Default)
    url_dark = f"http://127.0.0.1:{PORT}/index.html"
    print(f"\n[Test 1] Verifying AMOLED Dark Mode (Default) in English: {url_dark}")
    cmd_dark = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1400,1050",
        f"--screenshot={SCREENSHOT_DARK_PATH}",
        "--dump-dom",
        url_dark
    ]
    res_dark = subprocess.run(cmd_dark, capture_output=True, text=True, timeout=15)
    dom_dark = html.unescape(res_dark.stdout)

    assertions_dark = [
        ("theme-amoled", "Body has 'theme-amoled' class"),
        ("btn-theme-toggle", "Theme toggle button present in DOM"),
        ("btn-lang-toggle", "Language toggle button present in DOM"),
        ("Value of 1 Mile for this Flight:", "English default text active in Cockpit"),
        ("Flight & Miles Details", "English form title active"),
        ("Must Redeem Miles!", "English verdict recommendation active")
    ]
    for text_fragment, desc in assertions_dark:
        if text_fragment in dom_dark:
            print(f"PASS: {desc}")
        else:
            print(f"FAIL: {desc}")
            all_passed = False

    # 2. Test Light Mode in Bahasa Indonesia
    url_light = f"http://127.0.0.1:{PORT}/index.html?theme=light&lang=id"
    print(f"\n[Test 2] Verifying Light Theme in Bahasa Indonesia: {url_light}")
    cmd_light = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1400,1050",
        f"--screenshot={SCREENSHOT_LIGHT_PATH}",
        "--dump-dom",
        url_light
    ]
    res_light = subprocess.run(cmd_light, capture_output=True, text=True, timeout=15)
    dom_light = html.unescape(res_light.stdout)

    assertions_light = [
        ("theme-light", "Body has 'theme-light' class"),
        ("Nilai 1 Mile untuk Tiket Ini:", "Indonesian text active in Cockpit"),
        ("Detail Penerbangan & Miles", "Indonesian form title active"),
        ("Wajib Redeem Miles!", "Indonesian verdict recommendation active")
    ]
    for text_fragment, desc in assertions_light:
        if text_fragment in dom_light:
            print(f"PASS: {desc}")
        else:
            print(f"FAIL: {desc}")
            all_passed = False

    server.shutdown()
    server.server_close()

    if os.path.exists(SCREENSHOT_DARK_PATH):
        print(f"\nPASS: AMOLED Dark screenshot ({os.path.getsize(SCREENSHOT_DARK_PATH)} bytes)")
    if os.path.exists(SCREENSHOT_LIGHT_PATH):
        print(f"PASS: Light Theme ID screenshot ({os.path.getsize(SCREENSHOT_LIGHT_PATH)} bytes)")

    if all_passed:
        print("\nALL THEME & LANGUAGE VERIFICATIONS PASSED SUCCESSFULLY! 100% OK")
        sys.exit(0)
    else:
        print("\nTEST FAILED")
        sys.exit(1)

if __name__ == "__main__":
    run()
