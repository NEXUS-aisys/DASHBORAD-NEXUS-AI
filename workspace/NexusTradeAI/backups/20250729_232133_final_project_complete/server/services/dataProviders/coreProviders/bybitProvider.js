const axios = require('axios');

class BybitProvider {
  constructor() {
    this.name = 'bybit';
    this.displayName = 'Bybit';
    this.type = 'core';
    this.baseUrl = 'https://api.bybit.com/v5';
    this.rateLimitMs = 500; // 2 requests per second
    this.lastRequestTime = 0;
    this.symbolsCache = null;
    this.lastSymbolsUpdate = 0;
    this.symbolsCacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Search for crypto symbols on Bybit
   * @param {string} query - Search query (e.g., "BTC", "ETH")
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of symbol objects
   */
  async searchSymbols(query, limit = 10) {
    try {
      await this.enforceRateLimit();
      
      // Get all available symbols first
      const allSymbols = await this.getAllSymbols();
      
      // Filter symbols based on query
      const filteredSymbols = allSymbols
        .filter(symbol => 
          symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
          symbol.baseCoin.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);

      return filteredSymbols.map(symbol => ({
        symbol: symbol.symbol,
        name: `${symbol.baseCoin}/${symbol.quoteCoin}`,
        type: 'crypto',
        exchange: 'BYBIT',
        provider: this.name,
        providerDisplayName: this.displayName,
        category: 'Cryptocurrency',
        metadata: {
          baseCoin: symbol.baseCoin,
          quoteCoin: symbol.quoteCoin,
          status: symbol.status,
          isBybit: true
        }
      }));
    } catch (error) {
      console.error(`Bybit search error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Get real-time market data for a crypto symbol
   * @param {string} symbol - Bybit symbol (e.g., "BTCUSDT")
   * @returns {Promise<Object>} Market data object
   */
  async getMarketData(symbol) {
    try {
      await this.enforceRateLimit();
      
      // Use the public ticker endpoint
      const tickerUrl = `${this.baseUrl}/market/tickers`;
      console.log(`🔍 Bybit: Fetching data for ${symbol} from ${tickerUrl}`);
      
      const tickerResponse = await axios.get(tickerUrl, {
        params: {
          category: 'spot',
          symbol: symbol
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      console.log(`✅ Bybit: Response status ${tickerResponse.status} for ${symbol}`);
      const tickerData = tickerResponse.data?.result?.list?.[0];
      
      if (!tickerData) {
        throw new Error(`No ticker data found for symbol: ${symbol}`);
      }

      const currentPrice = parseFloat(tickerData.lastPrice);
      const previousClose = parseFloat(tickerData.prevPrice24h) || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      console.log(`📊 Bybit: ${symbol} price: ${currentPrice}, change: ${change}`);

      return {
        symbol: symbol,
        provider: this.name,
        timestamp: new Date().toISOString(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: parseFloat(tickerData.volume24h),
        dayHigh: parseFloat(tickerData.highPrice24h),
        dayLow: parseFloat(tickerData.lowPrice24h),
        open: parseFloat(tickerData.openPrice24h),
        previousClose: previousClose,
        marketCap: null, // Not available from Bybit
        metadata: {
          baseCoin: tickerData.baseCoin,
          quoteCoin: tickerData.quoteCoin,
          status: tickerData.status,
          isBybit: true
        }
      };
    } catch (error) {
      console.error(`Bybit market data error for ${symbol}:`, error.message);
      console.error(`Bybit error details:`, error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get all available symbols from Bybit
   * @returns {Promise<Array>} Array of all symbols
   */
  async getAllSymbols() {
    // Check cache first
    if (this.symbolsCache && Date.now() - this.lastSymbolsUpdate < this.symbolsCacheExpiry) {
      return this.symbolsCache;
    }

    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/market/instruments-info`, {
        params: {
          category: 'spot',
          status: 'Trading'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const symbols = response.data?.result?.list || [];
      
      // Cache the results
      this.symbolsCache = symbols;
      this.lastSymbolsUpdate = Date.now();
      
      return symbols;
    } catch (error) {
      console.error('Bybit symbols fetch error:', error.message);
      // Return cached data if available, even if expired
      return this.symbolsCache || [];
    }
  }

  /**
   * Get popular crypto symbols
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Array of popular symbols
   */
  async getPopularSymbols(category = 'crypto') {
    try {
      const allSymbols = await this.getAllSymbols();
      
      // Filter for major crypto pairs
      const majorPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT'];
      
      return allSymbols
        .filter(symbol => majorPairs.includes(symbol.symbol))
        .map(symbol => ({
          symbol: symbol.symbol,
          name: `${symbol.baseCoin}/${symbol.quoteCoin}`,
          type: 'crypto',
          exchange: 'BYBIT',
          provider: this.name,
          providerDisplayName: this.displayName,
          category: 'Cryptocurrency',
          metadata: {
            baseCoin: symbol.baseCoin,
            quoteCoin: symbol.quoteCoin,
            status: symbol.status,
            isBybit: true
          }
        }));
    } catch (error) {
      console.error('Bybit popular symbols error:', error.message);
      return [];
    }
  }

  /**
   * Enforce rate limiting
   * @private
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitMs) {
      const delay = this.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Test connection to Bybit API
   * @returns {Promise<boolean>} Connection success
   */
  async testConnection() {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/market/time`, {
        timeout: 5000
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Bybit connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get provider capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      search: true,
      marketData: true,
      realTime: true,
      categories: ['crypto', 'Cryptocurrency'],
      exchanges: ['BYBIT'],
      rateLimit: `${this.rateLimitMs}ms`,
      features: ['spot_trading', 'futures_trading', 'options_trading']
    };
  }
}

module.exports = BybitProvider; 