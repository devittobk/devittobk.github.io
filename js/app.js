/**
 * Indonesian Flight Miles Valuation Web Application Controller
 * Supports Pure Black AMOLED / Light Theme, Bilingual (EN / ID), My Wallet,
 * Distinct Domestic & Overseas Earn Rates, Expiry Policies, and Personal Credit Limits.
 */

// Application State
const AppState = {
  theme: 'amoled',       // 'amoled' | 'light'
  language: 'en',        // 'en' | 'id'
  activeTab: 'calculator', // 'calculator' | 'comparator' | 'cards' | 'history' | 'settings'
  walletSubtab: 'wallet', // 'wallet' | 'catalog'
  filterOwnedOnly: false,
  route: {
    origin: 'CGK',
    destination: 'HND',
    cabin: 'business',
    tripType: 'oneway',
    cashPriceIdr: 26500000,
    taxesIdr: 1450000
  },
  redemption: {
    programId: 'krisflyer',
    milesRequired: 52000,
    customBenchmark: null
  },
  creditCard: {
    selectedCardId: 'bca-kf-infinite',
    spendCategory: 'default'
  },
  customBenchmarks: {},
  savedEvaluations: []
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadSavedData();
  applyTheme(AppState.theme);
  setupEventListeners();
  renderPopularRouteChips();
  renderProgramSelector();
  renderCardSelector();
  renderBenchmarkSettings();
  renderAirportOptions();
  applyLanguage(AppState.language);
  initSyncUI();
  if (typeof SyncService !== 'undefined') {
    SyncService.init();
  }
  recalculateAll();
  lucide.createIcons();
}

/**
 * Load persisted data from localStorage
 */
function loadSavedData() {
  AppState.theme = getSavedTheme();
  AppState.language = getSavedLanguage();
  AppState.filterOwnedOnly = getFilterOwnedOnly();

  // Support URL parameter override (e.g. ?theme=light&lang=id)
  const params = new URLSearchParams(window.location.search);
  if (params.has('theme')) AppState.theme = params.get('theme');
  if (params.has('lang')) AppState.language = params.get('lang');

  AppState.savedEvaluations = getSavedEvaluations();
  AppState.customBenchmarks = getCustomBenchmarks();

  const ownedCheckbox = document.getElementById('checkbox-only-owned');
  if (ownedCheckbox) ownedCheckbox.checked = AppState.filterOwnedOnly;
}

/**
 * Apply Theme (Pure Black AMOLED vs Light)
 */
function applyTheme(theme) {
  AppState.theme = theme;
  saveTheme(theme);

  const body = document.body;
  if (theme === 'light') {
    body.classList.remove('theme-amoled');
    body.classList.add('theme-light');
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-amoled');
  }

  const icons = document.querySelectorAll('.theme-display-icon');
  icons.forEach(icon => {
    icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
  });

  lucide.createIcons();
}

function toggleTheme() {
  const nextTheme = AppState.theme === 'amoled' ? 'light' : 'amoled';
  applyTheme(nextTheme);
}

/**
 * Apply Language (English vs Bahasa Indonesia)
 */
function applyLanguage(lang) {
  AppState.language = lang;
  saveLanguage(lang);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n');
    const val = getNestedTranslation(t, keyPath);
    if (val) {
      if (el.tagName === 'INPUT' && el.getAttribute('type') === 'text') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('.lang-display-text').forEach(el => {
    el.textContent = lang.toUpperCase();
  });

  const originInput = document.getElementById('input-airport-origin');
  const destInput = document.getElementById('input-airport-destination');
  if (originInput && !originInput.value) originInput.placeholder = t.routeFrom;
  if (destInput && !destInput.value) destInput.placeholder = t.routeTo;

  updateAirportInputDisplays();
  initSyncUI();
  recalculateAll();
  lucide.createIcons();
}

function toggleLanguage() {
  const nextLang = AppState.language === 'en' ? 'id' : 'en';
  applyLanguage(nextLang);
}

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
  // Theme & Language Toggles
  const themeBtn = document.getElementById('btn-theme-toggle');
  const themeBtnMobile = document.getElementById('btn-theme-toggle-mobile');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

  const langBtn = document.getElementById('btn-lang-toggle');
  const langBtnMobile = document.getElementById('btn-lang-toggle-mobile');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);
  if (langBtnMobile) langBtnMobile.addEventListener('click', toggleLanguage);

  // Navigation Tabs
  document.querySelectorAll('[data-tab-target]').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  // Credit Card Sub-tabs (Wallet vs Catalog)
  const walletSubBtn = document.getElementById('subtab-wallet-btn');
  const catalogSubBtn = document.getElementById('subtab-catalog-btn');
  if (walletSubBtn) {
    walletSubBtn.addEventListener('click', () => switchWalletSubtab('wallet'));
  }
  if (catalogSubBtn) {
    catalogSubBtn.addEventListener('click', () => switchWalletSubtab('catalog'));
  }

  // Only My Cards checkbox in Calculator
  const ownedCheckbox = document.getElementById('checkbox-only-owned');
  if (ownedCheckbox) {
    ownedCheckbox.addEventListener('change', (e) => {
      AppState.filterOwnedOnly = e.target.checked;
      setFilterOwnedOnly(e.target.checked);
      renderCardSelector();
      updateCreditCardDetails();
    });
  }

  // Quick link to manage wallet from Calculator
  const quickWalletBtn = document.getElementById('btn-quick-manage-wallet');
  if (quickWalletBtn) {
    quickWalletBtn.addEventListener('click', () => {
      switchTab('cards');
      switchWalletSubtab('wallet');
    });
  }

  // Custom Card / Edit Modal triggers
  const openModalBtn = document.getElementById('btn-open-add-card-modal');
  const closeModalBtn = document.getElementById('btn-close-modal-card');
  const cancelModalBtn = document.getElementById('btn-cancel-edit-card');
  const editCardForm = document.getElementById('form-edit-card');

  if (openModalBtn) openModalBtn.addEventListener('click', () => openCardModal(null));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCardModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeCardModal);
  if (editCardForm) editCardForm.addEventListener('submit', handleSaveCardModal);

  // Cloud Sync Modal triggers
  const openSyncBtnDesktop = document.getElementById('btn-sync-status');
  const openSyncBtnMobile = document.getElementById('btn-sync-status-mobile');
  const closeSyncBtnTop = document.getElementById('btn-close-sync-modal');
  const closeSyncBtnBottom = document.getElementById('btn-close-sync-modal-bottom');
  const generateSyncKeyBtn = document.getElementById('btn-generate-sync-key');
  const connectSyncBtn = document.getElementById('btn-connect-sync');
  const manualSyncBtn = document.getElementById('btn-manual-sync');
  const disconnectSyncBtn = document.getElementById('btn-disconnect-sync');
  const copySyncLinkBtn = document.getElementById('btn-copy-sync-link');

  if (openSyncBtnDesktop) openSyncBtnDesktop.addEventListener('click', openSyncModal);
  if (openSyncBtnMobile) openSyncBtnMobile.addEventListener('click', openSyncModal);
  if (closeSyncBtnTop) closeSyncBtnTop.addEventListener('click', closeSyncModal);
  if (closeSyncBtnBottom) closeSyncBtnBottom.addEventListener('click', closeSyncModal);
  if (generateSyncKeyBtn) generateSyncKeyBtn.addEventListener('click', handleGenerateSyncKey);
  if (connectSyncBtn) connectSyncBtn.addEventListener('click', handleConnectSync);
  if (manualSyncBtn) manualSyncBtn.addEventListener('click', handleManualSync);
  if (disconnectSyncBtn) disconnectSyncBtn.addEventListener('click', handleDisconnectSync);
  if (copySyncLinkBtn) copySyncLinkBtn.addEventListener('click', handleCopySyncLink);

  // Listen to cross-device sync status and data reloads
  window.addEventListener('miles-sync-status-changed', (e) => {
    updateSyncPillUI(e.detail);
  });

  window.addEventListener('miles-data-reloaded', () => {
    loadSavedData();
    renderCardSelector();
    renderCardsCatalog();
    renderValuationHistory();
    renderBenchmarkSettings();
    recalculateAll();
  });

  // Form Inputs live updates
  const cashInput = document.getElementById('input-cash-price');
  const taxesInput = document.getElementById('input-taxes');
  const milesInput = document.getElementById('input-miles');
  const cabinSelect = document.getElementById('select-cabin');
  const tripTypeSelect = document.getElementById('select-trip-type');
  const programSelect = document.getElementById('select-program');
  const cardSelect = document.getElementById('select-card');
  const cardCategorySelect = document.getElementById('select-card-category');

  if (cashInput) cashInput.addEventListener('input', (e) => {
    AppState.route.cashPriceIdr = parseRawNumber(e.target.value);
    recalculateAll();
  });

  if (taxesInput) taxesInput.addEventListener('input', (e) => {
    AppState.route.taxesIdr = parseRawNumber(e.target.value);
    recalculateAll();
  });

  if (milesInput) milesInput.addEventListener('input', (e) => {
    AppState.redemption.milesRequired = parseRawNumber(e.target.value);
    recalculateAll();
  });

  if (cabinSelect) cabinSelect.addEventListener('change', (e) => {
    AppState.route.cabin = e.target.value;
    updateAwardsFromPreset();
    recalculateAll();
  });

  if (tripTypeSelect) tripTypeSelect.addEventListener('change', (e) => {
    AppState.route.tripType = e.target.value;
    recalculateAll();
  });

  if (programSelect) programSelect.addEventListener('change', (e) => {
    AppState.redemption.programId = e.target.value;
    updateAwardsFromPreset();
    updateBestCardForProgram();
    recalculateAll();
  });

  if (cardSelect) cardSelect.addEventListener('change', (e) => {
    AppState.creditCard.selectedCardId = e.target.value;
    updateCreditCardDetails();
  });

  if (cardCategorySelect) cardCategorySelect.addEventListener('change', (e) => {
    AppState.creditCard.spendCategory = e.target.value;
    updateCreditCardDetails();
  });

  // Airport Autocomplete Listeners
  setupAirportInput('origin');
  setupAirportInput('destination');

  // Reverse route button
  const swapBtn = document.getElementById('btn-swap-airports');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = AppState.route.origin;
      AppState.route.origin = AppState.route.destination;
      AppState.route.destination = temp;
      updateAirportInputDisplays();
      updateAwardsFromPreset();
      recalculateAll();
    });
  }

  // Save Evaluation button
  const saveBtn = document.getElementById('btn-save-eval');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveCurrentEvaluation);
  }

  // Share / Copy Summary button
  const shareBtn = document.getElementById('btn-copy-summary');
  if (shareBtn) {
    shareBtn.addEventListener('click', handleCopySummary);
  }

  // Reset benchmarks button
  const resetBenchBtn = document.getElementById('btn-reset-benchmarks');
  if (resetBenchBtn) {
    resetBenchBtn.addEventListener('click', handleResetBenchmarks);
  }
}

