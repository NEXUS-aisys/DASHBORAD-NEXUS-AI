import apiClient from '../utils/api.js';

class TradingService {
  // Get portfolio data
  async getPortfolio() {
    try {
      return await apiClient.get('/api/trading/portfolio');
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw error;
    }
  }

  // Get trading history
  async getTradingHistory(filters = {}) {
    try {
      return await apiClient.get('/api/trading/history', filters);
    } catch (error) {
      console.error('Failed to fetch trading history:', error);
      throw error;
    }
  }

  // Execute a trade
  async executeTrade(tradeData) {
    try {
      return await apiClient.post('/api/trading/execute', tradeData);
    } catch (error) {
      console.error('Failed to execute trade:', error);
      throw error;
    }
  }

  // Get market data
  async getMarketData(symbol, timeframe = '1D') {
    try {
      return await apiClient.get(`/api/trading/market/${symbol}`, { timeframe });
    } catch (error) {
      console.error(`Failed to fetch market data for ${symbol}:`, error);
      throw error;
    }
  }

  // Get AI trading recommendations
  async getAIRecommendations(portfolioData = {}) {
    try {
      return await apiClient.post('/api/trading/ai-recommendations', portfolioData);
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
      throw error;
    }
  }

  // Get trading analytics
  async getAnalytics(period = '30d') {
    try {
      return await apiClient.get('/api/trading/analytics', { period });
    } catch (error) {
      console.error('Failed to fetch trading analytics:', error);
      throw error;
    }
  }

  // Get watchlist
  async getWatchlist() {
    try {
      return await apiClient.get('/api/trading/watchlist');
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
      throw error;
    }
  }

  // Add symbol to watchlist
  async addToWatchlist(symbol) {
    try {
      return await apiClient.post('/api/trading/watchlist', { symbol });
    } catch (error) {
      console.error(`Failed to add ${symbol} to watchlist:`, error);
      throw error;
    }
  }

  // Remove symbol from watchlist
  async removeFromWatchlist(symbol) {
    try {
      return await apiClient.delete(`/api/trading/watchlist/${symbol}`);
    } catch (error) {
      console.error(`Failed to remove ${symbol} from watchlist:`, error);
      throw error;
    }
  }

  // Get risk assessment
  async getRiskAssessment(portfolioData) {
    try {
      return await apiClient.post('/api/trading/risk-assessment', portfolioData);
    } catch (error) {
      console.error('Failed to get risk assessment:', error);
      throw error;
    }
  }

  // Get trading signals
  async getTradingSignals(symbols = []) {
    try {
      return await apiClient.post('/api/trading/signals', { symbols });
    } catch (error) {
      console.error('Failed to fetch trading signals:', error);
      throw error;
    }
  }

  // Save trading journal entry
  async saveJournalEntry(entryData) {
    try {
      return await apiClient.post('/api/trading/journal', entryData);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      throw error;
    }
  }

  // Get trading journal entries
  async getJournalEntries(filters = {}) {
    try {
      return await apiClient.get('/api/trading/journal', filters);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
      throw error;
    }
  }

  // Update trading journal entry
  async updateJournalEntry(entryId, entryData) {
    try {
      return await apiClient.put(`/api/trading/journal/${entryId}`, entryData);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    }
  }

  // Delete trading journal entry
  async deleteJournalEntry(entryId) {
    try {
      return await apiClient.delete(`/api/trading/journal/${entryId}`);
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const tradingService = new TradingService();
export default tradingService;
