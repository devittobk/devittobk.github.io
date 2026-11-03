/**
 * Frequent Flyer Loyalty Programs & Indonesian Baseline Benchmarks
 * Baselines reflect realistic valuations (in IDR per mile) recognized by Indonesian points enthusiasts (e.g. PinterPoin).
 */
const LOYALTY_PROGRAMS = {
  krisflyer: {
    id: 'krisflyer',
    name: 'Singapore Airlines KrisFlyer',
    shortName: 'KrisFlyer',
    airline: 'Singapore Airlines',
    alliance: 'Star Alliance',
    color: '#00266B',
    accentColor: '#FFB81C',
    defaultBenchmark: 160, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 144 IDR
      greatMultiplier: 1.15,    // 184 IDR
      exceptionalMultiplier: 1.5 // 240 IDR
    },
    description: 'The most popular program for Indonesian travelers with direct Singapore hub flights and great premium cabins.',
    transferableBanks: ['BCA', 'Danamon', 'CIMB Niaga', 'Mandiri', 'Maybank', 'HSBC', 'Permata', 'UOB'],
    taxProfile: 'Moderate (Singapore airport fees + departure levy, no fuel surcharges on SQ metal)',
    sweetSpots: ['Jakarta/Bali to Tokyo in Business (52k saver)', 'Jakarta to Europe in Business (103.5k saver)']
  },
  garudamiles: {
    id: 'garudamiles',
    name: 'Garuda Indonesia GarudaMiles',
    shortName: 'GarudaMiles',
    airline: 'Garuda Indonesia',
    alliance: 'SkyTeam',
    color: '#004A80',
    accentColor: '#0097D7',
    defaultBenchmark: 130, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 117 IDR
      greatMultiplier: 1.15,    // 150 IDR
      exceptionalMultiplier: 1.5 // 195 IDR
    },
    description: 'National flag carrier with frequent 30-50% redemption discount promotions (Redemption Fair) and non-stop flights from CGK/DPS.',
    transferableBanks: ['BCA', 'Mandiri', 'CIMB Niaga', 'Danamon', 'Maybank', 'BNI', 'Mega', 'Permata', 'UOB'],
    taxProfile: 'Low domestic taxes, but higher fuel surcharges on international flights',
    sweetSpots: ['Jakarta to Haneda Tokyo non-stop in Business', 'Bali to Sydney/Melbourne non-stop', 'Jakarta to Amsterdam']
  },
  asiamiles: {
    id: 'asiamiles',
    name: 'Cathay Pacific Asia Miles',
    shortName: 'Asia Miles',
    airline: 'Cathay Pacific',
    alliance: 'oneworld',
    color: '#006564',
    accentColor: '#C49A45',
    defaultBenchmark: 150, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 135 IDR
      greatMultiplier: 1.15,    // 173 IDR
      exceptionalMultiplier: 1.5 // 225 IDR
    },
    description: 'Premier oneworld program for flights via Hong Kong to Japan, North America, and Europe with competitive rates.',
    transferableBanks: ['BCA', 'Danamon', 'CIMB Niaga', 'Mandiri', 'Maybank', 'HSBC', 'UOB'],
    taxProfile: 'Includes Hong Kong airport taxes and moderate carrier surcharges',
    sweetSpots: ['Jakarta to Tokyo/Seoul via HKG in Business', 'Jakarta to North America in Business']
  },
  anamileage: {
    id: 'anamileage',
    name: 'All Nippon Airways (ANA) Mileage Club',
    shortName: 'ANA Mileage',
    airline: 'ANA',
    alliance: 'Star Alliance',
    color: '#0D2240',
    accentColor: '#009CD4',
    defaultBenchmark: 180, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 162 IDR
      greatMultiplier: 1.15,    // 207 IDR
      exceptionalMultiplier: 1.5 // 270 IDR
    },
    description: 'Known for ultra-cheap round-trip award chart (e.g. 35k-40k RT Economy to Japan, 60k RT Business), strictly round-trip only.',
    transferableBanks: ['BCA', 'CIMB Niaga'],
    taxProfile: 'Subject to ANA carrier fuel surcharges which can fluctuate',
    sweetSpots: ['Jakarta to Tokyo Round-Trip in Business (60k-63k miles)']
  },
  qataravios: {
    id: 'qataravios',
    name: 'Qatar Airways Privilege Club (Avios)',
    shortName: 'Qatar Avios',
    airline: 'Qatar Airways',
    alliance: 'oneworld',
    color: '#5C0632',
    accentColor: '#D3A158',
    defaultBenchmark: 160, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 144 IDR
      greatMultiplier: 1.15,    // 184 IDR
      exceptionalMultiplier: 1.5 // 240 IDR
    },
    description: 'Uses Avios currency (1:1 combinable with British Airways & Finnair). Outstanding Qsuite Business Class to Europe and USA.',
    transferableBanks: ['BCA', 'CIMB Niaga', 'Danamon', 'Maybank'],
    taxProfile: 'Standard Qatar segment booking fees (~$70-$140 per segment in Business)',
    sweetSpots: ['Jakarta to Doha/Europe in Qsuite Business Class (75k-80k Avios)']
  },
  flyingblue: {
    id: 'flyingblue',
    name: 'Air France-KLM Flying Blue',
    shortName: 'Flying Blue',
    airline: 'Air France / KLM',
    alliance: 'SkyTeam',
    color: '#052962',
    accentColor: '#E2001A',
    defaultBenchmark: 140, // IDR per mile
    thresholds: {
      fairMultiplier: 0.9,      // 126 IDR
      greatMultiplier: 1.15,    // 161 IDR
      exceptionalMultiplier: 1.5 // 210 IDR
    },
    description: 'Dynamic pricing model with monthly Promo Rewards discounts (25-50% off award tickets to Europe/North America).',
    transferableBanks: ['BCA', 'CIMB Niaga', 'Mandiri', 'Maybank'],
    taxProfile: 'Higher fuel surcharges out of European hubs (CDG/AMS)',
    sweetSpots: ['Jakarta/Bali to Amsterdam/Paris during Promo Rewards', 'Inter-island flights within SkyTeam']
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LOYALTY_PROGRAMS };
}
