const axios = require('axios');

class YahooFinanceProvider {
  constructor() {
    this.name = 'yahoo_finance';
    this.displayName = 'Yahoo Finance';
    this.type = 'core'; // Core provider - always available
    this.baseUrl = 'https://query1.finance.yahoo.com/v1/finance';
    this.rateLimitMs = 1000; // 1 request per second
    this.lastRequestTime = 0;
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
      
      const searchUrl = `${this.baseUrl}/search`;
      const response = await axios.get(searchUrl, {
        params: {
          q: query,
          quotesCount: limit,
          newsCount: 0,
          enableFuzzyQuery: false,
          quotesQueryId: 'tss_match_phrase_query',
          multiQuoteQueryId: 'multi_quote_single_token_query'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const quotes = response.data?.quotes || [];
      
      return quotes.map(quote => ({
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
      
      const quoteUrl = `${this.baseUrl}/quote`;
      const response = await axios.get(quoteUrl, {
        params: {
          symbols: symbol,
          fields: 'regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketTime,regularMarketVolume,regularMarketDayHigh,regularMarketDayLow,regularMarketOpen,regularMarketPreviousClose'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const quote = response.data?.quoteSummary?.result?.[0]?.price || response.data?.quoteResponse?.result?.[0];
      
      if (!quote) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      return {
        symbol: symbol,
        provider: this.name,
        timestamp: new Date().toISOString(),
        price: quote.regularMarketPrice?.raw || quote.regularMarketPrice,
        change: quote.regularMarketChange?.raw || quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent?.raw || quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume?.raw || quote.regularMarketVolume,
        dayHigh: quote.regularMarketDayHigh?.raw || quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow?.raw || quote.regularMarketDayLow,
        open: quote.regularMarketOpen?.raw || quote.regularMarketOpen,
        previousClose: quote.regularMarketPreviousClose?.raw || quote.regularMarketPreviousClose,
        marketTime: quote.regularMarketTime?.raw ? new Date(quote.regularMarketTime.raw * 1000).toISOString() : new Date().toISOString()
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
   * @returns {Object} Provider capabilities
   */
  getCapabilities() {
    return {
      symbolSearch: true,
      realTimeData: true,
      historicalData: false, // Can be added later
      tradingExecution: false,
      categories: ['stocks', 'crypto', 'indices', 'futures', 'forex', 'options'],
      rateLimitMs: this.rateLimitMs,
      isCore: true,
      requiresAuth: false
    };
  }
}

module.exports = YahooFinanceProvider; 