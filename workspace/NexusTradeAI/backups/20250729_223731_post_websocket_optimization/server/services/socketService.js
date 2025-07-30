const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisCache = require('./redisCache');
const DataSourceManager = require('./dataSourceManager');

class SocketService {
  constructor() {
    this.io = null;
    this.redisAdapter = null;
    this.dataSourceManager = null;
    this.isInitialized = false;
    this.connectedUsers = new Map();
    this.subscriptions = new Map(); // Track symbol subscriptions
    this.updateIntervals = new Map(); // Track active update intervals
  }

  /**
   * Initialize Socket.IO server with Redis adapter
   * @param {Object} httpServer - HTTP server instance
   * @param {DataSourceManager} dataSourceManager - Data source manager instance
   */
  async initialize(httpServer, dataSourceManager) {
    try {
      console.log('🚀 Initializing Socket.IO service...');
      
      this.dataSourceManager = dataSourceManager;
      
      // Initialize Socket.IO server
      this.io = new Server(httpServer, {
        cors: {
          origin: process.env.CLIENT_URL || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['polling', 'websocket'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e6, // 1MB
        allowRequest: (req, callback) => {
          // Optional: Add authentication logic here
          callback(null, true);
        }
      });

      // Setup Redis adapter for clustering
      try {
        const redisClient = redisCache.getClient();
        if (redisClient) {
          // Create a second Redis client for pub/sub
          const pubClient = redisClient.duplicate();
          const subClient = redisClient.duplicate();
          
          await pubClient.connect();
          await subClient.connect();
          
          this.io.adapter(createAdapter(pubClient, subClient));
          console.log('✅ Socket.IO Redis adapter configured for clustering');
        } else {
          console.log('⚠️ Redis not available, using in-memory Socket.IO adapter');
        }
      } catch (redisError) {
        console.warn('⚠️ Redis adapter setup failed, using in-memory adapter:', redisError.message);
      }

      // Setup connection handlers
      this.setupConnectionHandlers();
      
      // Start real-time data broadcasting
      this.startRealTimeUpdates();
      
      this.isInitialized = true;
      console.log('✅ Socket.IO service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Socket.IO service:', error);
      return false;
    }
  }

  /**
   * Setup Socket.IO connection handlers
   */
  setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.id, {
        id: socket.id,
        connectedAt: Date.now(),
        subscriptions: new Set(),
        userId: null,
        ipAddress: socket.request.connection.remoteAddress
      });

      // Handle user authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle symbol subscriptions
      socket.on('subscribe:symbols', (symbols) => {
        this.handleSymbolSubscription(socket, symbols);
      });

      // Handle unsubscribe
      socket.on('unsubscribe:symbols', (symbols) => {
        this.handleSymbolUnsubscription(socket, symbols);
      });

      // Handle trading signals subscription
      socket.on('subscribe:signals', () => {
        this.handleSignalsSubscription(socket);
      });

      // Handle portfolio updates subscription
      socket.on('subscribe:portfolio', (userId) => {
        this.handlePortfolioSubscription(socket, userId);
      });

      // Handle market status subscription
      socket.on('subscribe:market-status', () => {
        this.handleMarketStatusSubscription(socket);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });

      // Send initial connection success
      socket.emit('connected', {
        socketId: socket.id,
        timestamp: Date.now(),
        serverInfo: {
          version: '2.0.0',
          clustering: true,
          redis: redisCache.isConnected
        }
      });
    });

    // Handle adapter errors
    this.io.on('error', (error) => {
      console.error('Socket.IO server error:', error);
    });
  }

  /**
   * Handle user authentication
   */
  handleAuthentication(socket, data) {
    try {
      const { userId, token } = data;
      
      // TODO: Implement actual JWT verification
      // For now, accept all connections
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        user.userId = userId;
        user.authenticated = true;
        
        // Join user-specific room
        socket.join(`user:${userId}`);
        
        console.log(`🔐 User ${userId} authenticated on socket ${socket.id}`);
        socket.emit('authentication:success', { userId, authenticated: true });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authentication:error', { message: 'Authentication failed' });
    }
  }

  /**
   * Handle symbol subscription
   */
  handleSymbolSubscription(socket, symbols) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      symbols.forEach(symbol => {
        // Add to user's subscriptions
        user.subscriptions.add(symbol);
        
        // Join symbol-specific room
        socket.join(`symbol:${symbol}`);
        
        // Track global subscriptions
        if (!this.subscriptions.has(symbol)) {
          this.subscriptions.set(symbol, new Set());
        }
        this.subscriptions.get(symbol).add(socket.id);
      });

      console.log(`📊 User ${socket.id} subscribed to: ${symbols.join(', ')}`);
      socket.emit('subscription:success', { symbols, type: 'symbols' });
      
      // Send immediate data for subscribed symbols
      this.sendImmediateMarketData(socket, symbols);
      
    } catch (error) {
      console.error('Symbol subscription error:', error);
      socket.emit('subscription:error', { message: 'Subscription failed' });
    }
  }

  /**
   * Handle symbol unsubscription
   */
  handleSymbolUnsubscription(socket, symbols) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      symbols.forEach(symbol => {
        // Remove from user's subscriptions
        user.subscriptions.delete(symbol);
        
        // Leave symbol-specific room
        socket.leave(`symbol:${symbol}`);
        
        // Update global subscriptions
        if (this.subscriptions.has(symbol)) {
          this.subscriptions.get(symbol).delete(socket.id);
          if (this.subscriptions.get(symbol).size === 0) {
            this.subscriptions.delete(symbol);
          }
        }
      });

      console.log(`📊 User ${socket.id} unsubscribed from: ${symbols.join(', ')}`);
      socket.emit('unsubscription:success', { symbols, type: 'symbols' });
      
    } catch (error) {
      console.error('Symbol unsubscription error:', error);
    }
  }

  /**
   * Handle trading signals subscription
   */
  handleSignalsSubscription(socket) {
    socket.join('signals');
    console.log(`📈 User ${socket.id} subscribed to trading signals`);
    socket.emit('subscription:success', { type: 'signals' });
  }

  /**
   * Handle portfolio subscription
   */
  handlePortfolioSubscription(socket, userId) {
    if (userId) {
      socket.join(`portfolio:${userId}`);
      console.log(`💼 User ${socket.id} subscribed to portfolio for user ${userId}`);
      socket.emit('subscription:success', { type: 'portfolio', userId });
    }
  }

  /**
   * Handle market status subscription
   */
  handleMarketStatusSubscription(socket) {
    socket.join('market-status');
    console.log(`🏛️ User ${socket.id} subscribed to market status`);
    socket.emit('subscription:success', { type: 'market-status' });
  }

  /**
   * Send immediate market data for subscribed symbols
   */
  async sendImmediateMarketData(socket, symbols) {
    try {
      for (const symbol of symbols) {
        const marketData = await this.dataSourceManager.getMarketData(symbol);
        if (marketData.status === 'success') {
          socket.emit('market-data', {
            symbol,
            data: marketData.data,
            provider: marketData.provider,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Error sending immediate market data:', error);
    }
  }

  /**
   * Handle user disconnection
   */
  handleDisconnection(socket, reason) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      // Clean up subscriptions
      user.subscriptions.forEach(symbol => {
        if (this.subscriptions.has(symbol)) {
          this.subscriptions.get(symbol).delete(socket.id);
          if (this.subscriptions.get(symbol).size === 0) {
            this.subscriptions.delete(symbol);
          }
        }
      });
      
      // Remove user
      this.connectedUsers.delete(socket.id);
      
      console.log(`👤 User disconnected: ${socket.id} (${reason})`);
    }
  }

  /**
   * Start real-time market data updates
   */
  startRealTimeUpdates() {
    // Update subscribed symbols every 5 seconds
    const marketDataInterval = setInterval(async () => {
      await this.broadcastMarketDataUpdates();
    }, 5000);
    
    // Update trading signals every 10 seconds
    const signalsInterval = setInterval(async () => {
      await this.broadcastTradingSignals();
    }, 10000);
    
    // Update market status every 30 seconds
    const statusInterval = setInterval(async () => {
      await this.broadcastMarketStatus();
    }, 30000);
    
    this.updateIntervals.set('marketData', marketDataInterval);
    this.updateIntervals.set('signals', signalsInterval);
    this.updateIntervals.set('status', statusInterval);
    
    console.log('⏰ Started real-time update intervals');
  }

  /**
   * Broadcast market data updates to subscribed users
   */
  async broadcastMarketDataUpdates() {
    try {
      const symbols = Array.from(this.subscriptions.keys());
      if (symbols.length === 0) return;

      // Get market data for all subscribed symbols in parallel
      const marketDataPromises = symbols.map(async (symbol) => {
        try {
          const data = await this.dataSourceManager.getMarketData(symbol);
          return { symbol, data };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(marketDataPromises);
      
      // Broadcast to specific symbol rooms
      results.forEach(result => {
        if (result && result.data.status === 'success') {
          this.io.to(`symbol:${result.symbol}`).emit('market-data', {
            symbol: result.symbol,
            data: result.data.data,
            provider: result.data.provider,
            timestamp: Date.now(),
            cached: result.data.cached || false
          });
        }
      });

    } catch (error) {
      console.error('Error broadcasting market data:', error);
    }
  }

  /**
   * Broadcast trading signals
   */
  async broadcastTradingSignals() {
    try {
      // TODO: Implement actual trading signals logic
      // For now, send mock signals based on market data
      const signals = await this.generateTradingSignals();
      
      this.io.to('signals').emit('trading-signals', {
        signals,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error broadcasting trading signals:', error);
    }
  }

  /**
   * Broadcast market status
   */
  async broadcastMarketStatus() {
    try {
      const status = {
        isOpen: this.isMarketOpen(),
        nextOpen: this.getNextMarketOpen(),
        connectedUsers: this.connectedUsers.size,
        activeSubscriptions: this.subscriptions.size,
        serverLoad: process.cpuUsage(),
        timestamp: Date.now()
      };
      
      this.io.to('market-status').emit('market-status', status);
      
    } catch (error) {
      console.error('Error broadcasting market status:', error);
    }
  }

  /**
   * Generate trading signals (placeholder)
   */
  async generateTradingSignals() {
    // This is a placeholder - implement actual signal generation logic
    return [
      {
        symbol: 'AAPL',
        signal: 'BUY',
        confidence: 0.75,
        reason: 'Technical analysis indicates upward trend'
      }
    ];
  }

  /**
   * Check if market is open
   */
  isMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Simple check: weekdays 9:30 AM - 4:00 PM EST
    return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
  }

  /**
   * Get next market open time
   */
  getNextMarketOpen() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 30, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeSubscriptions: this.subscriptions.size,
      isInitialized: this.isInitialized,
      rooms: this.io ? Object.keys(this.io.sockets.adapter.rooms).length : 0
    };
  }

  /**
   * Broadcast to specific user
   */
  emitToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all users
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Shutdown the service
   */
  async shutdown() {
    console.log('🔄 Shutting down Socket.IO service...');
    
    // Clear intervals
    this.updateIntervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`⏰ Cleared ${name} interval`);
    });
    
    // Close all connections
    if (this.io) {
      this.io.close();
      console.log('🔌 Socket.IO server closed');
    }
    
    this.isInitialized = false;
    console.log('✅ Socket.IO service shutdown complete');
  }
}

module.exports = SocketService;