const CircuitBreaker = require('opossum');

class DataProviderCircuitBreaker {
  constructor() {
    this.breakers = new Map();
    this.stats = new Map();
    
    // Circuit breaker options for data providers
    this.options = {
      timeout: 5000,        // 5 second timeout
      errorThresholdPercentage: 50,  // Open circuit at 50% failure rate
      resetTimeout: 30000,  // Try again after 30 seconds
      rollingCountTimeout: 10000,   // 10 second rolling window
      rollingCountBuckets: 10,      // Number of buckets in rolling window
      volumeThreshold: 5,   // Minimum number of requests before calculating error rate
      capacity: 2,          // Number of buckets in the rolling count timeout
      
      // Fallback function when circuit is open
      fallback: (provider, symbol) => {
        console.warn(`🔴 Circuit breaker OPEN for ${provider} (${symbol}) - using fallback`);
        return null;
      },
      
      // Error filter - only count specific errors as failures
      errorFilter: (err) => {
        // Don't count timeout errors as circuit breaker failures
        if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
          return false;
        }
        // Count HTTP errors >= 500 as failures
        if (err.response && err.response.status >= 500) {
          return true;
        }
        // Count rate limiting as non-failure (don't open circuit)
        if (err.response && err.response.status === 429) {
          return false;
        }
        return true;
      }
    };
  }

  /**
   * Get or create circuit breaker for a provider
   */
  getBreaker(providerName) {
    if (!this.breakers.has(providerName)) {
      const breaker = new CircuitBreaker(this.makeProviderCall.bind(this), {
        ...this.options,
        name: `${providerName}_breaker`
      });

      // Set up event listeners
      breaker.on('open', () => {
        console.warn(`🔴 Circuit breaker OPENED for ${providerName}`);
        this.updateStats(providerName, 'opened');
      });

      breaker.on('halfOpen', () => {
        console.log(`🟡 Circuit breaker HALF-OPEN for ${providerName}`);
        this.updateStats(providerName, 'halfOpened');
      });

      breaker.on('close', () => {
        console.log(`🟢 Circuit breaker CLOSED for ${providerName}`);
        this.updateStats(providerName, 'closed');
      });

      breaker.on('success', (result) => {
        this.updateStats(providerName, 'success');
      });

      breaker.on('failure', (error) => {
        console.warn(`⚠️ Circuit breaker failure for ${providerName}:`, error.message);
        this.updateStats(providerName, 'failure');
      });

      breaker.on('timeout', () => {
        console.warn(`⏰ Circuit breaker timeout for ${providerName}`);
        this.updateStats(providerName, 'timeout');
      });

      breaker.on('reject', () => {
        console.warn(`❌ Circuit breaker rejected call for ${providerName}`);
        this.updateStats(providerName, 'rejected');
      });

      this.breakers.set(providerName, breaker);
      this.initializeStats(providerName);
    }

    return this.breakers.get(providerName);
  }

  /**
   * Initialize statistics for a provider
   */
  initializeStats(providerName) {
    this.stats.set(providerName, {
      success: 0,
      failure: 0,
      timeout: 0,
      rejected: 0,
      opened: 0,
      halfOpened: 0,
      closed: 0,
      lastFailure: null,
      lastSuccess: null,
      created: Date.now()
    });
  }

  /**
   * Update statistics for a provider
   */
  updateStats(providerName, event) {
    const stats = this.stats.get(providerName);
    if (stats) {
      stats[event]++;
      if (event === 'success') {
        stats.lastSuccess = Date.now();
      } else if (event === 'failure') {
        stats.lastFailure = Date.now();
      }
    }
  }

  /**
   * Make the actual provider call (wrapped by circuit breaker)
   */
  async makeProviderCall(provider, method, ...args) {
    try {
      const startTime = Date.now();
      const result = await provider[method](...args);
      const duration = Date.now() - startTime;
      
      // Log slow responses for monitoring
      if (duration > 2000) {
        console.warn(`🐌 Slow response from ${provider.name || 'unknown'}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      // Add provider context to error
      error.provider = provider.name || 'unknown';
      error.method = method;
      error.args = args;
      throw error;
    }
  }

  /**
   * Execute provider call with circuit breaker protection
   */
  async executeWithBreaker(providerName, provider, method, ...args) {
    const breaker = this.getBreaker(providerName);
    
    try {
      return await breaker.fire(provider, method, ...args);
    } catch (error) {
      // If circuit is open or call fails, return null for graceful degradation
      if (error.message && error.message.includes('CircuitBreaker')) {
        console.warn(`🔴 Circuit breaker error for ${providerName}:`, error.message);
        return null;
      }
      throw error;
    }
  }

  /**
   * Execute multiple providers in parallel with circuit breaker protection
   */
  async executeInParallel(providerCalls) {
    const promises = providerCalls.map(async ({ providerName, provider, method, args = [] }) => {
      try {
        const result = await this.executeWithBreaker(providerName, provider, method, ...args);
        return {
          providerName,
          success: true,
          result,
          error: null
        };
      } catch (error) {
        return {
          providerName,
          success: false,
          result: null,
          error: error.message
        };
      }
    });

    // Wait for all calls to complete (don't fail fast)
    const results = await Promise.allSettled(promises);
    
    // Extract results and handle any unexpected rejections
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          providerName: providerCalls[index].providerName,
          success: false,
          result: null,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Get circuit breaker statistics for all providers
   */
  getStats() {
    const allStats = {};
    
    for (const [providerName, breaker] of this.breakers) {
      const stats = this.stats.get(providerName);
      const breakerStats = breaker.stats;
      
      allStats[providerName] = {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
        isOpen: breaker.opened,
        isHalfOpen: breaker.halfOpen,
        ...stats,
        circuitBreakerStats: {
          fires: breakerStats.fires,
          successes: breakerStats.successes,
          failures: breakerStats.failures,
          rejects: breakerStats.rejects,
          timeouts: breakerStats.timeouts,
          fallbacks: breakerStats.fallbacks,
          latencyMean: breakerStats.latencyMean,
          latencyStdDev: breakerStats.latencyStdDev,
          successRate: breakerStats.fires > 0 ? 
            ((breakerStats.successes / breakerStats.fires) * 100).toFixed(2) + '%' : 'N/A'
        }
      };
    }
    
    return allStats;
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus() {
    const health = {
      overall: 'healthy',
      providers: {},
      summary: {
        total: this.breakers.size,
        healthy: 0,
        degraded: 0,
        unhealthy: 0
      }
    };

    for (const [providerName, breaker] of this.breakers) {
      const stats = this.stats.get(providerName);
      let status = 'healthy';
      
      if (breaker.opened) {
        status = 'unhealthy';
        health.summary.unhealthy++;
      } else if (breaker.halfOpen) {
        status = 'degraded';
        health.summary.degraded++;
      } else {
        health.summary.healthy++;
      }
      
      health.providers[providerName] = {
        status,
        lastSuccess: stats.lastSuccess,
        lastFailure: stats.lastFailure,
        successRate: stats.success + stats.failure > 0 ? 
          ((stats.success / (stats.success + stats.failure)) * 100).toFixed(2) + '%' : 'N/A'
      };
    }

    // Determine overall health
    if (health.summary.unhealthy > health.summary.healthy) {
      health.overall = 'unhealthy';
    } else if (health.summary.degraded > 0 || health.summary.unhealthy > 0) {
      health.overall = 'degraded';
    }

    return health;
  }

  /**
   * Reset circuit breaker for a specific provider
   */
  resetBreaker(providerName) {
    const breaker = this.breakers.get(providerName);
    if (breaker) {
      breaker.close();
      this.initializeStats(providerName);
      console.log(`🔄 Reset circuit breaker for ${providerName}`);
      return true;
    }
    return false;
  }

  /**
   * Reset all circuit breakers
   */
  resetAllBreakers() {
    let resetCount = 0;
    for (const [providerName, breaker] of this.breakers) {
      breaker.close();
      this.initializeStats(providerName);
      resetCount++;
    }
    console.log(`🔄 Reset ${resetCount} circuit breakers`);
    return resetCount;
  }

  /**
   * Shutdown all circuit breakers
   */
  shutdown() {
    console.log('🔄 Shutting down circuit breakers...');
    for (const [providerName, breaker] of this.breakers) {
      breaker.shutdown();
    }
    this.breakers.clear();
    this.stats.clear();
    console.log('✅ Circuit breakers shutdown complete');
  }
}

// Create singleton instance
const circuitBreaker = new DataProviderCircuitBreaker();

module.exports = circuitBreaker;