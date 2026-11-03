#!/usr/bin/env python3
"""
Headless Chrome Test: Cross-Device Sync Simulation (Laptop Push -> Phone Pull)
"""
import subprocess
import html
import os
import time
import unittest
import shutil

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE_DIR, "index.html")
SCREENSHOT_PATH = os.path.join(BASE_DIR, "tests", "sync_modal_preview.png")

class TestSyncBrowser(unittest.TestCase):

    def test_sync_modal_rendering(self):
        self.assertTrue(os.path.exists(CHROME_PATH), "Chrome must be installed")

        file_url = "file:///" + HTML_PATH.replace(os.sep, "/")
        cmd = [
            CHROME_PATH,
            "--headless=new",
            "--disable-gpu",
            "--window-size=1280,850",
            f"--screenshot={SCREENSHOT_PATH}",
            "--dump-dom",
            file_url
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        self.assertEqual(res.returncode, 0)
        
        dom = html.unescape(res.stdout)
        self.assertIn('id="btn-sync-status"', dom)
        self.assertIn('id="modal-cloud-sync"', dom)
        self.assertIn('Secret Sync Key', dom)
        self.assertIn('256-Bit End-to-End Encrypted', dom)
        self.assertTrue(os.path.exists(SCREENSHOT_PATH))

if __name__ == "__main__":
    unittest.main()
