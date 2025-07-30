const WebSocket = require('ws');
const EventEmitter = require('events');

class RithmicWebSocketProvider extends EventEmitter {
  constructor(config = {}) {
    super();
    this.name = 'rithmic_websocket';
    this.displayName = 'Rithmic WebSocket';
    this.type = 'core'; // Core provider - always available
    this.wsUrl = config.wsUrl || 'ws://localhost:8080'; // Local PC Rithmic connection
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.isConnected = false;
    this.ws = null;
    this.subscriptions = new Map();
    this.symbolCache = new Map();
    this.lastHeartbeat = Date.now();
    this.heartbeatInterval = null;
  }

  /**
   * Initialize connection to Rithmic WebSocket
   * @returns {Promise<boolean>} Connection success
   */
  async connect() {
    try {
      console.log(`🔌 Connecting to Rithmic WebSocket: ${this.wsUrl}`);
      
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('✅ Rithmic WebSocket connected');
        this.startHeartbeat();
        this.emit('connected');
        
        // Request symbol list on connection
        this.requestSymbolList();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        this.stopHeartbeat();
        console.log('❌ Rithmic WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.warn('⚠️ Rithmic WebSocket connection failed (this is expected if Rithmic is not running):', error.message);
        // Don't emit error to prevent crash - just log the warning
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to Rithmic WebSocket:', error);
      return false;
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Buffer|string} data - Incoming message data
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      this.lastHeartbeat = Date.now();
      
      switch (message.type) {
        case 'symbol_list':
          this.handleSymbolList(message.data);
          break;
        case 'quote':
          this.handleQuoteUpdate(message.data);
          break;
        case 'trade':
          this.handleTradeUpdate(message.data);
          break;
        case 'heartbeat':
          this.handleHeartbeat(message);
          break;
        case 'error':
          console.error('Rithmic error:', message.error);
          break;
        default:
          console.log('Unknown Rithmic message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing Rithmic message:', error);
    }
  }

  /**
   * Handle symbol list from Rithmic
   * @param {Array} symbols - Array of symbol objects
   */
  handleSymbolList(symbols) {
    console.log(`📋 Received ${symbols.length} symbols from Rithmic`);
    
    symbols.forEach(symbol => {
      const standardizedSymbol = {
        symbol: symbol.symbol,
        name: symbol.description || symbol.symbol,
        type: this.determineAssetType(symbol),
        exchange: symbol.exchange,
        provider: this.name,
        providerDisplayName: this.displayName,
        currency: symbol.currency || 'USD',
        market: symbol.market,
        category: this.categorizeSymbol(symbol),
        metadata: {
          tickSize: symbol.tickSize,
          pointValue: symbol.pointValue,
          contractSize: symbol.contractSize,
          expirationDate: symbol.expirationDate,
          isRithmic: true,
          isProfessional: true
        }
      };
      
      this.symbolCache.set(symbol.symbol, standardizedSymbol);
    });
    
    this.emit('symbolsUpdated', Array.from(this.symbolCache.values()));
  }

  /**
   * Handle quote updates from Rithmic
   * @param {Object} quote - Quote data
   */
  handleQuoteUpdate(quote) {
    const marketData = {
      symbol: quote.symbol,
      provider: this.name,
      timestamp: new Date().toISOString(),
      bid: quote.bid,
      ask: quote.ask,
      bidSize: quote.bidSize,
      askSize: quote.askSize,
      spread: quote.ask - quote.bid,
      lastPrice: quote.last,
      volume: quote.volume,
      openInterest: quote.openInterest
    };
    
    this.emit('marketData', marketData);
  }

  /**
   * Handle trade updates from Rithmic
   * @param {Object} trade - Trade data
   */
  handleTradeUpdate(trade) {
    const tradeData = {
      symbol: trade.symbol,
      provider: this.name,
      timestamp: new Date(trade.timestamp).toISOString(),
      price: trade.price,
      size: trade.size,
      side: trade.side, // 'buy' or 'sell'
      tradeId: trade.tradeId
    };
    
    this.emit('tradeData', tradeData);
  }

  /**
   * Search for symbols
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching symbols
   */
  async searchSymbols(query, limit = 10) {
    const symbols = Array.from(this.symbolCache.values());
    const searchQuery = query.toLowerCase();
    
    const matches = symbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(searchQuery) ||
      symbol.name.toLowerCase().includes(searchQuery)
    );
    
    return matches.slice(0, limit);
  }

