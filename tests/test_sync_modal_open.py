import subprocess
import os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOT = os.path.abspath("C:/Users/regen/.gemini/antigravity/brain/93fc2cfe-fc47-4000-80c2-3fb4c2ac093e/verified_sync_modal.png")

# Create a test page that opens the sync modal with test credentials
test_html = os.path.join(BASE_DIR, "tests", "test_sync_runner.html")
with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
    content = f.read()

# Add script at bottom of body that opens modal with simulated connection
inject = """
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    localStorage.setItem('miles_sync_key', 'DEVITTO-8899');
    localStorage.setItem('miles_vault_id', 'vlt_test_778899aabbcc');
    localStorage.setItem('miles_last_synced_at', Date.now().toString());
    openSyncModal();
    renderSyncQRCode('https://devittobk.github.io/?sync=DEVITTO-8899&vid=vlt_test_778899aabbcc');
    document.getElementById('input-sync-share-url').value = 'https://devittobk.github.io/?sync=DEVITTO-8899&vid=vlt_test_778899aabbcc';
    document.getElementById('sync-share-section').classList.remove('hidden');
    document.getElementById('btn-manual-sync').classList.remove('hidden');
    document.getElementById('btn-disconnect-sync').classList.remove('hidden');
    document.getElementById('sync-status-dot').className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    document.getElementById('sync-connection-title').textContent = 'Connected & Syncing (DEVITTO-8899)';
    document.getElementById('sync-last-time').textContent = 'Last synced: Just now';
    document.getElementById('sync-vault-pill').textContent = 'Vault: vlt_test_77...';
    document.getElementById('sync-vault-pill').classList.remove('hidden');
    document.getElementById('input-sync-key').value = 'DEVITTO-8899';
  }, 300);
});
</script>
"""
content = content.replace("</body>", inject + "</body>")
with open(test_html, "w", encoding="utf-8") as f:
    f.write(content)

file_url = "file:///" + test_html.replace(os.sep, "/")
cmd = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1280,950",
    f"--screenshot={SCREENSHOT}",
    "--virtual-time-budget=2000",
    "--dump-dom",
    file_url
]
res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
print("Exit:", res.returncode)
print("Screenshot exists:", os.path.exists(SCREENSHOT))
if os.path.exists(SCREENSHOT):
    print("Screenshot size:", os.path.getsize(SCREENSHOT))
os.remove(test_html)
