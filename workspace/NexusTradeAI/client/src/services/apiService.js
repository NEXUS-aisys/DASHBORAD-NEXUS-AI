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

  // Get latest trading signals
  async getLatestSignals() {
    // Use test endpoint for development (no auth required)
    console.log('Fetching signals from test endpoint...');
    return this.request('/signals/test');
  }

  // Get portfolio data
  async getPortfolio() {
    // Use test endpoint for development (no auth required)
    console.log('Fetching portfolio from test endpoint...');
    const response = await this.request('/portfolio/test');
    return response.data; // Extract data from test response
  }

  // Get market data for a symbol
  async getMarketData(symbol) {
    return this.request(`/market/${symbol}`);
  }

  // Get recent trades
  async getRecentTrades(limit = 10) {
    // Use test endpoint for development (no auth required)
    console.log('Fetching trades from test endpoint...');
    const response = await this.request(`/trades/test?limit=${limit}`);
    return response.data; // Extract data from test response
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

  // WebSocket connection for real-time updates
  connectWebSocket() {
    // Temporarily disabled - WebSocket server not implemented yet
    console.log('WebSocket temporarily disabled - server not implemented');
    return null;
  }
}

export default new ApiService(); 