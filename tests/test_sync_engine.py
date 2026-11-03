#!/usr/bin/env python3
"""
Unit Test Suite for Cross-Device Cloud Sync and E2EE Payload Architecture
"""
import os
import unittest
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestSyncEngine(unittest.TestCase):

    def test_sync_service_file_exists_and_has_required_methods(self):
        sync_js = os.path.join(BASE_DIR, "js", "syncService.js")
        self.assertTrue(os.path.exists(sync_js), "syncService.js must exist")
        
        with open(sync_js, "r", encoding="utf-8") as f:
            content = f.read()

        required_symbols = [
            "SyncService",
            "deriveEncryptionKey",
            "encryptData",
            "decryptData",
            "pushToCloud",
            "pullFromCloud",
            "connect",
            "disconnect",
            "generateRandomKey",
            "getSyncShareUrl",
            "miles-sync-status-changed",
            "miles-data-reloaded"
        ]
        for sym in required_symbols:
            self.assertIn(sym, content, f"syncService.js should define or reference {sym}")

    def test_storage_bundle_export_and_import(self):
        storage_js = os.path.join(BASE_DIR, "js", "storage.js")
        with open(storage_js, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("exportStateBundle", content)
        self.assertIn("importStateBundle", content)
        self.assertIn("notifyStorageUpdated", content)

    def test_sync_translations_defined(self):
        translations_js = os.path.join(BASE_DIR, "js", "translations.js")
        with open(translations_js, "r", encoding="utf-8") as f:
            content = f.read()

        # Check English sync keys
        self.assertIn("pillDisconnected", content)
        self.assertIn("pillSynced", content)
        self.assertIn("modalTitle", content)
        self.assertIn("e2eeBadge", content)
        self.assertIn("fieldSyncKey", content)
        self.assertIn("btnGenerateKey", content)
        self.assertIn("btnConnect", content)
        self.assertIn("shareTitle", content)
        self.assertIn("toastCopied", content)

    def test_html_contains_sync_elements(self):
        html_path = os.path.join(BASE_DIR, "index.html")
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn('id="btn-sync-status"', content)
        self.assertIn('id="modal-cloud-sync"', content)
        self.assertIn('id="input-sync-key"', content)
        self.assertIn('id="btn-connect-sync"', content)
        self.assertIn('id="sync-qrcode"', content)
        self.assertIn('src="./js/qrcode.min.js"', content)
        self.assertIn('src="./js/syncService.js"', content)

if __name__ == "__main__":
    unittest.main()
