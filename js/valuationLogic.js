/**
 * Core Valuation Logic & Decision Engine
 * Computes IDR per mile, comparisons with benchmarks, break-even price, and tiered verdicts with bilingual support.
 */

/**
 * Format IDR currency with Indonesian thousand separators (dot).
 */
function formatIdr(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return rounded < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format general numbers with Indonesian thousand separators.
 */
function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format rate (e.g., Rp 185 / mile)
 */
function formatRate(rate) {
  if (rate === null || rate === undefined || isNaN(rate)) return 'Rp 0 / mile';
  const formatted = Math.round(rate).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted} / mile`;
}

/**
 * Evaluates the redemption worthiness.
 * 
 * @param {Object} params
 * @param {number} params.cashPriceIdr - Cash price of ticket in IDR
 * @param {number} params.taxesIdr - Taxes, airport levies & carrier surcharges in IDR
 * @param {number} params.milesRequired - Total miles needed for the award ticket
 * @param {string} params.programId - Airline program key (e.g. 'krisflyer', 'garudamiles')
 * @param {number} [params.customBenchmark] - Optional custom valuation threshold
 * @param {Object} [params.loyaltyPrograms] - Loyalty program catalog
 * @param {string} [params.lang='en'] - 'en' or 'id'
 */
function calculateValuation({ cashPriceIdr, taxesIdr, milesRequired, programId, customBenchmark, loyaltyPrograms, lang = 'en' }) {
  const cash = Number(cashPriceIdr) || 0;
  const taxes = Number(taxesIdr) || 0;
  const miles = Number(milesRequired) || 0;

  if (miles <= 0) {
    return {
      isValid: false,
      error: 'Miles required must be greater than 0.'
    };
  }

  const netCashSaved = cash - taxes;
  const valuePerMile = netCashSaved / miles;

  // Determine program baseline
  let benchmark = 150;
  let programName = 'General Program';
  let programColor = '#00266B';

  if (loyaltyPrograms && loyaltyPrograms[programId]) {
    const prog = loyaltyPrograms[programId];
    benchmark = prog.defaultBenchmark;
    programName = prog.name;
    programColor = prog.color;
  }

  if (customBenchmark && Number(customBenchmark) > 0) {
    benchmark = Number(customBenchmark);
  }

  const valuationRatio = benchmark > 0 ? (valuePerMile / benchmark) : 1;
  const breakevenCashPrice = (benchmark * miles) + taxes;
  const netValueGainIdr = netCashSaved - (miles * benchmark);

  // i18n lookup
  const currentLang = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? lang : 'en';
  const tDict = (typeof TRANSLATIONS !== 'undefined') ? TRANSLATIONS[currentLang].verdicts : null;

  // Default English fallback if TRANSLATIONS not present
  const defaultVerdicts = {
    worst: {
      title: 'Loss / Negative Value 🛑',
      actionText: 'Definitely Buy Cash',
      summary: 'Taxes and surcharges equal or exceed the cash ticket price! You would be giving away miles for free.'
    },
    exceptional: {
      title: 'Exceptional Deal 🔥',
      actionText: 'Must Redeem Miles!',
      summary: 'Incredible value of {valPerMile}, which is +{percent}% above the standard benchmark ({benchmark}). An outstanding way to use your points.'
    },
    great: {
      title: 'Great Redemption ✅',
      actionText: 'Redeem Miles (Worth It)',
      summary: 'High value of {valPerMile}, comfortably beating the benchmark ({benchmark}) by +{percent}%. Great return on your accumulated miles.'
    },
    fair: {
      title: 'Fair / Break-Even ⚖️',
      actionText: 'Situational / Decent',
      summary: 'Fair value of {valPerMile}, sitting close to the benchmark of {benchmark}. Recommended if your miles are nearing expiration or to preserve upfront cash.'
    },
    poor: {
      title: 'Poor Value ❌',
      actionText: 'Better Buy with Cash',
      summary: 'Low value of only {valPerMile}, which is {percent}% below the {benchmark} benchmark. You get better financial value by paying cash and saving your miles.'
    }
  };

  const vSource = tDict || defaultVerdicts;

  let vKey = 'poor';
  let badgeColor = 'bg-red-600 text-white';
  let isWorthIt = false;
  let percent = Math.abs(Math.round((valuationRatio - 1) * 100));

  if (netCashSaved <= 0) {
    vKey = 'worst';
    badgeColor = 'bg-rose-600 text-white';
    percent = -100;
  } else if (valuationRatio >= 1.50) {
    vKey = 'exceptional';
    badgeColor = 'bg-emerald-600 text-white';
    isWorthIt = true;
    percent = Math.round((valuationRatio - 1) * 100);
  } else if (valuationRatio >= 1.15) {
    vKey = 'great';
    badgeColor = 'bg-teal-600 text-white';
    isWorthIt = true;
    percent = Math.round((valuationRatio - 1) * 100);
  } else if (valuationRatio >= 0.90) {
    vKey = 'fair';
    badgeColor = 'bg-amber-500 text-white';
    isWorthIt = true;
    percent = Math.round((valuationRatio - 1) * 100);
  }

  const vInfo = vSource[vKey];
  const summaryFilled = vInfo.summary
    .replace('{valPerMile}', formatRate(valuePerMile))
    .replace('{benchmark}', formatRate(benchmark))
    .replace('{percent}', percent.toString());

  const verdict = {
    code: vKey.toUpperCase(),
    title: vInfo.title,
    badgeColor: badgeColor,
    actionText: vInfo.actionText,
    isWorthIt: isWorthIt,
    percentVsBenchmark: percent,
    summary: summaryFilled
  };

  return {
    isValid: true,
    cashPriceIdr: cash,
    taxesIdr: taxes,
    milesRequired: miles,
    netCashSaved: netCashSaved,
    valuePerMile: valuePerMile,
    benchmark: benchmark,
    programId: programId,
    programName: programName,
    programColor: programColor,
    valuationRatio: valuationRatio,
    breakevenCashPrice: breakevenCashPrice,
    netValueGainIdr: netValueGainIdr,
    verdict: verdict,
    lang: currentLang
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatIdr,
    formatNumber,
    formatRate,
    calculateValuation
  };
}