/**
 * Tab Switching
 */
function switchTab(tabId) {
  AppState.activeTab = tabId;

  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab-target') === tabId;
    if (isTarget) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-300', 'hover:bg-neutral-800', 'hover:text-white');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-300', 'hover:bg-neutral-800', 'hover:text-white');
    }
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`panel-${tabId}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  if (tabId === 'comparator') {
    renderMultiProgramComparison();
  } else if (tabId === 'history') {
    renderSavedHistoryList();
  } else if (tabId === 'cards') {
    renderAllCardsMasterGrid();
  }

  lucide.createIcons();
}

/**
 * Wallet Subtab Switching (My Wallet vs All Catalog)
 */
function switchWalletSubtab(subtab) {
  AppState.walletSubtab = subtab;

  const walletBtn = document.getElementById('subtab-wallet-btn');
  const catalogBtn = document.getElementById('subtab-catalog-btn');

  if (subtab === 'wallet') {
    if (walletBtn) {
      walletBtn.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition-all flex items-center gap-1.5';
    }
    if (catalogBtn) {
      catalogBtn.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5';
    }
  } else {
    if (catalogBtn) {
      catalogBtn.className = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition-all flex items-center gap-1.5';
    }
    if (walletBtn) {
      walletBtn.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5';
    }
  }

  renderAllCardsMasterGrid();
  lucide.createIcons();
}

/**
 * Universal Card Modal Operations (Add Custom Card OR Edit Card Parameters)
 */
function openCardModal(cardId = null) {
  const modal = document.getElementById('modal-edit-card');
  const titleEl = document.getElementById('modal-card-title');
  const subtitleEl = document.getElementById('modal-card-subtitle');
  const submitBtn = document.getElementById('btn-submit-card-modal');
  const t = TRANSLATIONS[AppState.language].wallet;

  const idInput = document.getElementById('edit-card-id');
  const isBuiltinInput = document.getElementById('edit-card-is-builtin');
  const bankInput = document.getElementById('edit-card-bank');
  const nameInput = document.getElementById('edit-card-name');
  const domesticInput = document.getElementById('edit-card-domestic-rate');
  const overseasInput = document.getElementById('edit-card-overseas-rate');
  const limitInput = document.getElementById('edit-card-limit');
  const expiryInput = document.getElementById('edit-card-expiry');
  const feeInput = document.getElementById('edit-card-fee');
  const notesInput = document.getElementById('edit-card-notes');
  const partnerCheckboxes = document.querySelectorAll('input[name="edit-card-partners"]');

  if (cardId) {
    // EDIT MODE
    const allCards = getAllAvailableCards();
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;

    idInput.value = card.id;
    isBuiltinInput.value = card.isCustom ? 'false' : 'true';
    titleEl.textContent = t.modalTitleEdit;
    subtitleEl.textContent = t.modalSubtitleEdit;
    submitBtn.textContent = t.btnSaveChanges;

    bankInput.value = card.bank;
    nameInput.value = card.name;
    domesticInput.value = card.domesticSpendPerMile || card.spendingPerMile || 10000;
    overseasInput.value = card.overseasSpendPerMile || card.spendingPerMile || 10000;
    limitInput.value = card.creditLimitIdr || 50000000;
    expiryInput.value = card.expiryPolicy || '2 Years (24 Months)';
    feeInput.value = card.annualFee || '';
    notesInput.value = card.categoryNotes || card.pros || '';

    partnerCheckboxes.forEach(cb => {
      cb.checked = card.supportedPrograms && card.supportedPrograms.includes(cb.value);
    });
  } else {
    // ADD NEW CUSTOM CARD MODE
    idInput.value = '';
    isBuiltinInput.value = 'false';
    titleEl.textContent = t.modalTitleAdd;
    subtitleEl.textContent = t.modalSubtitleAdd;
    submitBtn.textContent = t.btnSaveCard;

    document.getElementById('form-edit-card').reset();
    domesticInput.value = 7500;
    overseasInput.value = 5000;
    limitInput.value = 50000000;
    expiryInput.value = '2 Years (24 Months)';
    partnerCheckboxes.forEach(cb => {
      cb.checked = ['krisflyer', 'garudamiles', 'asiamiles'].includes(cb.value);
    });
  }

  if (modal) modal.classList.remove('hidden');
}

function closeCardModal() {
  const modal = document.getElementById('modal-edit-card');
  if (modal) modal.classList.add('hidden');
}

function handleSaveCardModal(e) {
  e.preventDefault();
  const cardId = document.getElementById('edit-card-id').value.trim();
  const isBuiltin = document.getElementById('edit-card-is-builtin').value === 'true';

  const bank = document.getElementById('edit-card-bank').value.trim();
  const name = document.getElementById('edit-card-name').value.trim();
  const domesticRate = parseRawNumber(document.getElementById('edit-card-domestic-rate').value);
  const overseasRate = parseRawNumber(document.getElementById('edit-card-overseas-rate').value);
  const creditLimit = parseRawNumber(document.getElementById('edit-card-limit').value);
  const expiry = document.getElementById('edit-card-expiry').value.trim();
  const fee = document.getElementById('edit-card-fee').value.trim();
  const notes = document.getElementById('edit-card-notes').value.trim();

  const partnerCheckboxes = document.querySelectorAll('input[name="edit-card-partners"]:checked');
  const partners = Array.from(partnerCheckboxes).map(cb => cb.value);

  if (!bank || !name || domesticRate <= 0) {
    showToast('Please provide a valid bank name, card name, and domestic earn rate');
    return;
  }

  const payload = {
    bank: bank,
    name: name,
    shortName: (bank + ' ' + name).substr(0, 18),
    domesticSpendPerMile: domesticRate,
    overseasSpendPerMile: overseasRate > 0 ? overseasRate : domesticRate,
    spendingPerMile: domesticRate,
    creditLimitIdr: creditLimit > 0 ? creditLimit : 50000000,
    expiryPolicy: expiry || '2 Years (24 Months)',
    annualFee: fee || 'Waivable',
    categoryNotes: notes || 'Personal card parameters',
    supportedPrograms: partners.length > 0 ? partners : ['krisflyer']
  };

  const t = TRANSLATIONS[AppState.language].toasts;

  if (cardId && isBuiltin) {
    // Save Built-in Card Override
    saveCardOverride(cardId, payload);
    showToast(t.cardUpdated);
  } else if (cardId && !isBuiltin) {
    // Update existing Custom Card
    saveCustomCard({ id: cardId, ...payload });
    showToast(t.cardUpdated);
  } else {
    // Add new Custom Card
    saveCustomCard(payload);
    showToast(t.customCardSaved);
  }

  closeCardModal();
  renderCardSelector();
  renderAllCardsMasterGrid();
  updateCreditCardDetails();
}

/**
 * Render Popular Preset Route Chips
 */
function renderPopularRouteChips() {
  const container = document.getElementById('popular-route-chips');
  if (!container) return;

  container.innerHTML = '';
  POPULAR_ROUTES.forEach(route => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs';
    chip.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
      <span>${route.origin} → ${route.destination}</span>
      <span class="text-slate-400 text-[10px]">(${route.region})</span>
    `;

    chip.addEventListener('click', () => {
      applyPresetRoute(route);
    });

    container.appendChild(chip);
  });
}

