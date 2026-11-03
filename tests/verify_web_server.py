"""
Integration test for Web Server and static assets delivery (including translations)
"""
import urllib.request
import threading
import time
import socketserver
import http.server
import os
import sys

DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 8094

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    print(f"Testing server from: {DIRECTORY}")
    server = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    time.sleep(0.5)

    urls_to_test = [
        f"http://127.0.0.1:{PORT}/index.html",
        f"http://127.0.0.1:{PORT}/css/styles.css",
        f"http://127.0.0.1:{PORT}/js/translations.js",
        f"http://127.0.0.1:{PORT}/js/loyaltyPrograms.js",
        f"http://127.0.0.1:{PORT}/js/routesData.js",
        f"http://127.0.0.1:{PORT}/js/indonesianCards.js",
        f"http://127.0.0.1:{PORT}/js/valuationLogic.js",
        f"http://127.0.0.1:{PORT}/js/storage.js",
        f"http://127.0.0.1:{PORT}/js/app.js"
    ]

    all_passed = True
    for url in urls_to_test:
        try:
            req = urllib.request.urlopen(url, timeout=3)
            status = req.getcode()
            content = req.read()
            if status == 200 and len(content) > 50:
                print(f"PASS: {url} (HTTP {status}, {len(content)} bytes)")
            else:
                print(f"FAIL: {url} (HTTP {status}, {len(content)} bytes)")
                all_passed = False
        except Exception as e:
            print(f"ERROR: {url} -> {e}")
            all_passed = False

    server.shutdown()
    server.server_close()

    if all_passed:
        print("\nALL ASSETS SERVED SUCCESSFULLY! 100% OK")
        sys.exit(0)
    else:
        print("\nTEST FAILED")
        sys.exit(1)

if __name__ == "__main__":
    run()
