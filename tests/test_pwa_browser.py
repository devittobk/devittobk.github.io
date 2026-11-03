#!/usr/bin/env python3
"""
Browser Render & PWA Metadata Test in Mobile Viewport
"""
import subprocess
import html
import os
import unittest

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE_DIR, "index.html")
SCREENSHOT_PATH = os.path.join(BASE_DIR, "tests", "pwa_mobile_preview.png")

class TestPWABrowserRender(unittest.TestCase):

    def test_mobile_pwa_rendering(self):
        self.assertTrue(os.path.exists(CHROME_PATH), "Chrome must be installed")
        
        file_url = "file:///" + HTML_PATH.replace(os.sep, "/")
        cmd = [
            CHROME_PATH,
            "--headless=new",
            "--disable-gpu",
            "--window-size=430,932", # iPhone 14 / modern smartphone viewport
            f"--screenshot={SCREENSHOT_PATH}",
            "--dump-dom",
            file_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        self.assertEqual(result.returncode, 0, f"Chrome exited with error: {result.stderr}")
        
        dom = html.unescape(result.stdout)
        
        # Verify PWA meta tags and links
        self.assertIn('rel="manifest" href="./manifest.json"', dom)
        self.assertIn('content="black-translucent"', dom)
        self.assertIn('apple-mobile-web-app-capable', dom)
        self.assertIn('apple-touch-icon', dom)
        self.assertIn('navigator.serviceWorker.register', dom)
        self.assertIn('Miles vs Cash Advisor', dom)
        
        # Verify screenshot generated
        self.assertTrue(os.path.exists(SCREENSHOT_PATH), "Screenshot should be created")
        file_size = os.path.getsize(SCREENSHOT_PATH)
        self.assertGreater(file_size, 10000, "Screenshot should not be empty")

if __name__ == "__main__":
    unittest.main()