/**
 * Apply selected preset route to state and form inputs
 */
function applyPresetRoute(route) {
  AppState.route.origin = route.origin;
  AppState.route.destination = route.destination;

  const cabin = AppState.route.cabin;
  const cabinData = route.cabins[cabin] || route.cabins['business'] || route.cabins['economy'];

  if (cabinData) {
    AppState.route.cashPriceIdr = cabinData.estimatedCashPriceIdr;
    AppState.route.taxesIdr = cabinData.estimatedTaxesIdr;

    const progAward = cabinData.awards[AppState.redemption.programId];
    if (progAward) {
      AppState.redemption.milesRequired = progAward.miles;
      if (progAward.taxes) {
        AppState.route.taxesIdr = progAward.taxes;
      }
    } else {
      const firstProgKey = Object.keys(cabinData.awards)[0];
      if (firstProgKey) {
        AppState.redemption.programId = firstProgKey;
        AppState.redemption.milesRequired = cabinData.awards[firstProgKey].miles;
        if (cabinData.awards[firstProgKey].taxes) {
          AppState.route.taxesIdr = cabinData.awards[firstProgKey].taxes;
        }
      }
    }
  }

  updateAirportInputDisplays();
  syncInputFields();
  updateBestCardForProgram();
  recalculateAll();

  showToast(`Loaded ${route.title}!`);
}

/**
 * Update award miles and taxes when cabin or program changes
 */
function updateAwardsFromPreset() {
  const currentOrigin = AppState.route.origin;
  const currentDest = AppState.route.destination;

  const matchedRoute = POPULAR_ROUTES.find(r => 
    (r.origin === currentOrigin && r.destination === currentDest) ||
    (r.origin === currentDest && r.destination === currentOrigin)
  );

  if (matchedRoute) {
    const cabin = AppState.route.cabin;
    const cabinData = matchedRoute.cabins[cabin];
    if (cabinData) {
      const award = cabinData.awards[AppState.redemption.programId];
      if (award) {
        AppState.redemption.milesRequired = award.miles;
        if (award.taxes) {
          AppState.route.taxesIdr = award.taxes;
        }
      }
      if (cabinData.estimatedCashPriceIdr) {
        AppState.route.cashPriceIdr = cabinData.estimatedCashPriceIdr;
      }
    }
    syncInputFields();
  }
}

/**
 * Auto-select best Indonesian card for currently active loyalty program
 */
function updateBestCardForProgram() {
  const progId = AppState.redemption.programId;
  const allCards = getAllAvailableCards();
  const ownedIds = getOwnedCardIds();

  let candidates = allCards.filter(c => c.supportedPrograms.includes(progId));
  if (AppState.filterOwnedOnly) {
    const ownedCandidates = candidates.filter(c => ownedIds.includes(c.id));
    if (ownedCandidates.length > 0) {
      candidates = ownedCandidates;
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.spendingPerMile - b.spendingPerMile);
    AppState.creditCard.selectedCardId = candidates[0].id;
    const cardSelect = document.getElementById('select-card');
    if (cardSelect) cardSelect.value = candidates[0].id;
  }
}

/**
 * Sync UI input fields with AppState values
 */
function syncInputFields() {
  const cashInput = document.getElementById('input-cash-price');
  const taxesInput = document.getElementById('input-taxes');
  const milesInput = document.getElementById('input-miles');
  const cabinSelect = document.getElementById('select-cabin');
  const programSelect = document.getElementById('select-program');
  const cardSelect = document.getElementById('select-card');

  if (cashInput) cashInput.value = formatIdr(AppState.route.cashPriceIdr).replace('Rp ', '');
  if (taxesInput) taxesInput.value = formatIdr(AppState.route.taxesIdr).replace('Rp ', '');
  if (milesInput) milesInput.value = formatNumber(AppState.redemption.milesRequired);
  if (cabinSelect) cabinSelect.value = AppState.route.cabin;
  if (programSelect) programSelect.value = AppState.redemption.programId;
  if (cardSelect) cardSelect.value = AppState.creditCard.selectedCardId;
}

/**
 * Render Program Selector Dropdown Options
 */
function renderProgramSelector() {
  const select = document.getElementById('select-program');
  if (!select) return;

  select.innerHTML = '';
  Object.values(LOYALTY_PROGRAMS).forEach(prog => {
    const option = document.createElement('option');
    option.value = prog.id;
    option.textContent = `${prog.shortName} (${prog.airline}) - ${prog.alliance}`;
    select.appendChild(option);
  });
  select.value = AppState.redemption.programId;
}

/**
 * Render Credit Card Selector Dropdown Options
 */