  /**
   * Get popular futures symbols
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Array of popular symbols
   */
  async getPopularSymbols(category = 'futures') {
    const popularFutures = [
      'ESH25', 'ESM25', 'ESU25', 'ESZ25', // E-mini S&P 500
      'NQH25', 'NQM25', 'NQU25', 'NQZ25', // E-mini Nasdaq
      'RTY', 'YM',                        // Russell 2000, Dow
      'GCG25', 'GCJ25', 'GCM25',         // Gold futures
      'CLF25', 'CLG25', 'CLH25',         // Crude Oil
      'ZBH25', 'ZBM25', 'ZBU25'          // Treasury Bonds
    ];

    const results = [];
    for (const symbol of popularFutures) {
      const symbolData = this.symbolCache.get(symbol);
      if (symbolData) {
        results.push(symbolData);
      }
    }
    
    return results.slice(0, limit);
  }

  /**
   * Subscribe to real-time data for a symbol
   * @param {string} symbol - Symbol to subscribe to
   * @returns {boolean} Subscription success
   */
  subscribeToSymbol(symbol) {
    if (!this.isConnected) {
      console.warn('Cannot subscribe - Rithmic WebSocket not connected');
      return false;
    }

    const subscribeMessage = {
      type: 'subscribe',
      symbol: symbol,
      dataTypes: ['quote', 'trade']
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    this.subscriptions.set(symbol, true);
    console.log(`📈 Subscribed to Rithmic data for ${symbol}`);
    return true;
  }

  /**
   * Unsubscribe from real-time data for a symbol
   * @param {string} symbol - Symbol to unsubscribe from
   * @returns {boolean} Unsubscription success
   */
  unsubscribeFromSymbol(symbol) {
    if (!this.isConnected) {
      return false;
    }

    const unsubscribeMessage = {
      type: 'unsubscribe',
      symbol: symbol
    };

    this.ws.send(JSON.stringify(unsubscribeMessage));
    this.subscriptions.delete(symbol);
    console.log(`📉 Unsubscribed from Rithmic data for ${symbol}`);
    return true;
  }

  /**
   * Determine asset type for Rithmic symbols
   * @param {Object} symbol - Symbol object from Rithmic
   * @returns {string} Asset type
   */
  determineAssetType(symbol) {
    const { productType, exchange } = symbol;
    
    if (productType === 'FUTURE') return 'future';
    if (productType === 'OPTION') return 'option';
    if (exchange === 'CME' || exchange === 'CBOT' || exchange === 'NYMEX') return 'future';
    
    return 'future'; // Default for Rithmic
  }

  /**
   * Categorize Rithmic symbols
   * @param {Object} symbol - Symbol object
   * @returns {string} Category
   */
  categorizeSymbol(symbol) {
    const { symbol: sym, productGroup } = symbol;
    
    if (productGroup) return productGroup;
    
    // Pattern-based categorization
    if (sym.startsWith('ES') || sym.startsWith('NQ') || sym.startsWith('YM')) {
      return 'Index Futures';
    }
    if (sym.startsWith('GC') || sym.startsWith('SI')) {
      return 'Metals';
    }
    if (sym.startsWith('CL') || sym.startsWith('NG')) {
      return 'Energy';
    }
    if (sym.startsWith('ZB') || sym.startsWith('ZN')) {
      return 'Interest Rates';
    }
    
    return 'Futures';
  }

  /**
   * Request symbol list from Rithmic
   */
  requestSymbolList() {
    if (!this.isConnected) return;
    
    const request = {
      type: 'get_symbols',
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(request));
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        
        // Check if we haven't received data recently
        if (Date.now() - this.lastHeartbeat > 30000) {
          console.warn('No heartbeat from Rithmic - connection may be stale');
        }
      }
    }, 10000);
  }

  /**
   * Stop heartbeat mechanism
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle heartbeat response
   * @param {Object} message - Heartbeat message
   */
  handleHeartbeat(message) {
    // Connection is alive
    this.lastHeartbeat = Date.now();
  }

  /**
   * Attempt to reconnect to Rithmic
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached for Rithmic');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect to Rithmic (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Test provider connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      if (this.isConnected) {
        return {
          success: true,
          provider: this.name,
          message: 'Rithmic WebSocket connection active',
          symbolsAvailable: this.symbolCache.size,
          subscriptions: this.subscriptions.size
        };
      } else {
        const connected = await this.connect();
        return {
          success: connected,
          provider: this.name,
          message: connected ? 'Rithmic WebSocket connected successfully' : 'Failed to connect to Rithmic WebSocket',
          symbolsAvailable: this.symbolCache.size
        };
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        message: `Rithmic connection error: ${error.message}`,
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
      historicalData: true,
      tradingExecution: true, // Future capability
      categories: ['futures', 'options'],
      rateLimitMs: 0, // No rate limit for WebSocket
      isCore: true,
      requiresAuth: false,
      isProfessional: true,
      supportsSubscriptions: true
    };
  }

  /**
   * Disconnect from Rithmic
   */
  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    console.log('Disconnected from Rithmic WebSocket');
  }
}

module.exports = RithmicWebSocketProvider; 