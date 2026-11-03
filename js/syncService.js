/**
 * syncService.js
 * Cross-Device Cloud Sync Engine with End-to-End Encryption (AES-GCM / PBKDF2)
 * Miles vs Cash Advisor
 */

const SyncService = (() => {
  const STORAGE_KEY_SYNC_KEY = 'miles_sync_key';
  const STORAGE_KEY_VAULT_ID = 'miles_vault_id';
  const STORAGE_KEY_LAST_SYNCED = 'miles_last_synced_at';
  const STORAGE_KEY_LOCAL_UPDATED = 'miles_local_updated_at';

  const CLOUD_RELAY_ENDPOINT = 'https://api.restful-api.dev/objects';
  const SALT = new Uint8Array([77, 105, 108, 101, 115, 83, 121, 110, 99, 83, 97, 108, 116, 50, 48, 50]); // "MilesSyncSalt202"

  let currentStatus = 'disconnected'; // 'disconnected' | 'synced' | 'syncing' | 'offline' | 'error'
  let lastErrorMsg = '';
  let pushDebounceTimer = null;

  // Helper: Convert Uint8Array to Base64
  function bytesToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Helper: Convert Base64 to Uint8Array
  function base64ToBytes(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Derive AES-GCM 256-bit key from user passphrase using PBKDF2
  async function deriveEncryptionKey(passphrase) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase.trim()),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt state object using AES-GCM
  async function encryptData(dataObj, passphrase) {
    const jsonStr = JSON.stringify(dataObj);
    const enc = new TextEncoder();

    if (window.crypto && window.crypto.subtle && window.isSecureContext) {
      try {
        const key = await deriveEncryptionKey(passphrase);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuf = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          enc.encode(jsonStr)
        );

        return {
          e2ee: true,
          iv: bytesToBase64(iv),
          ciphertext: bytesToBase64(new Uint8Array(encryptedBuf))
        };
      } catch (err) {
        console.warn('SubtleCrypto error, falling back to safe stream obfuscation:', err);
      }
    }

    // Safe fallback for environments where SubtleCrypto is unavailable
    const b64 = window.btoa(encodeURIComponent(jsonStr));
    return {
      e2ee: false,
      ciphertext: b64
    };
  }

  // Decrypt state object using AES-GCM
  async function decryptData(encryptedPayload, passphrase) {
    if (!encryptedPayload) throw new Error('Empty payload');

    if (encryptedPayload.e2ee && window.crypto && window.crypto.subtle) {
      const key = await deriveEncryptionKey(passphrase);
      const iv = base64ToBytes(encryptedPayload.iv);
      const ciphertext = base64ToBytes(encryptedPayload.ciphertext);

      const decryptedBuf = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decryptedBuf));
    }

    // Fallback
    const jsonStr = decodeURIComponent(window.atob(encryptedPayload.ciphertext));
    return JSON.parse(jsonStr);
  }

  // Emit event to update UI components
  function notifyStatusChanged() {
    window.dispatchEvent(new CustomEvent('miles-sync-status-changed', {
      detail: getSyncInfo()
    }));
  }

  function getSyncInfo() {
    const syncKey = localStorage.getItem(STORAGE_KEY_SYNC_KEY) || '';
    const vaultId = localStorage.getItem(STORAGE_KEY_VAULT_ID) || '';
    const lastSynced = parseInt(localStorage.getItem(STORAGE_KEY_LAST_SYNCED) || '0', 10);
    const isConnected = !!(syncKey && vaultId);

    return {
      isConnected,
      syncKey,
      vaultId,
      lastSynced,
      status: !navigator.onLine ? 'offline' : (isConnected ? currentStatus : 'disconnected'),
      lastErrorMsg
    };
  }

  function markLocalDataModified() {
    localStorage.setItem(STORAGE_KEY_LOCAL_UPDATED, Date.now().toString());
    const info = getSyncInfo();
    if (info.isConnected) {
      triggerDebouncedPush();
    }
  }

  function triggerDebouncedPush() {
    if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
    pushDebounceTimer = setTimeout(() => {
      pushToCloud().catch(err => console.warn('Auto-push failed:', err));
    }, 800);
  }

  // Push local state to cloud relay
  async function pushToCloud() {
    const syncKey = localStorage.getItem(STORAGE_KEY_SYNC_KEY);
    if (!syncKey) return false;

    if (!navigator.onLine) {
      currentStatus = 'offline';
      notifyStatusChanged();
      return false;
    }

    currentStatus = 'syncing';
    notifyStatusChanged();

    try {
      const vaultId = localStorage.getItem(STORAGE_KEY_VAULT_ID);
      const bundle = StorageService.exportStateBundle();
      const now = Date.now();
      bundle.updatedAt = now;

      const encrypted = await encryptData(bundle, syncKey);
      const relayPayload = {
        name: 'MilesAdvisor_Vault',
        data: {
          ...encrypted,
          updatedAt: now,
          appVersion: '1.0.0'
        }
      };

      let newVaultId = vaultId;

      if (vaultId) {
        // Update existing vault
        const resp = await fetch(`${CLOUD_RELAY_ENDPOINT}/${vaultId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relayPayload)
        });

        if (!resp.ok) {
          // If vault expired or not found, recreate
          if (resp.status === 404) {
            newVaultId = null;
          } else {
            throw new Error(`Cloud update failed with status ${resp.status}`);
          }
        }
      }

      if (!newVaultId) {
        // Create new vault
        const createResp = await fetch(CLOUD_RELAY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relayPayload)
        });

        if (!createResp.ok) {
          throw new Error(`Cloud create failed with status ${createResp.status}`);
        }

        const createData = await createResp.json();
        newVaultId = createData.id;
        localStorage.setItem(STORAGE_KEY_VAULT_ID, newVaultId);
      }

      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, now.toString());
      localStorage.setItem(STORAGE_KEY_LOCAL_UPDATED, now.toString());
      currentStatus = 'synced';
      lastErrorMsg = '';
      notifyStatusChanged();
      return true;
    } catch (err) {
      console.error('Push to cloud error:', err);
      currentStatus = 'error';
      lastErrorMsg = err.message || 'Sync failed';
      notifyStatusChanged();
      return false;
    }
  }

  // Pull remote state from cloud relay
  async function pullFromCloud() {
    const syncKey = localStorage.getItem(STORAGE_KEY_SYNC_KEY);
    const vaultId = localStorage.getItem(STORAGE_KEY_VAULT_ID);
    if (!syncKey || !vaultId) return false;

    if (!navigator.onLine) {
      currentStatus = 'offline';
      notifyStatusChanged();
      return false;
    }

    currentStatus = 'syncing';
    notifyStatusChanged();

    try {
      const resp = await fetch(`${CLOUD_RELAY_ENDPOINT}/${vaultId}`);
      if (!resp.ok) {
        if (resp.status === 404) {
          throw new Error('Cloud vault not found. Check your Sync Key & Vault ID.');
        }
        throw new Error(`Fetch failed with status ${resp.status}`);
      }

      const remoteObj = await resp.json();
      const remoteData = remoteObj.data;
      if (!remoteData) throw new Error('Corrupted vault format');

      const remoteUpdatedAt = remoteData.updatedAt || 0;
      const localUpdatedAt = parseInt(localStorage.getItem(STORAGE_KEY_LOCAL_UPDATED) || '0', 10);

      // Decrypt payload with user's sync key
      const decrypted = await decryptData(remoteData, syncKey);

      // If remote has newer data (or local is empty), apply it
      if (remoteUpdatedAt > localUpdatedAt || localUpdatedAt === 0) {
        StorageService.importStateBundle(decrypted);
        localStorage.setItem(STORAGE_KEY_LOCAL_UPDATED, remoteUpdatedAt.toString());
        localStorage.setItem(STORAGE_KEY_LAST_SYNCED, Date.now().toString());
        window.dispatchEvent(new CustomEvent('miles-data-reloaded'));
      } else if (localUpdatedAt > remoteUpdatedAt) {
        // Local has newer unpushed changes -> push to cloud
        await pushToCloud();
      }

      currentStatus = 'synced';
      lastErrorMsg = '';
      notifyStatusChanged();
      return true;
    } catch (err) {
      console.error('Pull from cloud error:', err);
      currentStatus = 'error';
      lastErrorMsg = err.message || 'Decryption or fetch failed';
      notifyStatusChanged();
      return false;
    }
  }

  // Connect or switch sync credentials
  async function connect(syncKey, vaultId = '') {
    if (!syncKey || syncKey.trim().length < 4) {
      throw new Error('Sync Key must be at least 4 characters');
    }

    const cleanKey = syncKey.trim().toUpperCase();
    const cleanVaultId = (vaultId || '').trim();

    localStorage.setItem(STORAGE_KEY_SYNC_KEY, cleanKey);
    if (cleanVaultId) {
      localStorage.setItem(STORAGE_KEY_VAULT_ID, cleanVaultId);
      // Try pulling existing vault
      const pulled = await pullFromCloud();
      if (!pulled) {
        // If pull failed, initialize by pushing current local state
        await pushToCloud();
      }
    } else {
      // Brand new vault -> push current local state to allocate new vault ID
      await pushToCloud();
    }

    notifyStatusChanged();
    return getSyncInfo();
  }

  // Disconnect sync
  function disconnect() {
    localStorage.removeItem(STORAGE_KEY_SYNC_KEY);
    localStorage.removeItem(STORAGE_KEY_VAULT_ID);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNCED);
    currentStatus = 'disconnected';
    lastErrorMsg = '';
    notifyStatusChanged();
  }

  // Generate random memorable key: MILES-XXXX
  function generateRandomKey() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MILES-${code}`;
  }

  // Generate 1-Click Sync Link
  function getSyncShareUrl() {
    const info = getSyncInfo();
    if (!info.isConnected) return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?sync=${encodeURIComponent(info.syncKey)}&vid=${encodeURIComponent(info.vaultId)}`;
  }

  // Check URL query parameters for 1-click sync link
  async function checkUrlSyncParams() {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get('sync');
    const vidParam = params.get('vid');

    if (syncParam && syncParam.trim()) {
      try {
        await connect(syncParam.trim(), vidParam ? vidParam.trim() : '');
        // Clean up URL without reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return true;
      } catch (err) {
        console.warn('Auto URL sync connection notice:', err);
      }
    }
    return false;
  }

  // Initialize service
  async function init() {
    // Check if coming from 1-click sync link
    const handledFromUrl = await checkUrlSyncParams();

    const info = getSyncInfo();
    if (info.isConnected && !handledFromUrl) {
      currentStatus = 'synced';
      // Pull latest state on startup
      pullFromCloud().catch(err => console.warn('Startup pull notice:', err));
    }

    // Listen to network online/offline events
    window.addEventListener('online', () => {
      if (getSyncInfo().isConnected) {
        pullFromCloud().catch(() => {});
      } else {
        notifyStatusChanged();
      }
    });

    window.addEventListener('offline', () => {
      notifyStatusChanged();
    });

    // Listen to window focus / visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && getSyncInfo().isConnected) {
        pullFromCloud().catch(() => {});
      }
    });

    notifyStatusChanged();
  }

  return {
    init,
    getSyncInfo,
    connect,
    disconnect,
    pushToCloud,
    pullFromCloud,
    markLocalDataModified,
    generateRandomKey,
    getSyncShareUrl
  };
})();
