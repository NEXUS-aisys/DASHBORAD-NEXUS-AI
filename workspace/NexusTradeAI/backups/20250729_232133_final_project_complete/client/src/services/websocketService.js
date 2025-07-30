class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    // Temporarily disabled - WebSocket server not implemented yet
    console.log('✅ WebSocket temporarily disabled - server not implemented');
        this.isConnected = false;
    return null; // Return null to indicate WebSocket is disabled
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  subscribeToAllData() {
    if (!this.isConnected) return;

    // Subscribe to all strategy data
    const strategies = [
      'cumulative-delta',
      'liquidation-detection', 
      'momentum-breakout',
      'delta-divergence',
      'hvn-rejection',
      'liquidity-absorption',
      'liquidity-traps',
      'iceberg-detection',
      'stop-run-anticipation',
      'lvn-breakout',
      'volume-imbalance'
    ];

    // Subscribe to ML model data
    const mlModels = [
      'lstm',
      'transformer',
      'cnn1d',
      'catboost',
      'lightgbm',
      'xgboost',
      'tabnet',
      'volatility-hybrid',
      'uncertainty',
      'regime-detector',
      'ensemble-meta',
      'autoencoder',
      'bayesian-risk'
    ];

    // Subscribe to all data types
    const subscriptions = [
      ...strategies.map(strategy => ({ type: 'strategy', name: strategy })),
      ...mlModels.map(model => ({ type: 'ml', name: model })),
      { type: 'market-data', name: 'general' },
      { type: 'volume-data', name: 'general' },
      { type: 'price-data', name: 'general' }
    ];

    subscriptions.forEach(sub => {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        dataType: sub.type,
        name: sub.name
      }));
    });
  }

  handleMessage(data) {
    const { type, strategy, mlModel, marketData, volumeData, priceData, timestamp } = data;

    switch (type) {
      case 'strategy_data':
        this.notifySubscribers('strategy', strategy, data);
        break;
      
      case 'ml_data':
        this.notifySubscribers('ml', mlModel, data);
        break;
      
      case 'market_data':
        this.notifySubscribers('market', 'general', data);
        break;
      
      case 'volume_data':
        this.notifySubscribers('volume', 'general', data);
        break;
      
      case 'price_data':
        this.notifySubscribers('price', 'general', data);
        break;
      
      default:
        console.log('Unknown message type:', type);
    }
  }

  subscribe(dataType, name, callback) {
    const key = `${dataType}-${name}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  notifySubscribers(dataType, name, data) {
    const key = `${dataType}-${name}`;
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 