function renderCardSelector() {
  const select = document.getElementById('select-card');
  if (!select) return;

  const allCards = getAllAvailableCards();
  const ownedIds = getOwnedCardIds();

  let cardsToShow = allCards;
  if (AppState.filterOwnedOnly) {
    cardsToShow = allCards.filter(c => ownedIds.includes(c.id));
  }

  select.innerHTML = '';
  if (cardsToShow.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No cards in wallet (Toggle "Only My Cards" off)';
    select.appendChild(opt);
    return;
  }

  cardsToShow.forEach(card => {
    const option = document.createElement('option');
    option.value = card.id;
    const isCustomTag = card.isCustom ? ' [Custom]' : (card.isOverridden ? ' [Edited]' : '');
    const rateText = card.domesticSpendPerMile ? formatIdr(card.domesticSpendPerMile) : formatIdr(card.spendingPerMile);
    option.textContent = `${card.bank} - ${card.name} (${rateText}/mi)${isCustomTag}`;
    select.appendChild(option);
  });

  const exists = cardsToShow.some(c => c.id === AppState.creditCard.selectedCardId);
  if (exists) {
    select.value = AppState.creditCard.selectedCardId;
  } else if (cardsToShow.length > 0) {
    AppState.creditCard.selectedCardId = cardsToShow[0].id;
    select.value = cardsToShow[0].id;
  }
}

/**
 * Setup Airport Autocomplete for Origin & Destination
 */
function setupAirportInput(type) {
  const input = document.getElementById(`input-airport-${type}`);
  const list = document.getElementById(`dropdown-airport-${type}`);
  if (!input || !list) return;

  input.addEventListener('focus', () => {
    renderAirportFilteredList(type, input.value);
    list.classList.remove('hidden');
  });

  input.addEventListener('input', (e) => {
    renderAirportFilteredList(type, e.target.value);
    list.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.add('hidden');
    }
  });
}

function renderAirportFilteredList(type, query) {
  const list = document.getElementById(`dropdown-airport-${type}`);
  if (!list) return;

  const q = (query || '').toLowerCase().trim();
  const matches = AIRPORTS_DATABASE.filter(a => 
    a.code.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  );

  list.innerHTML = '';
  if (matches.length === 0) {
    list.innerHTML = `<div class="p-3 text-xs text-slate-400">No airport found</div>`;
    return;
  }

  matches.slice(0, 10).forEach(airport => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'w-full text-left px-3 py-2 text-xs border-b flex items-center justify-between transition-colors';
    item.innerHTML = `
      <div>
        <div class="font-semibold text-slate-200">${airport.city} (${airport.code})</div>
        <div class="text-[11px] text-slate-400 truncate max-w-[200px]">${airport.name}</div>
      </div>
      <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-800 text-slate-300">${airport.country}</span>
    `;

    item.addEventListener('click', () => {
      if (type === 'origin') {
        AppState.route.origin = airport.code;
      } else {
        AppState.route.destination = airport.code;
      }
      updateAirportInputDisplays();
      list.classList.add('hidden');
      updateAwardsFromPreset();
      recalculateAll();
    });

    list.appendChild(item);
  });
}

function updateAirportInputDisplays() {
  const originAirport = AIRPORTS_DATABASE.find(a => a.code === AppState.route.origin);
  const destAirport = AIRPORTS_DATABASE.find(a => a.code === AppState.route.destination);

  const origInput = document.getElementById('input-airport-origin');
  const destInput = document.getElementById('input-airport-destination');

  if (origInput) origInput.value = originAirport ? `${originAirport.city} (${originAirport.code})` : AppState.route.origin;
  if (destInput) destInput.value = destAirport ? `${destAirport.city} (${destAirport.code})` : AppState.route.destination;

  const routeBanner = document.getElementById('current-route-banner');
  const comparatorRouteBadge = document.getElementById('comparator-route-badge');
  const routeStr = `${AppState.route.origin} ➔ ${AppState.route.destination}`;

  if (routeBanner) {
    routeBanner.textContent = routeStr;
  }
  if (comparatorRouteBadge) {
    const origCity = originAirport ? originAirport.city : AppState.route.origin;
    const destCity = destAirport ? destAirport.city : AppState.route.destination;
    comparatorRouteBadge.textContent = `${origCity} (${AppState.route.origin}) ➔ ${destCity} (${AppState.route.destination})`;
  }
}

function renderAirportOptions() {
  updateAirportInputDisplays();
  syncInputFields();
}

/**
 * Master Calculation & Render Trigger
 */
function recalculateAll() {
  const effectiveCash = AppState.route.cashPriceIdr;
  const effectiveTaxes = AppState.route.taxesIdr;
  const effectiveMiles = AppState.redemption.milesRequired;

  const currentCustomBenchmark = AppState.customBenchmarks[AppState.redemption.programId];

  const evalResult = calculateValuation({
    cashPriceIdr: effectiveCash,
    taxesIdr: effectiveTaxes,
    milesRequired: effectiveMiles,
    programId: AppState.redemption.programId,
    customBenchmark: currentCustomBenchmark,
    loyaltyPrograms: LOYALTY_PROGRAMS,
    lang: AppState.language
  });

  AppState.currentEvaluation = evalResult;

  renderValuationResults(evalResult);
  updateCreditCardDetails();
  if (AppState.activeTab === 'comparator') {
    renderMultiProgramComparison();
  }
}

/**
 * Render Main Valuation Dashboard & Verdict
 */
function renderValuationResults(result) {
  if (!result || !result.isValid) return;

  const valDisplay = document.getElementById('metric-val-per-mile');
  if (valDisplay) {
    valDisplay.textContent = formatRate(result.valuePerMile);
  }

  const verdictBadge = document.getElementById('verdict-badge');
  if (verdictBadge) {
    verdictBadge.className = `px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm ${result.verdict.badgeColor}`;
    verdictBadge.innerHTML = `<span>${result.verdict.title}</span>`;
  }

  const actionTitle = document.getElementById('verdict-action-title');
  if (actionTitle) {
    actionTitle.textContent = result.verdict.actionText;
  }

  const recSummary = document.getElementById('verdict-recommendation-summary');
  if (recSummary) {
    recSummary.textContent = result.verdict.summary;
  }

  const netSavedEl = document.getElementById('metric-net-cash-saved');
  if (netSavedEl) netSavedEl.textContent = formatIdr(result.netCashSaved);

  const breakevenEl = document.getElementById('metric-breakeven-cash');
  if (breakevenEl) breakevenEl.textContent = formatIdr(result.breakevenCashPrice);

  const benchmarkEl = document.getElementById('metric-benchmark-val');
  if (benchmarkEl) benchmarkEl.textContent = formatRate(result.benchmark);

  const gainLossEl = document.getElementById('metric-gain-loss');
  if (gainLossEl) {
    const isGain = result.netValueGainIdr >= 0;
    gainLossEl.textContent = `${isGain ? '+' : ''}${formatIdr(result.netValueGainIdr)}`;
    gainLossEl.className = isGain ? 'text-emerald-500 font-semibold font-mono-numbers' : 'text-red-500 font-semibold font-mono-numbers';
  }

  const needle = document.getElementById('meter-needle');
  if (needle) {
    let percentage = (result.valuationRatio / 2.0) * 100;
    if (percentage < 2) percentage = 2;
    if (percentage > 98) percentage = 98;
    needle.style.left = `${percentage}%`;
  }

  const progBadge = document.getElementById('active-program-badge');
  if (progBadge) {
    progBadge.textContent = result.programName;
  }
}

/**
 * Render Credit Card Earning Metrics with Turnover Ratio & Expiry
 */
