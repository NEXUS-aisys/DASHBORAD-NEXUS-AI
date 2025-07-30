// ML Bot Service - Connects to Local Bot for Real-time Data
class MLBotService {
  constructor() {
    this.baseUrl = 'http://localhost:5000'; // Local Bot API
    this.wsUrl = 'ws://localhost:5001'; // WebSocket for real-time updates
    this.isConnected = false;
    this.ws = null;
    this.callbacks = new Map();
  }

  // Connect to Local Bot WebSocket
  connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('Connected to Local Bot WebSocket');
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleBotMessage(data);
        } catch (error) {
          console.error('Error parsing bot message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Local Bot WebSocket');
        this.isConnected = false;
        // Reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Failed to connect to Local Bot:', error);
    }
  }

  // Handle incoming bot messages
  handleBotMessage(data) {
    const { type, model, payload } = data;
    
    switch (type) {
      case 'model_prediction':
        this.notifyCallbacks('prediction', { model, ...payload });
        break;
      case 'model_metrics':
        this.notifyCallbacks('metrics', { model, ...payload });
        break;
      case 'model_status':
        this.notifyCallbacks('status', { model, ...payload });
        break;
      case 'training_progress':
        this.notifyCallbacks('training', { model, ...payload });
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  // Register callback for specific event
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  // Notify all callbacks for an event
  notifyCallbacks(event, data) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Get model predictions from Local Bot
  async getModelPrediction(modelName, symbol) {
    try {
      const response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          symbol: symbol,
          timeframe: '1h'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error getting prediction for ${modelName}:`, error);
      return null;
    }
  }

  // Get model metrics from Local Bot
  async getModelMetrics(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/api/metrics/${modelName}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error getting metrics for ${modelName}:`, error);
      return null;
    }
  }

  // Get model status from Local Bot
  async getModelStatus(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/api/status/${modelName}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error getting status for ${modelName}:`, error);
      return null;
    }
  }

  // Train model with Local Bot
  async trainModel(modelName, parameters = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          parameters: parameters
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error training ${modelName}:`, error);
      return null;
    }
  }

  // Get available symbols from Local Bot
  async getAvailableSymbols() {
    try {
      const response = await fetch(`${this.baseUrl}/api/symbols`);
      
      if (response.ok) {
        const data = await response.json();
        return data.symbols || [];
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error getting available symbols:', error);
      return [];
    }
  }

  // Get real-time market data from Local Bot
  async getMarketData(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}/api/market/${symbol}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error getting market data for ${symbol}:`, error);
      return null;
    }
  }

  // Send command to Local Bot
  async sendCommand(command, parameters = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          parameters: parameters
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error sending command ${command}:`, error);
      return null;
    }
  }

  // Check if Local Bot is available
  async checkBotStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking bot status:', error);
      return false;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// Create singleton instance
const mlBotService = new MLBotService();

// Auto-connect when service is imported
mlBotService.connectWebSocket();

export default mlBotService; 