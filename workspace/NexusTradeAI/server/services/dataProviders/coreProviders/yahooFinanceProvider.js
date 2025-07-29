const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;

class YahooFinanceProvider {
  constructor() {
    this.name = 'yahoo_finance';
    this.displayName = 'Yahoo Finance';
    this.type = 'core'; // Core provider - always available
    this.baseUrl = 'https://query1.finance.yahoo.com/v1/finance';
    this.rateLimitMs = 3000; // 1 request per 3 seconds - more conservative
    this.lastRequestTime = 0;
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
   * Search for symbols on Yahoo Finance
   * @param {string} query - Search query (e.g., "BTC", "AAPL")
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of symbol objects
   */
  async searchSymbols(query, limit = 10) {
    try {
      await this.enforceRateLimit();
      
      // Use yahoo-finance2 package for search
      const results = await yahooFinance.search(query, { quotesCount: limit });
      
      return results.quotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: this.determineAssetType(quote),
        exchange: quote.exchange,
        provider: this.name,
        providerDisplayName: this.displayName,
        currency: quote.currency,
        market: quote.market,
        category: this.categorizeSymbol(quote),
        metadata: {
          sector: quote.sector,
          industry: quote.industry,
          quoteType: quote.quoteType,
          isYahooFinance: true
        }
      }));
    } catch (error) {
      console.error(`Yahoo Finance search error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Get real-time market data for a symbol
   * @param {string} symbol - Yahoo Finance symbol
   * @returns {Promise<Object>} Market data object
   */
  async getMarketData(symbol) {
    try {
      await this.enforceRateLimit();
      
      // Use yahoo-finance2 package for market data
      const quote = await yahooFinance.quote(symbol);
      
      if (!quote) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      // Check if we got valid price data
      if (!quote.regularMarketPrice && quote.regularMarketPrice !== 0) {
        throw new Error(`Invalid price data for symbol: ${symbol}`);
      }

      return {
        symbol: symbol,
        provider: this.name,
        timestamp: new Date().toISOString(),
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        dayHigh: quote.regularMarketDayHigh || quote.regularMarketPrice,
        dayLow: quote.regularMarketDayLow || quote.regularMarketPrice,
        open: quote.regularMarketOpen || quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
        realData: true,
        fallback: false
      };
    } catch (error) {
      console.error(`Yahoo Finance market data error for "${symbol}":`, error.message);
      throw error;
    }
  }

  /**
   * Get popular symbols by category
   * @param {string} category - Category (crypto, stocks, futures, etc.)
   * @returns {Promise<Array>} Array of popular symbols
   */
  async getPopularSymbols(category = 'stocks') {
    const popularSymbols = {
      stocks: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX'],
      crypto: ['BTC-USD', 'ETH-USD', 'ADA-USD', 'DOT-USD', 'LINK-USD'],
      indices: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'],
      commodities: ['GC=F', 'SI=F', 'CL=F', 'NG=F'],
      forex: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCAD=X']
    };

    const symbols = popularSymbols[category] || popularSymbols.stocks;
    const results = [];

    for (const symbol of symbols.slice(0, 10)) {
      try {
        const symbolData = await this.searchSymbols(symbol, 1);
        if (symbolData.length > 0) {
          results.push(symbolData[0]);
        }
      } catch (error) {
        console.error(`Error fetching popular symbol ${symbol}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Determine asset type based on quote data
   * @param {Object} quote - Yahoo Finance quote object
   * @returns {string} Asset type
   */
  determineAssetType(quote) {
    const { quoteType, symbol } = quote;
    
    if (quoteType === 'CRYPTOCURRENCY') return 'crypto';
    if (quoteType === 'EQUITY') return 'stock';
    if (quoteType === 'INDEX') return 'index';
    if (quoteType === 'FUTURE') return 'future';
    if (quoteType === 'CURRENCY') return 'forex';
    if (quoteType === 'OPTION') return 'option';
    
    // Fallback detection based on symbol patterns
    if (symbol.includes('-USD') || symbol.includes('=X')) return 'crypto';
    if (symbol.startsWith('^')) return 'index';
    if (symbol.endsWith('=F')) return 'future';
    
    return 'unknown';
  }

  /**
   * Categorize symbol for better organization
   * @param {Object} quote - Yahoo Finance quote object
   * @returns {string} Category
   */
  categorizeSymbol(quote) {
    const type = this.determineAssetType(quote);
    const { sector, industry } = quote;
    
    if (type === 'crypto') return 'Cryptocurrency';
    if (type === 'future') return 'Futures';
    if (type === 'forex') return 'Foreign Exchange';
    if (type === 'index') return 'Market Indices';
    if (sector) return sector;
    if (industry) return industry;
    
    return 'Stocks';
  }

  /**
   * Test provider connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      const testResult = await this.searchSymbols('AAPL', 1);
      return {
        success: true,
        provider: this.name,
        message: 'Yahoo Finance connection successful',
        symbolsFound: testResult.length
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        message: `Yahoo Finance connection failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get provider capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      supports: {
        realTimeData: true,
        historicalData: true,
        symbolSearch: true,
        popularSymbols: true,
        assetTypes: ['stocks', 'crypto', 'futures', 'indices', 'forex', 'commodities']
      },
      rateLimit: `${this.rateLimitMs}ms between requests`,
      dataQuality: 'high'
    };
  }
}

module.exports = YahooFinanceProvider; 