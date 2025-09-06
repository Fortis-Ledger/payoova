import axios from 'axios';

export interface CryptoPriceData {
  [currency: string]: {
    usd: number;
    usd_24h_change: number;
    market_cap: number;
    volume_24h: number;
  };
}

export class PriceService {
  private static readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  private static priceCache: { data: CryptoPriceData; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static currencyMapping: Record<string, string> = {
    'ETH': 'ethereum',
    'MATIC': 'matic-network',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'BTC': 'bitcoin',
  };

  static async getPrices(currencies: string[] = ['ETH', 'MATIC', 'USDC', 'USDT']): Promise<CryptoPriceData> {
    // Check cache
    if (this.priceCache && Date.now() - this.priceCache.timestamp < this.CACHE_DURATION) {
      return this.priceCache.data;
    }

    try {
      // Map currency symbols to CoinGecko IDs
      const coinGeckoIds = currencies
        .map(currency => this.currencyMapping[currency])
        .filter(Boolean);

      if (coinGeckoIds.length === 0) {
        throw new Error('No valid currencies provided');
      }

      const response = await axios.get(`${this.COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: coinGeckoIds.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true,
        },
        timeout: 10000,
      });

      // Transform response to use currency symbols as keys
      const priceData: CryptoPriceData = {};
      
      for (const [symbol, geckoId] of Object.entries(this.currencyMapping)) {
        if (response.data[geckoId]) {
          priceData[symbol] = {
            usd: response.data[geckoId].usd,
            usd_24h_change: response.data[geckoId].usd_24h_change || 0,
            market_cap: response.data[geckoId].usd_market_cap || 0,
            volume_24h: response.data[geckoId].usd_24h_vol || 0,
          };
        }
      }

      // Cache the result
      this.priceCache = {
        data: priceData,
        timestamp: Date.now(),
      };

      return priceData;
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
      
      // Return cached data if available, otherwise empty object
      if (this.priceCache) {
        return this.priceCache.data;
      }
      
      throw new Error('Failed to fetch crypto prices and no cached data available');
    }
  }

  static async getPrice(currency: string): Promise<number> {
    const prices = await this.getPrices([currency]);
    const priceData = prices[currency];
    
    if (!priceData) {
      throw new Error(`Price not available for currency: ${currency}`);
    }
    
    return priceData.usd;
  }

  static calculatePortfolioValue(balances: Array<{ currency: string; balance: string }>, prices: CryptoPriceData): number {
    return balances.reduce((total, balance) => {
      const price = prices[balance.currency]?.usd || 0;
      const amount = parseFloat(balance.balance) || 0;
      return total + (amount * price);
    }, 0);
  }
}
