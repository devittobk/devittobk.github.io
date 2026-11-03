/**
 * Local Storage Persistence & Shareable Summary Generator
 * Supports Theme, Language, Saved Evaluations, Custom Benchmarks, Card Overrides, and My Wallet.
 */

const STORAGE_KEYS = {
  SAVED_EVALUATIONS: 'id_miles_calc_evaluations_v1',
  CUSTOM_BENCHMARKS: 'id_miles_calc_benchmarks_v1',
  THEME: 'id_miles_calc_theme_v1',
  LANG: 'id_miles_calc_lang_v1',
  OWNED_CARDS: 'id_miles_calc_owned_cards_v1',
  CUSTOM_CARDS: 'id_miles_calc_custom_cards_v1',
  CARD_OVERRIDES: 'id_miles_calc_card_overrides_v1',
  FILTER_OWNED_ONLY: 'id_miles_calc_filter_owned_v1'
};

function notifyStorageUpdated() {
  if (typeof SyncService !== 'undefined' && SyncService.markLocalDataModified) {
    SyncService.markLocalDataModified();
  }
}

/**
 * Get saved theme ('amoled' by default)
 */
function getSavedTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme || 'amoled';
  } catch (err) {
    return 'amoled';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    return true;
  } catch (err) {
    return false;
  }
}

function getSavedLanguage() {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.LANG);
    return lang || 'en';
  } catch (err) {
    return 'en';
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * ==========================================
 * CARD OVERRIDES (Editing Built-in Cards)
 * ==========================================
 */

function getCardOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARD_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function saveCardOverride(cardId, data) {
  try {
    const current = getCardOverrides();
    current[cardId] = {
      ...(current[cardId] || {}),
      ...data,
      isOverridden: true,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CARD_OVERRIDES, JSON.stringify(current));
    notifyStorageUpdated();
    return true;
  } catch (err) {
    console.error('Error saving card override:', err);
    return false;
  }
}

function resetCardOverride(cardId) {
  try {
    const current = getCardOverrides();
    delete current[cardId];
    localStorage.setItem(STORAGE_KEYS.CARD_OVERRIDES, JSON.stringify(current));
    notifyStorageUpdated();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * ==========================================
 * MY WALLET: OWNED CARDS & CUSTOM CARDS
 * ==========================================
 */

const DEFAULT_OWNED_CARDS = [
  'bca-kf-infinite',
  'cimb-jcb-ultimate',
  'uob-privi-miles',
  'dbs-travel-plat'
];

function getOwnedCardIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OWNED_CARDS);
    return raw ? JSON.parse(raw) : DEFAULT_OWNED_CARDS;
  } catch (err) {
    return DEFAULT_OWNED_CARDS;
  }
}

function setOwnedCardIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEYS.OWNED_CARDS, JSON.stringify(ids));
    notifyStorageUpdated();
    return true;
  } catch (err) {
    return false;
  }
}

function toggleCardOwnership(cardId) {
  const current = getOwnedCardIds();
  const index = current.indexOf(cardId);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(cardId);
  }
  setOwnedCardIds(current);
  return current.includes(cardId);
}

function getCustomCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CARDS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveCustomCard(cardData) {
  try {
    const list = getCustomCards();
    const domesticRate = Number(cardData.domesticSpendPerMile) || Number(cardData.spendingPerMile) || 10000;
    const overseasRate = Number(cardData.overseasSpendPerMile) || domesticRate;

    const newCard = {
      id: cardData.id || ('custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      bank: cardData.bank || 'Custom Bank',
      name: cardData.name || 'My Custom Card',
      shortName: cardData.shortName || (cardData.bank + ' ' + cardData.name).substr(0, 18),
      tier: cardData.tier || 'Custom Tier',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500',
      supportedPrograms: cardData.supportedPrograms && cardData.supportedPrograms.length > 0 ? cardData.supportedPrograms : ['krisflyer'],
      pointsCurrency: cardData.pointsCurrency || 'Points',
      pointsToMilesRatio: cardData.pointsToMilesRatio || '1 : 1',
      pointsPerMile: Number(cardData.pointsPerMile) || 1,
      spendingPerMile: domesticRate,
      domesticSpendPerMile: domesticRate,
      overseasSpendPerMile: overseasRate,
      expiryPolicy: cardData.expiryPolicy || 'Never Expires',
      creditLimitIdr: Number(cardData.creditLimitIdr) || 50000000,
      annualFee: cardData.annualFee || 'Free',
      pros: cardData.pros || 'User defined custom credit card.',
      categoryNotes: cardData.categoryNotes || 'Custom card added to wallet.',
      isCustom: true
    };

    const existingIdx = list.findIndex(c => c.id === newCard.id);
    if (existingIdx > -1) {
      list[existingIdx] = newCard;
    } else {
      list.push(newCard);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(list));

    const owned = getOwnedCardIds();
    if (!owned.includes(newCard.id)) {
      owned.push(newCard.id);
      setOwnedCardIds(owned);
    }

    notifyStorageUpdated();
    return newCard;
  } catch (err) {
    console.error('Error saving custom card:', err);
    return null;
  }
}

function deleteCustomCard(cardId) {
  try {
    let list = getCustomCards();
    list = list.filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(list));

    let owned = getOwnedCardIds();
    owned = owned.filter(id => id !== cardId);
    setOwnedCardIds(owned);
    notifyStorageUpdated();
    return true;
  } catch (err) {
    return false;
  }
}

function getFilterOwnedOnly() {
  try {
    return localStorage.getItem(STORAGE_KEYS.FILTER_OWNED_ONLY) === 'true';
  } catch (err) {
    return false;
  }
}

function setFilterOwnedOnly(boolVal) {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTER_OWNED_ONLY, boolVal ? 'true' : 'false');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * ==========================================
 * SAVED EVALUATIONS & BENCHMARKS
 * ==========================================
 */

function getSavedEvaluations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_EVALUATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveEvaluation(record) {
  try {
    const items = getSavedEvaluations();
    const entry = {
      id: 'eval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...record
    };
    items.unshift(entry);
    const trimmed = items.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.SAVED_EVALUATIONS, JSON.stringify(trimmed));
    notifyStorageUpdated();
    return entry;
  } catch (err) {
    return null;
  }
}

function deleteSavedEvaluation(id) {
  try {
    const items = getSavedEvaluations().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_EVALUATIONS, JSON.stringify(items));
    notifyStorageUpdated();
    return true;
  } catch (err) {
    return false;
  }
}

function clearAllSavedEvaluations() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_EVALUATIONS);
    notifyStorageUpdated();
    return true;
  } catch (err) {
    return false;
  }
}

function getCustomBenchmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BENCHMARKS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function saveCustomBenchmark(programId, value) {
  try {
    const current = getCustomBenchmarks();
    current[programId] = Number(value);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BENCHMARKS, JSON.stringify(current));
    return true;
  } catch (err) {
    return false;
  }
}

function resetCustomBenchmarks() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_BENCHMARKS);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Build shareable summary in active language
 */
