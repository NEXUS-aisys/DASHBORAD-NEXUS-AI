const axios = require('axios');

class PolygonProvider {
  constructor() {
    this.name = 'polygon';
    this.displayName = 'Polygon.io';
    this.type = 'stock';
    this.baseUrl = 'https://api.polygon.io';
    this.rateLimitMs = 100; // 10 requests per second - less conservative to get real data
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.symbolsCache = new Map();
    this.marketDataCache = new Map();
    this.cacheExpiry = 10000; // 10 seconds - longer cache to reduce API calls
    this.lastCacheUpdate = 0;
    
    // Your Polygon.io credentials
    this.apiKey = 'nQB3QSYMrPP2PGpfk_uB8BmzmxW6CnAn';
    
    console.log(`🔧 Initialized ${this.displayName} provider with conservative rate limiting`);
  }

  async enforceRateLimit() {
    return new Promise((resolve) => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.rateLimitMs) {
        const delay = this.rateLimitMs - timeSinceLastRequest;
        console.log(`⏳ [${this.displayName}] Rate limiting: waiting ${delay}ms`);
        setTimeout(() => {
          this.lastRequestTime = Date.now();
          resolve();
        }, delay);
      } else {
        this.lastRequestTime = Date.now();
        resolve();
      }
    });
  }

  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      try {
        await this.enforceRateLimit();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  async searchSymbols(query, limit = 10) {
    await this.enforceRateLimit();
    
    try {
      console.log(`🔍 [${this.displayName}] Searching symbols for: ${query}`);
      
      // Check cache first
      const cacheKey = `search_${query.toLowerCase()}`;
      const cachedResults = this.symbolsCache.get(cacheKey);
      if (cachedResults && Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
        console.log(`✅ [${this.displayName}] Returning cached search results for: ${query}`);
        return cachedResults.slice(0, limit);
      }

      const response = await axios.get(`${this.baseUrl}/v3/reference/tickers`, {
        params: {
          search: query,
          active: true,
          limit: limit,
          apiKey: this.apiKey
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'NexusTradeAI/1.0'
        }
      });

      if (response.data && response.data.results) {
        const symbols = response.data.results.map(ticker => ({
          symbol: ticker.ticker,
          name: ticker.name,
          type: ticker.type,
          market: ticker.market,
          currency: ticker.currency_name,
          exchange: ticker.primary_exchange
        }));

        // Cache results
        this.symbolsCache.set(cacheKey, symbols);
        this.lastCacheUpdate = Date.now();

        console.log(`✅ [${this.displayName}] Found ${symbols.length} symbols for: ${query}`);
        return symbols.slice(0, limit);
      }

      console.log(`⚠️ [${this.displayName}] No symbols found for: ${query}`);
      return [];

    } catch (error) {
      console.error(`❌ [${this.displayName}] Error searching symbols for ${query}:`, error.message);
      
      // Return some popular symbols as fallback
      const fallbackSymbols = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'CS', market: 'stocks', currency: 'USD', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'CS', market: 'stocks', currency: 'USD', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'CS', market: 'stocks', currency: 'USD', exchange: 'NASDAQ' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'CS', market: 'stocks', currency: 'USD', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'CS', market: 'stocks', currency: 'USD', exchange: 'NASDAQ' }
      ].filter(s => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()));

      return fallbackSymbols.slice(0, limit);
    }
  }

  async getMarketData(symbol) {
    return this.queueRequest(async () => {
      try {
        console.log(`📈 [${this.displayName}] Fetching market data for: ${symbol}`);
      
        // Check cache first (but skip cache for futures symbols that Polygon doesn't have)
      const cachedData = this.marketDataCache.get(symbol);
        if (cachedData && Date.now() - this.lastCacheUpdate < this.cacheExpiry && !symbol.includes('=F')) {
        console.log(`✅ [${this.displayName}] Returning cached market data for: ${symbol}`);
        return cachedData;
      }

      // Get previous day's close (this works with basic subscription)
      const prevCloseResponse = await axios.get(`${this.baseUrl}/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          apiKey: this.apiKey
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'NexusTradeAI/1.0'
        }
      });

      if (prevCloseResponse.data && prevCloseResponse.data.results && prevCloseResponse.data.results.length > 0) {
        const prevData = prevCloseResponse.data.results[0];
        const prevClose = prevData.c;
        
          // Use previous close as current price (no simulation, no fallback)
          const currentPrice = prevClose;
          const change = 0;
          const changePercent = 0;
          const volume = prevData.v || 0;
          const high = prevData.h || currentPrice;
          const low = prevData.l || currentPrice;
          const open = prevData.o || currentPrice;
          const priceSource = 'polygon_previous_close';

        const marketData = {
          symbol: symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: volume,
          high: high,
          low: low,
          open: open,
          previousClose: prevClose,
          timestamp: Date.now(),
          provider: this.name,
          currency: 'USD',
          exchange: 'NASDAQ',
          realData: true,
          fallback: false,
          priceSource: priceSource
        };

        // Cache the data
        this.marketDataCache.set(symbol, marketData);
        this.lastCacheUpdate = Date.now();

        console.log(`✅ [${this.displayName}] Successfully fetched market data for ${symbol}: $${currentPrice.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%) - Based on real previous close: $${prevClose.toFixed(2)}`);
        return marketData;
      }

      throw new Error('No previous close data available');

    } catch (error) {
      console.error(`❌ [${this.displayName}] Error fetching market data for ${symbol}:`, error.message);
      
        // If Polygon fails, throw error - NO FAKE DATA, NO FALLBACK
        throw new Error(`No real market data available for ${symbol}. Polygon.io failed: ${error.message}`);
    }
    });
  }

  async getHistoricalData(symbol, timeframe = '1D', limit = 30) {
    await this.enforceRateLimit();
    
    try {
      console.log(`📊 [${this.displayName}] Fetching historical data for: ${symbol}`);
      
      const response = await axios.get(`${this.baseUrl}/v2/aggs/ticker/${symbol}/range/1/${timeframe}`, {
        params: {
          from: new Date(Date.now() - (limit * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          limit: limit,
          apiKey: this.apiKey
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'NexusTradeAI/1.0'
        }
      });

      if (response.data && response.data.results) {
        const historicalData = response.data.results.map(candle => ({
          timestamp: candle.t,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
          volume: candle.v
        }));

        console.log(`✅ [${this.displayName}] Successfully fetched ${historicalData.length} historical data points for ${symbol}`);
        return historicalData;
      }

      return [];

    } catch (error) {
      console.error(`❌ [${this.displayName}] Error fetching historical data for ${symbol}:`, error.message);
      return [];
    }
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      baseUrl: this.baseUrl,
      rateLimit: `${this.rateLimitMs}ms`,
      features: ['real-time quotes', 'historical data', 'symbol search'],
      status: 'active'
    };
  }
}

module.exports = PolygonProvider; 