function updateCreditCardDetails() {
  const miles = AppState.redemption.milesRequired;
  const cardId = AppState.creditCard.selectedCardId;
  const category = AppState.creditCard.spendCategory;
  const t = TRANSLATIONS[AppState.language].cardsAccumulator;

  const cardMetrics = calculateCreditCardMetrics(miles, cardId, category);
  if (!cardMetrics) return;

  AppState.currentCardMetrics = cardMetrics;

  const cardSpendTotalEl = document.getElementById('card-spend-total');
  const cardSpendRateEl = document.getElementById('card-spend-rate');
  const cardPointsEl = document.getElementById('card-bank-points');
  const cardTransferRatioEl = document.getElementById('card-transfer-ratio');
  const cardProsEl = document.getElementById('card-pros-notes');
  const cardPartnerTagsEl = document.getElementById('card-supported-partners');
  const cardTurnoverEl = document.getElementById('card-turnover-metric');
  const cardExpiryEl = document.getElementById('card-expiry-display');

  if (cardSpendTotalEl) cardSpendTotalEl.textContent = formatIdr(cardMetrics.estimatedTotalSpendIdr);
  
  const categoryLabel = category === 'overseas' ? ' (Overseas)' : (category === 'dining' ? ' (Dining)' : ' (Domestic)');
  if (cardSpendRateEl) cardSpendRateEl.textContent = `${formatIdr(cardMetrics.spendPerMileIdr)} ${t.spendRateSuffix}${categoryLabel}`;
  if (cardTransferRatioEl) cardTransferRatioEl.textContent = cardMetrics.pointsToMilesRatio;
  if (cardProsEl) cardProsEl.textContent = cardMetrics.card.pros;

  if (cardPointsEl) {
    if (cardMetrics.bankPointsRequired) {
      cardPointsEl.textContent = `${formatNumber(cardMetrics.bankPointsRequired)} ${cardMetrics.pointsCurrency}`;
    } else {
      cardPointsEl.textContent = t.autoCredited;
    }
  }

  // Credit Limit Turnover
  if (cardTurnoverEl) {
    if (cardMetrics.creditLimitTurnover) {
      cardTurnoverEl.textContent = `~${cardMetrics.creditLimitTurnover}x (Limit: ${formatIdr(cardMetrics.creditLimitIdr)})`;
    } else {
      cardTurnoverEl.textContent = 'Limit Not Set';
    }
  }

  // Points Expiry
  if (cardExpiryEl) {
    cardExpiryEl.textContent = cardMetrics.expiryPolicy;
  }

  if (cardPartnerTagsEl) {
    cardPartnerTagsEl.innerHTML = '';
    cardMetrics.card.supportedPrograms.forEach(progKey => {
      const prog = LOYALTY_PROGRAMS[progKey];
      if (prog) {
        const badge = document.createElement('span');
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-slate-300 border border-neutral-700';
        badge.textContent = prog.shortName;
        cardPartnerTagsEl.appendChild(badge);
      }
    });
  }
}

/**
 * Multi-Program Side-by-Side Comparison
 */