function buildShareableSummary(evalResult, routeDetails, cardDetails, lang = 'en') {
  if (!evalResult || !evalResult.isValid) return '';

  const {
    programName,
    milesRequired,
    cashPriceIdr,
    taxesIdr,
    netCashSaved,
    valuePerMile,
    benchmark,
    breakevenCashPrice,
    verdict
  } = evalResult;

  const currentLang = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? lang : 'en';
  const t = (typeof TRANSLATIONS !== 'undefined') ? TRANSLATIONS[currentLang].shareable : null;

  const routeStr = routeDetails ? `${routeDetails.origin} ✈️ ${routeDetails.destination} (${routeDetails.cabin})` : 'Flight Redemption';
  const tripTypeStr = routeDetails && routeDetails.isRoundTrip ? (currentLang === 'id' ? 'Pulang Pergi' : 'Round-Trip') : (currentLang === 'id' ? 'Sekali Jalan' : 'One-Way');

  if (t) {
    let text = `${t.header}\n`;
    text += `${t.route} ${routeStr} [${tripTypeStr}]\n`;
    text += `${t.program} ${programName}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `${t.cashPrice} ${formatIdr(cashPriceIdr)}\n`;
    text += `${t.milesNeeded} ${formatNumber(milesRequired)} miles\n`;
    text += `${t.taxes} ${formatIdr(taxesIdr)}\n`;
    text += `${t.cashSaved} ${formatIdr(netCashSaved)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `${t.valPerMile} ${formatRate(valuePerMile)}\n`;
    text += `${t.benchmark} ${formatRate(benchmark)}\n`;
    text += `${t.verdict} ${verdict.title} - ${verdict.actionText}\n`;
    text += `${t.recommendation} ${verdict.summary}\n`;
    text += `${t.breakeven} ${formatIdr(breakevenCashPrice)} ${t.breakevenNote}\n`;

    if (cardDetails) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `${t.ccSection} ${cardDetails.card.name}\n`;
      text += `${t.ccSpend} ${formatIdr(cardDetails.estimatedTotalSpendIdr)} (${formatIdr(cardDetails.spendPerMileIdr)}/mile)\n`;
      if (cardDetails.bankPointsRequired) {
        text += `${t.ccPoints} ${formatNumber(cardDetails.bankPointsRequired)} ${cardDetails.pointsCurrency}\n`;
      }
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `${t.footer}`;
    return text;
  }

  return `Flight: ${routeStr}\nValue: ${formatRate(valuePerMile)}\nVerdict: ${verdict.title}`;
}

function exportStateBundle() {
  return {
    customCards: getCustomCards(),
    cardOverrides: getCardOverrides(),
    ownedCardIds: getOwnedCardIds(),
    evaluations: getSavedEvaluations(),
    benchmarks: getCustomBenchmarks(),
    filterOwnedOnly: getFilterOwnedOnly(),
    theme: getSavedTheme(),
    lang: getSavedLanguage(),
    updatedAt: Date.now()
  };
}

function importStateBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') return false;
  try {
    if (Array.isArray(bundle.customCards)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARDS, JSON.stringify(bundle.customCards));
    }
    if (bundle.cardOverrides && typeof bundle.cardOverrides === 'object') {
      localStorage.setItem(STORAGE_KEYS.CARD_OVERRIDES, JSON.stringify(bundle.cardOverrides));
    }
    if (Array.isArray(bundle.ownedCardIds)) {
      localStorage.setItem(STORAGE_KEYS.OWNED_CARDS, JSON.stringify(bundle.ownedCardIds));
    }
    if (Array.isArray(bundle.evaluations)) {
      localStorage.setItem(STORAGE_KEYS.SAVED_EVALUATIONS, JSON.stringify(bundle.evaluations));
    }
    if (bundle.benchmarks && typeof bundle.benchmarks === 'object') {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BENCHMARKS, JSON.stringify(bundle.benchmarks));
    }
    if (bundle.filterOwnedOnly !== undefined) {
      localStorage.setItem(STORAGE_KEYS.FILTER_OWNED_ONLY, bundle.filterOwnedOnly ? 'true' : 'false');
    }
    if (bundle.theme) {
      saveTheme(bundle.theme);
    }
    if (bundle.lang) {
      saveLanguage(bundle.lang);
    }
    return true;
  } catch (err) {
    console.error('Error importing state bundle:', err);
    return false;
  }
}

const StorageService = {
  STORAGE_KEYS,
  getSavedTheme,
  saveTheme,
  getSavedLanguage,
  saveLanguage,
  DEFAULT_OWNED_CARDS,
  getOwnedCardIds,
  setOwnedCardIds,
  toggleCardOwnership,
  getCustomCards,
  saveCustomCard,
  deleteCustomCard,
  getCardOverrides,
  saveCardOverride,
  resetCardOverride,
  getFilterOwnedOnly,
  setFilterOwnedOnly,
  getSavedEvaluations,
  saveEvaluation,
  deleteSavedEvaluation,
  clearAllSavedEvaluations,
  getCustomBenchmarks,
  saveCustomBenchmark,
  resetCustomBenchmarks,
  buildShareableSummary,
  exportStateBundle,
  importStateBundle
};

if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...StorageService
  };
}
