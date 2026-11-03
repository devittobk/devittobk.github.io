#!/usr/bin/env python3
"""
Simple Zero-Dependency Local Web Server for Indonesian Miles vs Cash Advisor
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for local development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    port = PORT
    max_tries = 10
    httpd = None

    for i in range(max_tries):
        try:
            handler = CustomHTTPHandler
            httpd = socketserver.TCPServer(("", port), handler)
            break
        except OSError:
            port += 1

    if not httpd:
        print(f"Error: Could not bind to any port between {PORT} and {PORT + max_tries}")
        sys.exit(1)

    url = f"http://localhost:{port}/index.html"
    print("=" * 60)
    print("  Miles vs Cash Advisor - Local Web Server")
    print("=" * 60)
    print(f"  Serving files from: {DIRECTORY}")
    print(f"  App URL:           {url}")
    print("=" * 60)
    print("  Press Ctrl+C to stop the server.")
    print("=" * 60)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
