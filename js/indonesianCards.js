/**
 * Indonesian Travel Credit Cards Database & Miles Earning Calculator
 * Includes domestic & overseas spending rates, points/miles expiry policy, personal credit limits,
 * bank points transfer ratios, and supports user editing / custom card overrides.
 */

const INDONESIAN_CARDS = [
  {
    id: 'bca-kf-infinite',
    bank: 'BCA',
    name: 'BCA Singapore Airlines KrisFlyer Visa Infinite',
    shortName: 'BCA SQ Infinite',
    tier: 'Top Tier / Luxury',
    badgeColor: 'bg-blue-900 text-yellow-400 border-yellow-500',
    supportedPrograms: ['krisflyer'],
    pointsCurrency: 'Direct KrisFlyer Miles',
    pointsToMilesRatio: '1 : 1 (Direct)',
    spendingPerMile: 8000,
    domesticSpendPerMile: 8000,
    overseasSpendPerMile: 8000,
    expiryPolicy: 'Auto-credited (3 years validity in KrisFlyer)',
    creditLimitIdr: 100000000, // Rp 100M default
    annualFee: 'Rp 1.000.000 (Waivable with spend)',
    pros: 'Direct auto-credit, no transfer fee or minimum transfer batch, excellent customer service.',
    categoryNotes: 'Best all-around card for Singapore Airlines loyalty.'
  },
  {
    id: 'bca-kf-signature',
    bank: 'BCA',
    name: 'BCA Singapore Airlines KrisFlyer Visa Signature',
    shortName: 'BCA SQ Signature',
    tier: 'Mid-High Tier',
    badgeColor: 'bg-slate-800 text-slate-100 border-slate-600',
    supportedPrograms: ['krisflyer'],
    pointsCurrency: 'Direct KrisFlyer Miles',
    pointsToMilesRatio: '1 : 1 (Direct)',
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 10000,
    expiryPolicy: 'Auto-credited (3 years validity in KrisFlyer)',
    creditLimitIdr: 50000000, // Rp 50M default
    annualFee: 'Rp 500.000 (Waivable)',
    pros: 'Low qualification barrier, direct KrisFlyer auto-credit.',
    categoryNotes: 'Solid daily entry-level card for Singapore Airlines.'
  },
  {
    id: 'bca-unionpay',
    bank: 'BCA',
    name: 'BCA UnionPay Platinum',
    shortName: 'BCA UnionPay',
    tier: 'Mid Tier Travel',
    badgeColor: 'bg-teal-900 text-teal-200 border-teal-500',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'anamileage', 'qataravios'],
    pointsCurrency: 'Reward BCA (Rp)',
    pointsToMilesRatio: 'Rp 100 Reward BCA = ~25 Miles',
    pointsPerMile: 4,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 8000, // 20% bonus in Asian hubs
    expiryPolicy: 'Never Expires (Non-expiring Reward BCA)',
    creditLimitIdr: 40000000,
    annualFee: 'Rp 250.000 (Waivable)',
    pros: '20% bonus reward points in Asian hubs (Singapore, Hong Kong, Macau, China, Japan), no FX surcharge on UnionPay network.',
    categoryNotes: 'Outstanding companion card for East Asia and Greater China travel.'
  },
  {
    id: 'uob-privi-miles',
    bank: 'UOB',
    name: 'UOB PRIVI Miles',
    shortName: 'UOB PRIVI Miles',
    tier: 'Top Tier Travel',
    badgeColor: 'bg-blue-950 text-sky-300 border-sky-400',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles'],
    pointsCurrency: 'PRIVI Miles',
    pointsToMilesRatio: '1 PRIVI Mile = 1 Airline Mile',
    pointsPerMile: 1,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 5000, // 2x miles overseas
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 75000000,
    annualFee: 'Rp 1.000.000 (Waivable with spend)',
    pros: 'Industry standard 1:1 transfer ratio, 2x miles on international spend (Rp 5,000/mile), free airport lounge access.',
    categoryNotes: 'One of the most widely held travel cards by Indonesian frequent flyers.'
  },
  {
    id: 'uob-preferred-plat',
    bank: 'UOB',
    name: 'UOB Preferred Platinum',
    shortName: 'UOB Preferred Plat',
    tier: 'Mid Tier Lifestyle',
    badgeColor: 'bg-slate-800 text-amber-300 border-amber-500',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles'],
    pointsCurrency: 'UOB Reward Points',
    pointsToMilesRatio: '10 UOB Points = 1 Mile',
    pointsPerMile: 10,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 6667, // 3x multiplier
    effectiveEarnRates: {
      domestic: 10000,
      dining: 6667,
      overseas: 6667
    },
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 40000000,
    annualFee: 'Rp 600.000 (Waivable)',
    pros: '3x points multiplier on dining and overseas spend, solid entry path to UOB miles.',
    categoryNotes: 'Accessible lifestyle card with accelerated dining multipliers.'
  },
  {
    id: 'dbs-travel-plat',
    bank: 'DBS',
    name: 'DBS Travel Visa Platinum',
    shortName: 'DBS Travel Platinum',
    tier: 'Top Tier Travel',
    badgeColor: 'bg-red-950 text-red-200 border-red-600',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios'],
    pointsCurrency: 'DBS Points',
    pointsToMilesRatio: '1 DBS Point = 1 Airline Mile',
    pointsPerMile: 1,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 5000, // 2 DBS points per Rp 10k
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 60000000,
    annualFee: 'Rp 750.000 (Waivable)',
    pros: 'Direct 1:1 transfer to 4 major airlines (KrisFlyer, Garuda, Cathay, Qatar), blistering Rp 5,000/mile overseas earn rate.',
    categoryNotes: 'High-value overseas spending powerhouse with four airline transfer options.'
  },
  {
    id: 'dbs-travel-sig',
    bank: 'DBS',
    name: 'DBS Travel Visa Signature / Digibank Black',
    shortName: 'DBS Travel Signature',
    tier: 'Luxury / Priority',
    badgeColor: 'bg-neutral-950 text-red-400 border-red-500',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios'],
    pointsCurrency: 'DBS Points',
    pointsToMilesRatio: '1 DBS Point = 1 Airline Mile',
    pointsPerMile: 1,
    spendingPerMile: 8000,
    domesticSpendPerMile: 8000,
    overseasSpendPerMile: 4000, // 2.5 DBS points per Rp 10k
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 120000000,
    annualFee: 'Rp 1.500.000',
    pros: 'Enhanced earning rate of Rp 4,000/mile overseas, luxury airport transfer perks.',
    categoryNotes: 'Premium tier for high-spend international jetsetters.'
  },
  {
    id: 'cimb-jcb-ultimate',
    bank: 'CIMB Niaga',
    name: 'CIMB Niaga JCB Ultimate',
    shortName: 'CIMB JCB Ultimate',
    tier: 'Top Tier Travel / Dining',
    badgeColor: 'bg-red-800 text-red-100 border-red-500',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios', 'flyingblue'],
    pointsCurrency: 'Poin Xtra',
    pointsToMilesRatio: '33 Poin Xtra = 1 Mile',
    pointsPerMile: 33,
    spendingPerMile: 5000,
    domesticSpendPerMile: 15000, // General domestic is 3x
    overseasSpendPerMile: 5000,  // Japan / dining 9x
    effectiveEarnRates: {
      domestic: 15000,
      dining: 5000,
      overseas: 5000
    },
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 80000000,
    annualFee: 'Rp 3.000.000 (Waivable with spend)',
    pros: 'Unmatched 9x multiplier on dining and transactions in Japan (Rp 5,000/mile). Supports multiple programs.',
    categoryNotes: 'The king of dining & Japan holiday spending in Indonesia.'
  },
  {
    id: 'cimb-visa-infinite',
    bank: 'CIMB Niaga',
    name: 'CIMB Niaga Visa Infinite',
    shortName: 'CIMB Visa Infinite',
    tier: 'Top Tier General',
    badgeColor: 'bg-zinc-900 text-zinc-100 border-zinc-500',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios', 'flyingblue'],
    pointsCurrency: 'Poin Xtra',
    pointsToMilesRatio: '33 Poin Xtra = 1 Mile',
    pointsPerMile: 33,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 5000, // Double Poin Xtra overseas
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 100000000,
    annualFee: 'Rp 1.500.000 (Free for Preferred clients)',
    pros: 'Free for CIMB Preferred clients, excellent overseas spending rate, 5 international airline partners.',
    categoryNotes: 'Great everyday card with zero annual fee for priority banking.'
  },
  {
    id: 'danamon-world-elite',
    bank: 'Danamon',
    name: 'Danamon Mastercard World Elite',
    shortName: 'Danamon World Elite',
    tier: 'Ultra Luxury / Private Banking',
    badgeColor: 'bg-neutral-950 text-amber-300 border-amber-400',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios'],
    pointsCurrency: 'D-Point',
    pointsToMilesRatio: '10 D-Point = 1 Mile',
    pointsPerMile: 10,
    spendingPerMile: 6250,
    domesticSpendPerMile: 6250,
    overseasSpendPerMile: 3125, // Double D-Points overseas
    expiryPolicy: '3 Years (36 Months)',
    creditLimitIdr: 250000000, // High tier
    annualFee: 'Rp 5.000.000',
    pros: 'Industry-leading earn rates for ultra-affluent spenders, high credit limits, airport perks.',
    categoryNotes: 'Elite tier with blistering miles accumulation rates.'
  },
  {
    id: 'danamon-jcb-precious',
    bank: 'Danamon',
    name: 'Danamon JCB Precious',
    shortName: 'Danamon JCB Precious',
    tier: 'Mid Tier',
    badgeColor: 'bg-blue-700 text-blue-100 border-blue-400',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles'],
    pointsCurrency: 'D-Point',
    pointsToMilesRatio: '20 D-Point = 1 Mile',
    pointsPerMile: 20,
    spendingPerMile: 10000,
    domesticSpendPerMile: 10000,
    overseasSpendPerMile: 10000,
    expiryPolicy: '3 Years (36 Months)',
    creditLimitIdr: 50000000,
    annualFee: 'Rp 500.000 (Waivable)',
    pros: 'Accessible requirement, complimentary airport lounge access in Japan and Southeast Asia.',
    categoryNotes: 'Very popular starter card for Japan travelers.'
  },
  {
    id: 'mandiri-prioritas',
    bank: 'Bank Mandiri',
    name: 'Mandiri Prioritas / World Elite',
    shortName: 'Mandiri Prioritas',
    tier: 'High Tier Priority',
    badgeColor: 'bg-sky-900 text-sky-200 border-sky-400',
    supportedPrograms: ['garudamiles', 'krisflyer', 'asiamiles', 'flyingblue'],
    pointsCurrency: 'Livin\' Poin',
    pointsToMilesRatio: '3 Livin\' Poin = 1 Mile',
    pointsPerMile: 3,
    spendingPerMile: 8333,
    domesticSpendPerMile: 8333,
    overseasSpendPerMile: 8333,
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 100000000,
    annualFee: 'Free for Mandiri Prioritas clients',
    pros: 'Direct Livin\' app redemption, high monthly bonus campaigns, frequent GarudaMiles discount promos.',
    categoryNotes: 'Prime card for Garuda Indonesia frequent flyers.'
  },
  {
    id: 'maybank-bmw-mini',
    bank: 'Maybank',
    name: 'Maybank Visa Infinite (BMW / Mini)',
    shortName: 'Maybank BMW / Mini',
    tier: 'Top Tier Travel',
    badgeColor: 'bg-yellow-600 text-slate-900 border-yellow-300',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'qataravios', 'flyingblue'],
    pointsCurrency: 'TREATS Points',
    pointsToMilesRatio: '35 TREATS Points = 1 Mile',
    pointsPerMile: 35,
    spendingPerMile: 7500,
    domesticSpendPerMile: 7500,
    overseasSpendPerMile: 5000,
    expiryPolicy: '2 Years (24 Months)',
    creditLimitIdr: 80000000,
    annualFee: 'Rp 1.500.000 (Waivable)',
    pros: 'Super versatile: transfers to 5 major airlines, excellent domestic & overseas earning rate.',
    categoryNotes: 'One of the best flexible points cards in Indonesia.'
  },
  {
    id: 'bca-card-platinum',
    bank: 'BCA',
    name: 'BCA Everyday / Card Platinum',
    shortName: 'BCA Card Platinum',
    tier: 'General Banking',
    badgeColor: 'bg-indigo-900 text-indigo-100 border-indigo-400',
    supportedPrograms: ['krisflyer', 'garudamiles', 'asiamiles', 'anamileage', 'qataravios'],
    pointsCurrency: 'Reward BCA (Rp)',
    pointsToMilesRatio: 'Rp 100 Reward BCA = ~25 Miles',
    pointsPerMile: 4,
    spendingPerMile: 12500,
    domesticSpendPerMile: 12500,
    overseasSpendPerMile: 10000,
    expiryPolicy: 'Never Expires (Non-expiring Reward BCA)',
    creditLimitIdr: 30000000,
    annualFee: 'Rp 250.000',
    pros: 'Reward BCA does not expire as long as card remains active. Universal transfer option.',
    categoryNotes: 'Safe non-expiring points storage with BCA.'
  }
];

