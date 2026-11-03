/**
 * Airport Database & Popular Indonesian Travel Route Presets
 * Pre-filled with realistic Saver award miles & standard cash prices for Indonesia outbound.
 */

const AIRPORTS_DATABASE = [
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali / Denpasar', name: 'I Gusti Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International Airport', country: 'Indonesia' },
  { code: 'KNO', city: 'Medan', name: 'Kualanamu International Airport', country: 'Indonesia' },
  { code: 'JOG', city: 'Yogyakarta', name: 'Yogyakarta International Airport (YIA)', country: 'Indonesia' },
  { code: 'UPG', city: 'Makassar', name: 'Sultan Hasanuddin International Airport', country: 'Indonesia' },
  { code: 'HND', city: 'Tokyo (Haneda)', name: 'Tokyo Haneda Airport', country: 'Japan' },
  { code: 'NRT', city: 'Tokyo (Narita)', name: 'Narita International Airport', country: 'Japan' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai International Airport', country: 'Japan' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'BKK', city: 'Bangkok (Suvarnabhumi)', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'DMK', city: 'Bangkok (Don Mueang)', name: 'Don Mueang International Airport', country: 'Thailand' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan International Airport', country: 'Taiwan' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
  { code: 'LHR', city: 'London', name: 'London Heathrow Airport', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', name: 'Paris Charles de Gaulle Airport', country: 'France' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Schiphol Airport', country: 'Netherlands' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt am Main Airport', country: 'Germany' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States' },
  { code: 'JFK', city: 'New York (JFK)', name: 'John F. Kennedy International Airport', country: 'United States' }
];

const POPULAR_ROUTES = [
  {
    id: 'cgk-tyo',
    origin: 'CGK',
    destination: 'HND',
    title: 'Jakarta (CGK) ⇄ Tokyo (HND/NRT)',
    region: 'East Asia',
    tag: 'Most Popular',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 9500000,
        estimatedTaxesIdr: 950000,
        awards: {
          krisflyer: { miles: 27000, taxes: 850000, carrier: 'Singapore Airlines via SIN' },
          garudamiles: { miles: 35000, taxes: 1350000, carrier: 'Garuda Indonesia (Non-stop)' },
          asiamiles: { miles: 20000, taxes: 1100000, carrier: 'Cathay Pacific via HKG' },
          anamileage: { miles: 20000, taxes: 1750000, carrier: 'ANA (Non-stop / Star Alliance)' }
        }
      },
      business: {
        estimatedCashPriceIdr: 26500000,
        estimatedTaxesIdr: 1450000,
        awards: {
          krisflyer: { miles: 52000, taxes: 950000, carrier: 'Singapore Airlines (Saver)' },
          garudamiles: { miles: 45000, taxes: 1650000, carrier: 'Garuda Indonesia (Non-stop)' },
          asiamiles: { miles: 45000, taxes: 1400000, carrier: 'Cathay Pacific via HKG' },
          anamileage: { miles: 31500, taxes: 2150000, carrier: 'ANA (Round-trip allocated)' }
        }
      }
    }
  },
  {
    id: 'cgk-sin',
    origin: 'CGK',
    destination: 'SIN',
    title: 'Jakarta (CGK) ⇄ Singapore (SIN)',
    region: 'Southeast Asia',
    tag: 'Short Haul',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 2400000,
        estimatedTaxesIdr: 550000,
        awards: {
          krisflyer: { miles: 8500, taxes: 550000, carrier: 'Singapore Airlines' },
          garudamiles: { miles: 7000, taxes: 680000, carrier: 'Garuda Indonesia' },
          asiamiles: { miles: 10000, taxes: 650000, carrier: 'Partner / Malaysia Airlines' }
        }
      },
      business: {
        estimatedCashPriceIdr: 8800000,
        estimatedTaxesIdr: 650000,
        awards: {
          krisflyer: { miles: 21000, taxes: 650000, carrier: 'Singapore Airlines (Lie-flat A350/B787)' },
          garudamiles: { miles: 14000, taxes: 850000, carrier: 'Garuda Indonesia' }
        }
      }
    }
  },
  {
    id: 'cgk-hkg',
    origin: 'CGK',
    destination: 'HKG',
    title: 'Jakarta (CGK) ⇄ Hong Kong (HKG)',
    region: 'East Asia',
    tag: 'Asia Miles Sweet Spot',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 5800000,
        estimatedTaxesIdr: 800000,
        awards: {
          asiamiles: { miles: 12500, taxes: 800000, carrier: 'Cathay Pacific (Non-stop)' },
          garudamiles: { miles: 25000, taxes: 1100000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 16500, taxes: 850000, carrier: 'Singapore Airlines via SIN' }
        }
      },
      business: {
        estimatedCashPriceIdr: 18500000,
        estimatedTaxesIdr: 1150000,
        awards: {
          asiamiles: { miles: 32000, taxes: 950000, carrier: 'Cathay Pacific (Non-stop A350)' },
          garudamiles: { miles: 40000, taxes: 1350000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 36500, taxes: 950000, carrier: 'Singapore Airlines via SIN' }
        }
      }
    }
  },
  {
    id: 'cgk-icn',
    origin: 'CGK',
    destination: 'ICN',
    title: 'Jakarta (CGK) ⇄ Seoul (ICN)',
    region: 'East Asia',
    tag: 'Popular',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 8900000,
        estimatedTaxesIdr: 900000,
        awards: {
          krisflyer: { miles: 27000, taxes: 850000, carrier: 'Singapore Airlines via SIN' },
          garudamiles: { miles: 35000, taxes: 1250000, carrier: 'Garuda Indonesia (Non-stop)' },
          asiamiles: { miles: 20000, taxes: 1150000, carrier: 'Cathay Pacific via HKG' }
        }
      },
      business: {
        estimatedCashPriceIdr: 24500000,
        estimatedTaxesIdr: 1350000,
        awards: {
          krisflyer: { miles: 52000, taxes: 950000, carrier: 'Singapore Airlines' },
          garudamiles: { miles: 45000, taxes: 1550000, carrier: 'Garuda Indonesia (Non-stop A330)' },
          asiamiles: { miles: 45000, taxes: 1350000, carrier: 'Cathay Pacific via HKG' }
        }
      }
    }
  },
  {
    id: 'dps-syd',
    origin: 'DPS',
    destination: 'SYD',
    title: 'Bali (DPS) ⇄ Sydney (SYD)',
    region: 'Australia',
    tag: 'GarudaMiles Sweet Spot',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 7800000,
        estimatedTaxesIdr: 1200000,
        awards: {
          garudamiles: { miles: 30000, taxes: 1300000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 30500, taxes: 1100000, carrier: 'Singapore Airlines via SIN' }
        }
      },
      business: {
        estimatedCashPriceIdr: 25000000,
        estimatedTaxesIdr: 1600000,
        awards: {
          garudamiles: { miles: 40000, taxes: 1700000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 68500, taxes: 1400000, carrier: 'Singapore Airlines via SIN' }
        }
      }
    }
  },
  {
    id: 'cgk-lhr',
    origin: 'CGK',
    destination: 'LHR',
    title: 'Jakarta (CGK) ⇄ London (LHR)',
    region: 'Europe',
    tag: 'Long Haul Luxury',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 14500000,
        estimatedTaxesIdr: 3200000,
        awards: {
          krisflyer: { miles: 42000, taxes: 1850000, carrier: 'Singapore Airlines via SIN' },
          qataravios: { miles: 37500, taxes: 2600000, carrier: 'Qatar Airways via DOH' },
          asiamiles: { miles: 38000, taxes: 3100000, carrier: 'Cathay Pacific via HKG' },
          flyingblue: { miles: 40000, taxes: 3800000, carrier: 'Air France / KLM' }
        }
      },
      business: {
        estimatedCashPriceIdr: 58000000,
        estimatedTaxesIdr: 5500000,
        awards: {
          krisflyer: { miles: 103500, taxes: 2400000, carrier: 'Singapore Airlines (Saver)' },
          qataravios: { miles: 75000, taxes: 4800000, carrier: 'Qatar Airways (Qsuite)' },
          asiamiles: { miles: 84000, taxes: 4500000, carrier: 'Cathay Pacific via HKG' },
          flyingblue: { miles: 85000, taxes: 6200000, carrier: 'Air France / KLM' }
        }
      }
    }
  },
  {
    id: 'cgk-doh',
    origin: 'CGK',
    destination: 'DOH',
    title: 'Jakarta (CGK) ⇄ Doha (DOH)',
    region: 'Middle East',
    tag: 'Qsuite Experience',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 10500000,
        estimatedTaxesIdr: 1800000,
        awards: {
          qataravios: { miles: 25000, taxes: 1750000, carrier: 'Qatar Airways (Non-stop)' },
          garudamiles: { miles: 35000, taxes: 2100000, carrier: 'Garuda Indonesia (Non-stop)' }
        }
      },
      business: {
        estimatedCashPriceIdr: 39000000,
        estimatedTaxesIdr: 2900000,
        awards: {
          qataravios: { miles: 50000, taxes: 2850000, carrier: 'Qatar Airways (Qsuite Non-stop)' },
          garudamiles: { miles: 55000, taxes: 3400000, carrier: 'Garuda Indonesia (Non-stop)' }
        }
      }
    }
  },
  {
    id: 'cgk-bkk',
    origin: 'CGK',
    destination: 'BKK',
    title: 'Jakarta (CGK) ⇄ Bangkok (BKK)',
    region: 'Southeast Asia',
    tag: 'Regional Vacation',
    cabins: {
      economy: {
        estimatedCashPriceIdr: 3600000,
        estimatedTaxesIdr: 650000,
        awards: {
          garudamiles: { miles: 15000, taxes: 750000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 13500, taxes: 650000, carrier: 'Singapore Airlines via SIN' }
        }
      },
      business: {
        estimatedCashPriceIdr: 11500000,
        estimatedTaxesIdr: 850000,
        awards: {
          garudamiles: { miles: 28000, taxes: 950000, carrier: 'Garuda Indonesia (Non-stop)' },
          krisflyer: { miles: 24000, taxes: 850000, carrier: 'Singapore Airlines via SIN' }
        }
      }
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIRPORTS_DATABASE, POPULAR_ROUTES };
}
