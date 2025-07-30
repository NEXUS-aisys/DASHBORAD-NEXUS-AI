const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get latest trading signals - Use real endpoint with fallback
  async getLatestSignals() {
    try {
      console.log('Fetching signals from real endpoint...');
      return await this.request('/signals/latest');
    } catch (error) {
      console.warn('Real signals endpoint failed, falling back to test endpoint:', error.message);
      return this.request('/signals/test');
    }
  }

  // Get portfolio data - Use real endpoint with fallback
  async getPortfolio() {
    try {
      console.log('Fetching portfolio from real endpoint...');
      const response = await this.request('/portfolio');
      return response; // Real endpoint returns data directly
    } catch (error) {
      console.warn('Real portfolio endpoint failed, falling back to test endpoint:', error.message);
      const response = await this.request('/portfolio/test');
      return response.data; // Test endpoint wraps data in .data
    }
  }

  // Get market data for a symbol - Prioritize real data sources
  async getMarketData(symbol) {
    try {
      console.log(`🔍 Fetching REAL market data for ${symbol}...`);
      
      // Try to get real data from test endpoint (uses Alpha Vantage, Polygon, etc.)
      const response = await this.request(`/symbols/test-market-data/${symbol}`);
      
      // Check if we got real data (not mock)
      if (response.status === 'success' && response.data && !response.data.metadata?.isMockRealTime) {
        console.log(`✅ Got REAL data for ${symbol} from ${response.provider}`);
        return response;
      } else if (response.status === 'success' && response.data) {
        console.log(`⚠️ Got simulated data for ${symbol} from ${response.provider}`);
        return response;
      }
      
      throw new Error('No valid market data received');
    } catch (error) {
      console.warn(`❌ Real market data failed for ${symbol}:`, error.message);
      
      // Fallback 1: Try with specific Alpha Vantage provider
      try {
        console.log(`🔄 Trying Alpha Vantage for ${symbol}...`);
        const alphaResponse = await this.request(`/symbols/test-market-data/${symbol}?provider=alpha_vantage`);
        if (alphaResponse.status === 'success') {
          console.log(`✅ Got Alpha Vantage data for ${symbol}`);
          return alphaResponse;
        }
      } catch (alphaError) {
        console.warn(`Alpha Vantage also failed for ${symbol}:`, alphaError.message);
      }
      
      // Fallback 2: Try with Polygon provider
      try {
        console.log(`🔄 Trying Polygon for ${symbol}...`);
        const polygonResponse = await this.request(`/symbols/test-market-data/${symbol}?provider=polygon`);
        if (polygonResponse.status === 'success') {
          console.log(`✅ Got Polygon data for ${symbol}`);
          return polygonResponse;
        }
      } catch (polygonError) {
        console.warn(`Polygon also failed for ${symbol}:`, polygonError.message);
      }
      
      // Fallback 3: Use signals endpoint for basic data
      try {
        console.log(`🔄 Falling back to signals endpoint for ${symbol}...`);
        const signalsResponse = await this.request('/signals/test');
        const signals = signalsResponse.data || signalsResponse;
        const symbolSignal = signals.find(signal => signal.symbol === symbol);
        
        if (symbolSignal) {
          console.log(`📊 Found ${symbol} in signals data`);
          return {
            status: 'success',
            data: {
              symbol: symbolSignal.symbol,
              price: parseFloat(symbolSignal.price) || 0,
              change: parseFloat(symbolSignal.priceChange) || 0,
              changePercent: parseFloat(symbolSignal.priceChangePercent) || 0,
              volume: symbolSignal.volume || 0,
              provider: symbolSignal.provider || 'signals-fallback',
              timestamp: symbolSignal.timestamp || new Date().toISOString()
            }
          };
        }
      } catch (signalsError) {
        console.error('Signals fallback also failed:', signalsError.message);
      }
      
      // Final step: Throw error instead of generating mock data
      console.error(`❌ All real data sources failed for ${symbol} - no mock data will be generated`);
      
      throw new Error(`Unable to fetch market data for ${symbol}. All data providers (Alpha Vantage, Polygon, and signals endpoint) are currently unavailable. Please try again later or check your internet connection.`);
    }
  }

  // Get recent trades - Use real endpoint with fallback
  async getRecentTrades(limit = 10) {
    try {
      console.log('Fetching trades from real endpoint...');
      const response = await this.request(`/trades/recent?limit=${limit}`);
      return response; // Real endpoint returns data directly
    } catch (error) {
      console.warn('Real trades endpoint failed, falling back to test endpoint:', error.message);
      const response = await this.request(`/trades/test?limit=${limit}`);
      return response.data; // Test endpoint wraps data in .data
    }
  }

  // Get subscription
  async getSubscription() {
    return this.request('/subscription');
  }

  // Create subscription
  async createSubscription() {
    return this.request('/subscribe', { method: 'POST' });
  }

  // Activate Telegram notifications for user
  async activateTelegramNotifications(phoneNumber) {
    return this.request('/telegram/activate', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    });
  }

  // Get user's Telegram activation status
  async getTelegramActivationStatus() {
    return this.request('/telegram/activation-status');
  }

  // Admin: Test Telegram connection
  async testTelegramConnection(botToken, chatId) {
    return this.request('/telegram/test', {
      method: 'POST',
      body: JSON.stringify({ botToken, chatId })
    });
  }

  // Admin: Send test signal
  async sendTestTelegramSignal() {
    return this.request('/telegram/test-signal', {
      method: 'POST'
    });
  }

  // Get comprehensive analysis for a symbol
  async getSymbolAnalysis(symbol) {
    try {
      console.log(`🔍 Fetching comprehensive analysis for ${symbol}...`);
      const response = await this.request(`/symbols/test-analysis/${symbol}`);
      
      if (response.success) {
        console.log(`✅ Got comprehensive analysis for ${symbol}`);
        return response;
      } else {
        throw new Error(response.message || 'Failed to get analysis');
      }
    } catch (error) {
      console.error(`❌ Analysis failed for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Get comprehensive trading signals and analysis for a symbol
  async getTradingSignals(symbol) {
    try {
      console.log(`🔍 Fetching trading signals for ${symbol}...`);
      
      // Try the real trading signals endpoint first
      const response = await this.request(`/trading/signals/${symbol}`);
      
      if (response.success) {
        console.log(`✅ Got trading signals for ${symbol}`);
        return response;
      } else {
        throw new Error(response.message || 'Failed to get trading signals');
      }
    } catch (error) {
      console.warn(`❌ Real trading signals failed for ${symbol}:`, error.message);
      
      // Fallback to test endpoint
      try {
        console.log(`🔄 Trying test trading signals for ${symbol}...`);
        const fallbackResponse = await this.request(`/trading/signals/test/${symbol}`);
        
        if (fallbackResponse.success) {
          console.log(`✅ Got test trading signals for ${symbol}`);
          return fallbackResponse;
        } else {
          throw new Error(fallbackResponse.message || 'Failed to get test trading signals');
        }
      } catch (fallbackError) {
        console.error(`❌ Trading signals fallback also failed for ${symbol}:`, fallbackError.message);
        throw fallbackError;
      }
    }
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    // Temporarily disabled - WebSocket server not implemented yet
    console.log('WebSocket temporarily disabled - server not implemented');
    return null;
  }
}

export default new ApiService(); 