/**
 * Returns all available cards: built-in catalog (with user overrides applied) + user-created custom cards.
 */
function getAllAvailableCards() {
  const overrides = (typeof getCardOverrides === 'function') ? getCardOverrides() : {};
  let customCards = (typeof getCustomCards === 'function') ? getCustomCards() : [];

  // Merge built-in cards with any user modifications
  const mergedBuiltin = INDONESIAN_CARDS.map(card => {
    if (overrides[card.id]) {
      return {
        ...card,
        ...overrides[card.id],
        isOverridden: true
      };
    }
    return { ...card, isOverridden: false };
  });

  return [...mergedBuiltin, ...customCards];
}

/**
 * Calculates credit card metrics for a required number of airline miles.
 */
function calculateCreditCardMetrics(miles, cardId, category = 'default') {
  const allCards = getAllAvailableCards();
  const card = allCards.find(c => c.id === cardId);
  if (!card) return null;

  // Determine spend rate based on category
  let spendPerMile = card.domesticSpendPerMile || card.spendingPerMile;
  if (category === 'overseas') {
    spendPerMile = card.overseasSpendPerMile || card.domesticSpendPerMile || card.spendingPerMile;
  } else if (category === 'dining') {
    if (card.effectiveEarnRates && card.effectiveEarnRates.dining) {
      spendPerMile = card.effectiveEarnRates.dining;
    } else {
      spendPerMile = card.domesticSpendPerMile || card.spendingPerMile;
    }
  }

  const estimatedTotalSpendIdr = miles * spendPerMile;

  let bankPointsRequired = null;
  if (card.pointsPerMile) {
    bankPointsRequired = miles * card.pointsPerMile;
  }

  // Credit Limit turnover feasibility factor
  let creditLimitTurnover = null;
  const creditLimit = Number(card.creditLimitIdr) || 0;
  if (creditLimit > 0) {
    creditLimitTurnover = (estimatedTotalSpendIdr / creditLimit).toFixed(1);
  }

  return {
    card,
    milesRequired: miles,
    spendCategory: category,
    spendPerMileIdr: spendPerMile,
    domesticSpendPerMile: card.domesticSpendPerMile || card.spendingPerMile,
    overseasSpendPerMile: card.overseasSpendPerMile || card.spendingPerMile,
    estimatedTotalSpendIdr: estimatedTotalSpendIdr,
    bankPointsRequired: bankPointsRequired,
    pointsCurrency: card.pointsCurrency || 'Points',
    pointsToMilesRatio: card.pointsToMilesRatio || '1 : 1',
    expiryPolicy: card.expiryPolicy || '2 Years (24 Months)',
    creditLimitIdr: creditLimit,
    creditLimitTurnover: creditLimitTurnover
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INDONESIAN_CARDS,
    getAllAvailableCards,
    calculateCreditCardMetrics
  };
}
