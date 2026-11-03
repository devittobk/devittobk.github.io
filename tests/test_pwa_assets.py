#!/usr/bin/env python3
"""
Unit Test Suite for PWA Assets, Service Worker, and GitHub Pages Deployment Configuration
"""
import os
import json
import unittest
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestPWAAssetsAndDeployment(unittest.TestCase):

    def test_manifest_json_structure(self):
        manifest_path = os.path.join(BASE_DIR, "manifest.json")
        self.assertTrue(os.path.exists(manifest_path), "manifest.json should exist")
        
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            
        self.assertEqual(manifest.get("name"), "Flight Miles vs Cash Advisor")
        self.assertEqual(manifest.get("short_name"), "Miles Advisor")
        self.assertEqual(manifest.get("display"), "standalone")
        self.assertEqual(manifest.get("start_url"), "./index.html")
        self.assertEqual(manifest.get("theme_color"), "#000000")
        self.assertEqual(manifest.get("background_color"), "#000000")
        
        icons = manifest.get("icons", [])
        self.assertGreaterEqual(len(icons), 3, "Manifest should define at least 3 icon definitions")
        
        # Verify icon files exist on disk
        for icon in icons:
            src = icon.get("src")
            # Strip leading ./
            rel_src = src[2:] if src.startswith("./") else src
            icon_file = os.path.join(BASE_DIR, rel_src.replace("/", os.sep))
            self.assertTrue(os.path.exists(icon_file), f"Icon file {src} must exist at {icon_file}")
            
            # If PNG, verify valid image file and dimensions
            if icon_file.endswith(".png"):
                with Image.open(icon_file) as img:
                    self.assertGreater(img.width, 0)
                    self.assertGreater(img.height, 0)

    def test_service_worker_precached_assets(self):
        sw_path = os.path.join(BASE_DIR, "sw.js")
        self.assertTrue(os.path.exists(sw_path), "sw.js must exist")
        
        with open(sw_path, "r", encoding="utf-8") as f:
            sw_content = f.read()
            
        self.assertIn("CACHE_NAME", sw_content)
        self.assertIn("caches.open", sw_content)
        self.assertIn("addEventListener('fetch'", sw_content)
        
        # Extract PRECACHE_ASSETS list
        start_idx = sw_content.find("PRECACHE_ASSETS = [")
        end_idx = sw_content.find("];", start_idx)
        self.assertNotEqual(start_idx, -1, "sw.js must define PRECACHE_ASSETS")
        
        assets_block = sw_content[start_idx:end_idx]
        for line in assets_block.splitlines():
            line = line.strip().strip(",'\"")
            if line.startswith("./") and not line == "./":
                rel_path = line[2:]
                target_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
                self.assertTrue(os.path.exists(target_path), f"Pre-cached asset {line} must exist at {target_path}")

    def test_index_html_pwa_tags(self):
        html_path = os.path.join(BASE_DIR, "index.html")
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
            
        self.assertIn('<link rel="manifest" href="./manifest.json">', html)
        self.assertIn('<meta name="apple-mobile-web-app-capable" content="yes">', html)
        self.assertIn('<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">', html)
        self.assertIn('navigator.serviceWorker.register', html)
        self.assertIn('./sw.js', html)

    def test_github_workflow_and_scripts(self):
        workflow_path = os.path.join(BASE_DIR, ".github", "workflows", "deploy.yml")
        self.assertTrue(os.path.exists(workflow_path), "GitHub Actions deploy.yml must exist")
        
        with open(workflow_path, "r", encoding="utf-8") as f:
            wf_content = f.read()
        self.assertIn("actions/deploy-pages", wf_content)
        self.assertIn("actions/upload-pages-artifact", wf_content)
        
        bat_path = os.path.join(BASE_DIR, "push_to_github.bat")
        self.assertTrue(os.path.exists(bat_path), "push_to_github.bat must exist")
        
        with open(bat_path, "r", encoding="utf-8") as f:
            bat_content = f.read()
        self.assertIn("git init", bat_content)
        self.assertIn("git push", bat_content)
        
        guide_path = os.path.join(BASE_DIR, "DEPLOYMENT_GUIDE.md")
        self.assertTrue(os.path.exists(guide_path), "DEPLOYMENT_GUIDE.md must exist")

if __name__ == "__main__":
    unittest.main()