function renderMultiProgramComparison() {
  const container = document.getElementById('comparator-table-body');
  if (!container) return;

  const t = TRANSLATIONS[AppState.language].comparator;
  const cashPrice = AppState.route.cashPriceIdr;
  const currentOrigin = AppState.route.origin;
  const currentDest = AppState.route.destination;
  const cabin = AppState.route.cabin;

  const matchedRoute = POPULAR_ROUTES.find(r => 
    (r.origin === currentOrigin && r.destination === currentDest) ||
    (r.origin === currentDest && r.destination === currentOrigin)
  );

  const programsToCompare = Object.values(LOYALTY_PROGRAMS);
  const rowsData = [];

  programsToCompare.forEach(prog => {
    let miles = AppState.redemption.milesRequired;
    let taxes = AppState.route.taxesIdr;

    if (matchedRoute && matchedRoute.cabins[cabin] && matchedRoute.cabins[cabin].awards[prog.id]) {
      miles = matchedRoute.cabins[cabin].awards[prog.id].miles;
      if (matchedRoute.cabins[cabin].awards[prog.id].taxes) {
        taxes = matchedRoute.cabins[cabin].awards[prog.id].taxes;
      }
    }

    const customBench = AppState.customBenchmarks[prog.id];
    const evalRes = calculateValuation({
      cashPriceIdr: cashPrice,
      taxesIdr: taxes,
      milesRequired: miles,
      programId: prog.id,
      customBenchmark: customBench,
      loyaltyPrograms: LOYALTY_PROGRAMS,
      lang: AppState.language
    });

    const allCards = getAllAvailableCards();
    const matchingCards = allCards.filter(c => c.supportedPrograms.includes(prog.id));
    matchingCards.sort((a, b) => a.spendingPerMile - b.spendingPerMile);
    const bestCard = matchingCards[0];

    rowsData.push({
      prog,
      evalRes,
      bestCard
    });
  });

  rowsData.sort((a, b) => b.evalRes.valuePerMile - a.evalRes.valuePerMile);

  container.innerHTML = '';
  rowsData.forEach((row, index) => {
    const isTopValue = index === 0 && row.evalRes.valuePerMile > 0;
    const tr = document.createElement('tr');
    tr.className = `border-b border-neutral-800 hover:bg-neutral-900/60 transition-colors ${isTopValue ? 'bg-amber-500/10' : ''}`;

    tr.innerHTML = `
      <td class="px-4 py-3.5 whitespace-nowrap">
        <div class="flex items-center gap-2">
          ${isTopValue ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">${t.bestValueBadge}</span>` : ''}
          <div class="font-semibold text-slate-100 text-xs sm:text-sm">${row.prog.name}</div>
        </div>
        <div class="text-[11px] text-slate-400">${row.prog.alliance} • ${row.prog.airline}</div>
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap font-mono-numbers text-xs sm:text-sm text-slate-300">
        ${formatNumber(row.evalRes.milesRequired)}
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap font-mono-numbers text-xs sm:text-sm text-slate-400">
        ${formatIdr(row.evalRes.taxesIdr)}
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap font-mono-numbers font-bold text-xs sm:text-sm text-blue-400">
        ${formatRate(row.evalRes.valuePerMile)}
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap">
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${row.evalRes.verdict.badgeColor}">
          ${row.evalRes.verdict.title}
        </span>
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap text-xs text-slate-300">
        ${row.bestCard ? `<span class="font-medium text-slate-100">${row.bestCard.shortName}</span> <span class="text-[11px] text-slate-500">(${formatIdr(row.bestCard.spendingPerMile)}/mi)</span>` : '-'}
      </td>
      <td class="px-4 py-3.5 whitespace-nowrap text-right">
        <button type="button" class="btn-select-compare-prog px-3 py-1 rounded bg-neutral-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-medium transition-all" data-prog-id="${row.prog.id}" data-miles="${row.evalRes.milesRequired}" data-taxes="${row.evalRes.taxesIdr}">
          ${t.btnLoad}
        </button>
      </td>
    `;

    container.appendChild(tr);
  });

  container.querySelectorAll('.btn-select-compare-prog').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const progId = e.currentTarget.getAttribute('data-prog-id');
      const miles = Number(e.currentTarget.getAttribute('data-miles'));
      const taxes = Number(e.currentTarget.getAttribute('data-taxes'));

      AppState.redemption.programId = progId;
      AppState.redemption.milesRequired = miles;
      AppState.route.taxesIdr = taxes;

      syncInputFields();
      updateBestCardForProgram();
      switchTab('calculator');
      recalculateAll();
      showToast(`Loaded ${LOYALTY_PROGRAMS[progId].shortName}!`);
    });
  });
}

/**
 * Render All Indonesian Credit Cards Master Grid / My Wallet Grid
 * Includes Domestic Rate, Overseas Rate, Expiry Policy, Personal Credit Limit, and Edit Button
 */
function renderAllCardsMasterGrid() {
  const container = document.getElementById('cards-master-grid');
  if (!container) return;

  const tCards = TRANSLATIONS[AppState.language].cardsMaster;
  const tWallet = TRANSLATIONS[AppState.language].wallet;
  const allCards = getAllAvailableCards();
  const ownedIds = getOwnedCardIds();

  const walletBadge = document.getElementById('wallet-count-badge');
  const catalogBadge = document.getElementById('catalog-count-badge');
  if (walletBadge) walletBadge.textContent = ownedIds.length;
  if (catalogBadge) catalogBadge.textContent = allCards.length;

  let displayCards = allCards;
  if (AppState.walletSubtab === 'wallet') {
    displayCards = allCards.filter(c => ownedIds.includes(c.id));
  }

  container.innerHTML = '';
  if (AppState.walletSubtab === 'wallet' && displayCards.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center text-slate-400 bg-neutral-900/50 rounded-2xl border border-neutral-800">
        <i data-lucide="wallet" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm font-medium">${tWallet.emptyWalletTitle}</p>
        <p class="text-xs text-slate-500 mt-1">${tWallet.emptyWalletSubtitle}</p>
        <button type="button" id="btn-browse-catalog-from-empty" class="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all">
          ${tWallet.subtabCatalog}
        </button>
      </div>
    `;
    const browseBtn = container.querySelector('#btn-browse-catalog-from-empty');
    if (browseBtn) browseBtn.addEventListener('click', () => switchWalletSubtab('catalog'));
    lucide.createIcons();
    return;
  }

  displayCards.forEach(card => {
    const isOwned = ownedIds.includes(card.id);
    const cardEl = document.createElement('div');
    cardEl.className = 'glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500 transition-all shadow-xs';

    const partnersHtml = card.supportedPrograms.map(pk => {
      const prog = LOYALTY_PROGRAMS[pk];
      return `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-slate-300">${prog ? prog.shortName : pk}</span>`;
    }).join(' ');

    const ownershipBadge = isOwned
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">${tWallet.statusOwned}</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-slate-400 border border-neutral-700">${tWallet.statusNotOwned}</span>`;

    const overriddenBadge = card.isOverridden
      ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">${tWallet.tagOverridden}</span>`
      : '';

    const domesticRate = card.domesticSpendPerMile || card.spendingPerMile;
    const overseasRate = card.overseasSpendPerMile || card.spendingPerMile;
    const creditLimit = card.creditLimitIdr || 50000000;
    const expiryPolicy = card.expiryPolicy || '2 Years (24 Months)';

    cardEl.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500">${card.bank}</span>
              ${card.isCustom ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-900 text-emerald-300">CUSTOM</span>' : ''}
              ${overriddenBadge}
            </div>
            <h4 class="font-bold text-slate-100 text-sm sm:text-base">${card.name}</h4>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${card.badgeColor} border">${card.tier}</span>
            ${ownershipBadge}
          </div>
        </div>
        <p class="text-xs text-slate-400 mb-4">${card.categoryNotes}</p>

        <!-- Detailed Parameter Grid -->
        <div class="space-y-2 py-3 border-y border-neutral-800 text-xs mb-4">
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.domesticRate}</span>
            <span class="font-bold font-mono-numbers text-slate-100">${formatIdr(domesticRate)} / mile</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.overseasRate}</span>
            <span class="font-bold font-mono-numbers text-blue-400">${formatIdr(overseasRate)} / mile</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.creditLimit}</span>
            <span class="font-medium font-mono-numbers text-amber-300">${formatIdr(creditLimit)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.expiryPolicy}</span>
            <span class="font-medium text-slate-300 text-[11px] truncate max-w-[170px]">${expiryPolicy}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.transferRatio}</span>
            <span class="font-medium text-slate-300">${card.pointsToMilesRatio}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${tCards.annualFee}</span>
            <span class="text-slate-400 text-[11px]">${card.annualFee}</span>
          </div>
        </div>

        <div class="mb-4">
          <span class="text-[11px] font-semibold text-slate-300 block mb-1.5">${tCards.partners}</span>
          <div class="flex flex-wrap gap-1.5">${partnersHtml}</div>
        </div>
      </div>

      <div class="space-y-2 pt-2 border-t border-neutral-800">
        <div class="flex items-center gap-1.5">
          <!-- Toggle Ownership Button -->
          <button type="button" class="btn-toggle-ownership flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${isOwned ? 'border-red-900/60 text-red-400 hover:bg-red-500/10' : 'border-emerald-700/60 text-emerald-400 hover:bg-emerald-500/10'}" data-card-id="${card.id}">
            ${isOwned ? tWallet.btnRemoveOwned : tWallet.btnMarkOwned}
          </button>
          
          <!-- Edit Parameters Button -->
          <button type="button" class="btn-edit-card-params py-1.5 px-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-slate-300 text-xs font-medium transition-colors" data-card-id="${card.id}" title="Edit Parameters">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>

          <!-- Reset Override button if built-in card was edited -->
          ${card.isOverridden ? `
            <button type="button" class="btn-reset-card-override py-1.5 px-2.5 rounded-xl border border-amber-900/60 text-amber-400 hover:bg-amber-500/10 text-xs font-medium transition-colors" data-card-id="${card.id}" title="${tWallet.btnResetDefault}">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}

          <!-- Delete button if custom card -->
          ${card.isCustom ? `
            <button type="button" class="btn-delete-custom-card py-1.5 px-2.5 rounded-xl border border-red-900/60 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors" data-card-id="${card.id}" title="${tWallet.btnDeleteCustom}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>

        <!-- Select in Calculator button -->
        <button type="button" class="btn-select-card-for-calc w-full py-2 rounded-xl bg-neutral-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs font-semibold transition-all" data-card-id="${card.id}">
          ${tCards.btnSelectForCalc}
        </button>
      </div>
    `;

    // Ownership listener
    cardEl.querySelector('.btn-toggle-ownership').addEventListener('click', (e) => {
      const cardId = e.currentTarget.getAttribute('data-card-id');
      const nowOwned = toggleCardOwnership(cardId);
      renderAllCardsMasterGrid();
      renderCardSelector();
      updateCreditCardDetails();
      showToast(nowOwned ? TRANSLATIONS[AppState.language].toasts.cardAdded : TRANSLATIONS[AppState.language].toasts.cardRemoved);
    });

    // Edit button listener
    cardEl.querySelector('.btn-edit-card-params').addEventListener('click', (e) => {
      const cardId = e.currentTarget.getAttribute('data-card-id');
      openCardModal(cardId);
    });

    // Reset override listener
    const resetBtn = cardEl.querySelector('.btn-reset-card-override');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        const cardId = e.currentTarget.getAttribute('data-card-id');
        resetCardOverride(cardId);
        renderAllCardsMasterGrid();
        renderCardSelector();
        updateCreditCardDetails();
        showToast(TRANSLATIONS[AppState.language].toasts.cardReset);
      });
    }

    // Custom card deletion listener
    const delBtn = cardEl.querySelector('.btn-delete-custom-card');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        const cardId = e.currentTarget.getAttribute('data-card-id');
        deleteCustomCard(cardId);
        renderAllCardsMasterGrid();
        renderCardSelector();
        updateCreditCardDetails();
        showToast(TRANSLATIONS[AppState.language].toasts.customCardDeleted);
      });
    }

    // Select in calculator listener
    cardEl.querySelector('.btn-select-card-for-calc').addEventListener('click', () => {
      AppState.creditCard.selectedCardId = card.id;
      const select = document.getElementById('select-card');
      if (select) select.value = card.id;
      switchTab('calculator');
      updateCreditCardDetails();
      showToast(`Selected ${card.shortName}!`);
    });

    container.appendChild(cardEl);
  });

  lucide.createIcons();
}

/**
 * Render Benchmark Settings Sliders
 */
function renderBenchmarkSettings() {
  const container = document.getElementById('benchmarks-settings-list');
  if (!container) return;

  const t = TRANSLATIONS[AppState.language].settings;

  container.innerHTML = '';
  Object.values(LOYALTY_PROGRAMS).forEach(prog => {
    const currentVal = AppState.customBenchmarks[prog.id] || prog.defaultBenchmark;
    const row = document.createElement('div');
    row.className = 'p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 shadow-xs';

    row.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div>
          <span class="font-semibold text-slate-100 text-sm">${prog.name}</span>
          <span class="text-xs text-slate-500 ml-2">${t.defaultLabel} ${formatIdr(prog.defaultBenchmark)}/mile</span>
        </div>
        <span class="font-bold font-mono-numbers text-blue-400 text-sm" id="slider-val-${prog.id}">
          ${formatIdr(currentVal)}/mile
        </span>
      </div>
      <input type="range" min="80" max="300" step="5" value="${currentVal}" class="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer" data-program-slider="${prog.id}">
      <div class="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>Rp 80</span>
        <span>Rp 150</span>
        <span>Rp 220</span>
        <span>Rp 300</span>
      </div>
    `;

    const slider = row.querySelector(`[data-program-slider="${prog.id}"]`);
    const label = row.querySelector(`#slider-val-${prog.id}`);

    slider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      label.textContent = `${formatIdr(val)}/mile`;
      AppState.customBenchmarks[prog.id] = val;
      saveCustomBenchmark(prog.id, val);
      recalculateAll();
    });

    container.appendChild(row);
  });
}

