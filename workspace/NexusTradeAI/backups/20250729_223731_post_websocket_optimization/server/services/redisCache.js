const redis = require('redis');
const config = require('../utils/config');

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.fallbackCache = new Map(); // Fallback to in-memory if Redis unavailable
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Redis cache...');
      
      // Redis configuration
      const redisConfig = {
        url: config.REDIS_URL || 'redis://localhost:6379',
        password: config.REDIS_PASSWORD || undefined,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis: Too many retries, giving up');
              return new Error('Too many retries');
            }
            return Math.min(retries * 100, 3000);
          }
        },
        // Production optimizations
        database: 0,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true
      };

      this.client = redis.createClient(redisConfig);

      // Event handlers
      this.client.on('connect', () => {
        console.log('🔗 Redis: Connection established');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Client ready');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Redis error (falling back to memory):', err.message);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis: Connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
      });

      // Connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

      return true;
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, using in-memory fallback:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to in-memory cache
        const cached = this.fallbackCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          return cached.data;
        }
        return null;
      }
    } catch (error) {
      console.warn('Redis get error, using fallback:', error.message);
      const cached = this.fallbackCache.get(key);
      return cached && Date.now() - cached.timestamp < cached.ttl ? cached.data : null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = 30) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, {
          data: value,
          timestamp: Date.now(),
          ttl: ttlSeconds * 1000
        });
        
        // Clean up old entries periodically
        if (this.fallbackCache.size > 1000) {
          this.cleanupFallbackCache();
        }
      }
      return true;
    } catch (error) {
      console.warn('Redis set error, using fallback:', error.message);
      this.fallbackCache.set(key, {
        data: value,
        timestamp: Date.now(),
        ttl: ttlSeconds * 1000
      });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      } else {
        this.fallbackCache.delete(key);
      }
      return true;
    } catch (error) {
      console.warn('Redis del error:', error.message);
      this.fallbackCache.delete(key);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (this.isConnected && this.client) {
        return (await this.client.exists(key)) === 1;
      } else {
        const cached = this.fallbackCache.get(key);
        return cached && Date.now() - cached.timestamp < cached.ttl;
      }
    } catch (error) {
      console.warn('Redis exists error:', error.message);
      const cached = this.fallbackCache.get(key);
      return cached && Date.now() - cached.timestamp < cached.ttl;
    }
  }

  /**
   * Set with expiration
   */
  async setex(key, seconds, value) {
    return this.set(key, value, seconds);
  }

  /**
   * Increment counter
   */
  async incr(key) {
    try {
      if (this.isConnected && this.client) {
        return await this.client.incr(key);
      } else {
        // Fallback implementation
        const current = await this.get(key) || 0;
        const newValue = current + 1;
        await this.set(key, newValue, 3600); // 1 hour default
        return newValue;
      }
    } catch (error) {
      console.warn('Redis incr error:', error.message);
      const current = await this.get(key) || 0;
      const newValue = current + 1;
      await this.set(key, newValue, 3600);
      return newValue;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const stats = {
      connected: this.isConnected,
      fallbackEntries: this.fallbackCache.size,
      type: this.isConnected ? 'Redis' : 'Memory'
    };

    if (this.isConnected && this.client) {
      try {
        const info = await this.client.info('memory');
        stats.redisMemory = info;
      } catch (error) {
        stats.error = error.message;
      }
    }

    return stats;
  }

  /**
   * Clean up old fallback cache entries
   */
  cleanupFallbackCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.fallbackCache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.fallbackCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushDb();
      }
      this.fallbackCache.clear();
      return true;
    } catch (error) {
      console.warn('Redis clear error:', error.message);
      this.fallbackCache.clear();
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
      }
      this.isConnected = false;
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.warn('Redis close error:', error.message);
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient() {
    return this.isConnected ? this.client : null;
  }
}

// Create singleton instance
const redisCache = new RedisCache();

module.exports = redisCache;