function handleResetBenchmarks() {
  resetCustomBenchmarks();
  AppState.customBenchmarks = {};
  renderBenchmarkSettings();
  recalculateAll();
  const t = TRANSLATIONS[AppState.language].toasts;
  showToast(t.resetBenchmarks);
}

/**
 * Render Saved Evaluations List in History Tab
 */
function renderSavedHistoryList() {
  const container = document.getElementById('saved-history-list');
  const countBadge = document.getElementById('history-count-badge');
  if (!container) return;

  const t = TRANSLATIONS[AppState.language].history;
  AppState.savedEvaluations = getSavedEvaluations();
  if (countBadge) countBadge.textContent = AppState.savedEvaluations.length;

  container.innerHTML = '';
  if (AppState.savedEvaluations.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-400 bg-neutral-900/50 rounded-2xl border border-neutral-800">
        <i data-lucide="bookmark" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm font-medium">${t.emptyTitle}</p>
        <p class="text-xs text-slate-500 mt-1">${t.emptySubtitle}</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  AppState.savedEvaluations.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glass-card p-4 rounded-xl border border-neutral-800 hover:border-blue-500 transition-all shadow-xs';

    const dateStr = new Date(item.createdAt).toLocaleDateString(AppState.language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-800">
        <div>
          <span class="text-xs font-bold text-blue-400 uppercase">${item.programName}</span>
          <h4 class="font-bold text-slate-100 text-sm sm:text-base">${item.route.origin} ✈️ ${item.route.destination} (${item.route.cabin})</h4>
          <span class="text-[11px] text-slate-500">${dateStr}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${item.verdict.badgeColor}">
            ${item.verdict.title}
          </span>
          <button type="button" class="btn-delete-saved p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" data-id="${item.id}" title="Delete">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
        <div>
          <span class="text-slate-500 text-[11px] block">${t.colCashTicket}</span>
          <span class="font-mono-numbers font-semibold text-slate-200">${formatIdr(item.cashPriceIdr)}</span>
        </div>
        <div>
          <span class="text-slate-500 text-[11px] block">${t.colMilesNeeded}</span>
          <span class="font-mono-numbers font-semibold text-slate-200">${formatNumber(item.milesRequired)}</span>
        </div>
        <div>
          <span class="text-slate-500 text-[11px] block">${t.colTaxes}</span>
          <span class="font-mono-numbers font-semibold text-slate-200">${formatIdr(item.taxesIdr)}</span>
        </div>
        <div>
          <span class="text-slate-500 text-[11px] block">${t.colValuePerMile}</span>
          <span class="font-mono-numbers font-bold text-blue-400">${formatRate(item.valuePerMile)}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-neutral-800">
        <span class="text-xs text-slate-400">${item.verdict.actionText}</span>
        <button type="button" class="btn-reload-saved text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors" data-id="${item.id}">
          ${t.btnLoadIntoCalc}
        </button>
      </div>
    `;

    card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSavedEvaluation(item.id);
      renderSavedHistoryList();
      showToast(TRANSLATIONS[AppState.language].toasts.deleted);
    });

    card.querySelector('.btn-reload-saved').addEventListener('click', () => {
      AppState.route = { ...item.route };
      AppState.redemption.programId = item.programId;
      AppState.redemption.milesRequired = item.milesRequired;
      updateAirportInputDisplays();
      syncInputFields();
      switchTab('calculator');
      recalculateAll();
      showToast(`Loaded ${item.route.origin} → ${item.route.destination}!`);
    });

    container.appendChild(card);
  });

  lucide.createIcons();
}

/**
 * Handle Save Current Evaluation
 */
function handleSaveCurrentEvaluation() {
  const t = TRANSLATIONS[AppState.language].toasts;
  if (!AppState.currentEvaluation || !AppState.currentEvaluation.isValid) {
    showToast(t.invalidCalc);
    return;
  }

  const record = {
    ...AppState.currentEvaluation,
    route: { ...AppState.route },
    card: AppState.currentCardMetrics ? {
      name: AppState.currentCardMetrics.card.name,
      estimatedTotalSpendIdr: AppState.currentCardMetrics.estimatedTotalSpendIdr
    } : null
  };

  const saved = saveEvaluation(record);
  if (saved) {
    showToast(t.saved);
    const badge = document.getElementById('history-count-badge');
    if (badge) badge.textContent = getSavedEvaluations().length;
  }
}

/**
 * Handle Copy Summary
 */
function handleCopySummary() {
  const t = TRANSLATIONS[AppState.language].toasts;
  if (!AppState.currentEvaluation || !AppState.currentEvaluation.isValid) {
    showToast(t.noActiveCalc);
    return;
  }

  const routeDetails = {
    origin: AppState.route.origin,
    destination: AppState.route.destination,
    cabin: AppState.route.cabin.toUpperCase(),
    isRoundTrip: AppState.route.tripType === 'roundtrip'
  };

  const summary = buildShareableSummary(
    AppState.currentEvaluation,
    routeDetails,
    AppState.currentCardMetrics,
    AppState.language
  );

  navigator.clipboard.writeText(summary).then(() => {
    showToast(t.copied);
  }).catch(() => {
    prompt('Copy your valuation report:', summary);
  });
}

/**
 * Toast Notification
 */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold shadow-2xl toast-slide-in flex items-center gap-2';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.remove('hidden');

  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

/**
 * Helper: parse string numbers with dots or commas
 */
function parseRawNumber(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  return Number(cleaned) || 0;
}

/**
 * ==========================================
 * CROSS-DEVICE CLOUD SYNC UI CONTROLLER
 * ==========================================
 */

let qrCodeInstance = null;

function initSyncUI() {
  if (typeof SyncService === 'undefined') return;
  updateSyncPillUI(SyncService.getSyncInfo());
}

function updateSyncPillUI(syncInfo) {
  const info = syncInfo || (typeof SyncService !== 'undefined' ? SyncService.getSyncInfo() : null);
  if (!info) return;

  const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
  const statusText = document.getElementById('sync-status-text');
  const desktopBtn = document.getElementById('btn-sync-status');
  const statusIcons = document.querySelectorAll('.sync-status-icon');

  if (statusText) {
    if (info.status === 'synced') {
      statusText.textContent = t.pillSynced;
    } else if (info.status === 'syncing') {
      statusText.textContent = t.pillSyncing;
    } else if (info.status === 'offline') {
      statusText.textContent = t.pillOffline;
    } else if (info.status === 'error') {
      statusText.textContent = t.pillError;
    } else {
      statusText.textContent = t.pillDisconnected;
    }
  }

  statusIcons.forEach(icon => {
    icon.classList.remove('text-cyan-400', 'text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-rose-400', 'animate-spin');
    if (info.status === 'synced') {
      icon.classList.add('text-emerald-400');
      icon.setAttribute('data-lucide', 'cloud');
    } else if (info.status === 'syncing') {
      icon.classList.add('text-blue-400', 'animate-spin');
      icon.setAttribute('data-lucide', 'refresh-cw');
    } else if (info.status === 'offline') {
      icon.classList.add('text-amber-400');
      icon.setAttribute('data-lucide', 'cloud-off');
    } else if (info.status === 'error') {
      icon.classList.add('text-rose-400');
      icon.setAttribute('data-lucide', 'cloud-alert');
    } else {
      icon.classList.add('text-cyan-400');
      icon.setAttribute('data-lucide', 'cloud');
    }
  });

  if (desktopBtn) {
    desktopBtn.classList.remove('border-emerald-600/40', 'border-blue-600/40', 'border-rose-600/40');
    if (info.status === 'synced') {
      desktopBtn.classList.add('border-emerald-600/40');
    } else if (info.status === 'syncing') {
      desktopBtn.classList.add('border-blue-600/40');
    } else if (info.status === 'error') {
      desktopBtn.classList.add('border-rose-600/40');
    }
  }

  // Update modal contents if modal is open
  updateSyncModalUI(info);
  lucide.createIcons();
}

function updateSyncModalUI(info) {
  const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
  const statusDot = document.getElementById('sync-status-dot');
  const connTitle = document.getElementById('sync-connection-title');
  const lastTime = document.getElementById('sync-last-time');
  const vaultPill = document.getElementById('sync-vault-pill');
  const shareSection = document.getElementById('sync-share-section');
  const manualSyncBtn = document.getElementById('btn-manual-sync');
  const disconnectBtn = document.getElementById('btn-disconnect-sync');
  const keyInput = document.getElementById('input-sync-key');
  const shareUrlInput = document.getElementById('input-sync-share-url');

  if (!statusDot || !connTitle) return;

  statusDot.classList.remove('bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-500');

  if (info.isConnected) {
    statusDot.classList.add(info.status === 'synced' ? 'bg-emerald-500' : (info.status === 'syncing' ? 'bg-blue-500' : 'bg-amber-500'));
    connTitle.textContent = `${t.statusConnected} (${info.syncKey})`;
    
    if (info.lastSynced) {
      const dateStr = new Date(info.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      lastTime.textContent = `${t.lastSynced} ${dateStr}`;
    } else {
      lastTime.textContent = 'Syncing...';
    }

    if (vaultPill) {
      vaultPill.textContent = `Vault: ${info.vaultId.substring(0, 10)}...`;
      vaultPill.classList.remove('hidden');
    }

    if (shareSection) shareSection.classList.remove('hidden');
    if (manualSyncBtn) manualSyncBtn.classList.remove('hidden');
    if (disconnectBtn) disconnectBtn.classList.remove('hidden');

    if (keyInput && !keyInput.value) {
      keyInput.value = info.syncKey;
    }

    // Generate Share URL and QR code
    const shareUrl = SyncService.getSyncShareUrl();
    if (shareUrlInput) shareUrlInput.value = shareUrl;
    renderSyncQRCode(shareUrl);

  } else {
    statusDot.classList.add('bg-slate-500');
    connTitle.textContent = t.statusNotConnected;
    lastTime.textContent = 'Changes stay on this device only.';
    if (vaultPill) vaultPill.classList.add('hidden');
    if (shareSection) shareSection.classList.add('hidden');
    if (manualSyncBtn) manualSyncBtn.classList.add('hidden');
    if (disconnectBtn) disconnectBtn.classList.add('hidden');
  }
}

function renderSyncQRCode(url) {
  const qrContainer = document.getElementById('sync-qrcode');
  if (!qrContainer || !url || typeof QRCode === 'undefined') return;

  qrContainer.innerHTML = '';
  try {
    qrCodeInstance = new QRCode(qrContainer, {
      text: url,
      width: 160,
      height: 160,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    console.warn('QR Code generation error:', err);
  }
}

function openSyncModal() {
  const modal = document.getElementById('modal-cloud-sync');
  if (!modal) return;
  modal.classList.remove('hidden');
  if (typeof SyncService !== 'undefined') {
    updateSyncPillUI(SyncService.getSyncInfo());
  }
}

function closeSyncModal() {
  const modal = document.getElementById('modal-cloud-sync');
  if (modal) modal.classList.add('hidden');
}

function handleGenerateSyncKey() {
  if (typeof SyncService === 'undefined') return;
  const newKey = SyncService.generateRandomKey();
  const input = document.getElementById('input-sync-key');
  if (input) input.value = newKey;
}

async function handleConnectSync() {
  if (typeof SyncService === 'undefined') return;
  const input = document.getElementById('input-sync-key');
  if (!input || !input.value.trim()) {
    alert('Please enter a Sync Key (at least 4 characters)');
    return;
  }

  const connectBtn = document.getElementById('btn-connect-sync');
  if (connectBtn) {
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
  }

  try {
    await SyncService.connect(input.value.trim());
    const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
    showToast(t.toastConnected);
  } catch (err) {
    alert('Connection failed: ' + err.message);
  } finally {
    if (connectBtn) {
      connectBtn.disabled = false;
      const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
      connectBtn.textContent = t.btnConnect;
    }
  }
}

async function handleManualSync() {
  if (typeof SyncService === 'undefined') return;
  const btn = document.getElementById('btn-manual-sync');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Syncing...';
  }

  try {
    const pulled = await SyncService.pullFromCloud();
    const pushed = await SyncService.pushToCloud();
    const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
    if (pulled || pushed) {
      showToast(t.toastSynced);
    } else {
      showToast(t.toastSynced);
    }
  } catch (err) {
    const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
    showToast(t.toastError);
  } finally {
    if (btn) {
      btn.disabled = false;
      const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
      btn.textContent = t.btnSyncNow;
    }
  }
}

function handleDisconnectSync() {
  if (typeof SyncService === 'undefined') return;
  const confirmMsg = AppState.language === 'id' 
    ? 'Putuskan hubungan sinkronisasi? Data lokal Anda akan tetap aman di perangkat ini.' 
    : 'Disconnect from cloud sync? Your local data will remain safe on this device.';
  if (confirm(confirmMsg)) {
    SyncService.disconnect();
    const input = document.getElementById('input-sync-key');
    if (input) input.value = '';
    const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
    showToast(t.toastDisconnected);
  }
}

function handleCopySyncLink() {
  const input = document.getElementById('input-sync-share-url');
  if (!input || !input.value) return;

  navigator.clipboard.writeText(input.value).then(() => {
    const t = TRANSLATIONS[AppState.language]?.sync || TRANSLATIONS.en.sync;
    showToast(t.toastCopied);
  }).catch(() => {
    prompt('Copy your 1-Click Sync link:', input.value);
  });
}
