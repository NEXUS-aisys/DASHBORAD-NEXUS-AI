
const { sendLLMRequest } = require('./llmService');

class TradingSignalService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
    this.volumeProfile = new Map(); // Store volume profile data
    this.deltaData = new Map(); // Store delta calculations
    this.liquidityLevels = new Map(); // Store liquidity level data
  }

  /**
   * Calculate RSI (Relative Strength Index)
   * @param {Array} prices - Array of closing prices
   * @param {number} period - RSI period (default 14)
   * @returns {number} RSI value
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50; // Default neutral RSI
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    
    gains /= period;
    losses /= period;
    
    // Calculate RSI
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param {Array} prices - Array of closing prices
   * @returns {Object} MACD values
   */
  calculateMACD(prices) {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    return {
      macd,
      signal: 0, // Simplified for now
      histogram: macd
    };
  }

  /**
   * Calculate Exponential Moving Average
   * @param {Array} prices - Array of prices
   * @param {number} period - EMA period
   * @returns {number} EMA value
   */
  calculateEMA(prices, period) {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  /**
   * Calculate Bollinger Bands
   * @param {Array} prices - Array of closing prices
   * @param {number} period - Moving average period
   * @param {number} stdDev - Standard deviation multiplier
   * @returns {Object} Bollinger Bands values
   */
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) {
      const currentPrice = prices[prices.length - 1] || 0;
      return {
        upper: currentPrice * 1.02,
        middle: currentPrice,
        lower: currentPrice * 0.98
      };
    }
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  /**
   * Fetch historical data for technical analysis
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period (1mo, 3mo, 6mo, 1y)
   * @returns {Promise<Array>} Historical price data
   */
  async fetchHistoricalData(symbol, period = '3mo') {
    try {
      // Demo data since Yahoo Finance is removed
    const result = {
        period1: this.getPeriodStart(period),
        period2: new Date(),
        interval: '1d'
      });
      
      return result.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    } catch (error) {
      console.warn(`Failed to fetch historical data for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Get period start date
   * @param {string} period - Period string
   * @returns {Date} Start date
   */
  getPeriodStart(period) {
    const now = new Date();
    switch (period) {
      case '1mo': return new Date(now.setMonth(now.getMonth() - 1));
      case '3mo': return new Date(now.setMonth(now.getMonth() - 3));
      case '6mo': return new Date(now.setMonth(now.getMonth() - 6));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setMonth(now.getMonth() - 3));
    }
  }

  /**
   * Get current market data
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Current market data
   */
  async getCurrentMarketData(symbol) {
    try {
          // Demo data since Yahoo Finance is removed
    const quote = {
      return {
        currentPrice: quote.regularMarketPrice || quote.price || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        high: quote.regularMarketDayHigh || quote.dayHigh || 0,
        low: quote.regularMarketDayLow || quote.dayLow || 0,
        open: quote.regularMarketOpen || quote.open || 0,
        previousClose: quote.regularMarketPreviousClose || quote.previousClose || 0
      };
    } catch (error) {
      // Fallback to Bybit for crypto
      if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.endsWith('USDT')) {
        return this.fetchBybitData(symbol.endsWith('USDT') ? symbol : symbol + 'USDT');
      }
      throw error;
    }
  }

  /**
   * Fetch data from Bybit for crypto symbols
   * @param {string} symbol - Crypto symbol (e.g., BTCUSDT)
   * @returns {Promise<Object>} Market data
   */
  async fetchBybitData(symbol) {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`);
      const data = await response.json();
      
      if (data.retCode === 0 && data.result.list && data.result.list.length > 0) {
        const ticker = data.result.list[0];
        return {
          currentPrice: parseFloat(ticker.lastPrice),
          change: parseFloat(ticker.price24hPcnt) * parseFloat(ticker.lastPrice) / 100,
          changePercent: parseFloat(ticker.price24hPcnt),
          volume: parseFloat(ticker.volume24h),
          high: parseFloat(ticker.highPrice24h),
          low: parseFloat(ticker.lowPrice24h),
          open: parseFloat(ticker.prevPrice24h),
          previousClose: parseFloat(ticker.prevPrice24h)
        };
      }
      throw new Error('No data from Bybit');
    } catch (error) {
      console.error(`Bybit API error for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Generate comprehensive trading signal with AI analysis
   * @param {string} symbol - Stock symbol
   * @param {Object} options - Signal generation options
   * @returns {Promise<Object>} Complete trading signal
   */
  async generateComprehensiveSignal(symbol, options = {}) {
    const cacheKey = `signal_${symbol}_${Date.now() - (Date.now() % this.cacheTTL)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`📋 Using cached signal for ${symbol}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`🔍 Generating comprehensive signal for ${symbol}...`);
      
      // Fetch current market data
      const marketData = await this.getCurrentMarketData(symbol);
      
      // Fetch historical data for technical analysis
      const historicalData = await this.fetchHistoricalData(symbol);
      const closingPrices = historicalData.map(item => item.close);
      
      // Calculate technical indicators
      const rsi = this.calculateRSI(closingPrices);
      const macd = this.calculateMACD(closingPrices);
      const bollinger = this.calculateBollingerBands(closingPrices);
      const movingAverage = this.calculateEMA(closingPrices, 20);
      
      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(symbol, marketData, {
        rsi,
        macd: macd.macd,
        bollinger,
        movingAverage
      });

      // Generate trading signal based on technical indicators
      const technicalSignal = this.generateTechnicalSignal({
        rsi,
        macd: macd.macd,
        currentPrice: marketData.currentPrice,
        bollinger,
        movingAverage
      });

      // Combine AI and technical analysis
      const finalSignal = this.combineSignals(technicalSignal, aiAnalysis, marketData);

      const result = {
        symbol: symbol.toUpperCase(),
        timestamp: new Date().toISOString(),
        error: null,
        summary: {
          signal: finalSignal.action,
          confidence: finalSignal.confidence,
          sentiment: finalSignal.sentiment,
          entryPrice: finalSignal.entryPrice,
          targetPrice: finalSignal.targetPrice,
          stopLoss: finalSignal.stopLoss,
          riskRewardRatio: finalSignal.riskRewardRatio
        },
        marketData: {
          currentPrice: marketData.currentPrice,
          change: marketData.change,
          changePercent: marketData.changePercent,
          volume: marketData.volume,
          high: marketData.high,
          low: marketData.low
        },
        technical: {
          rsi,
          macd: macd.macd,
          movingAverage,
          bollinger
        },
        risk: {
          level: this.assessRiskLevel(rsi, marketData.changePercent),
          volatility: Math.abs(marketData.changePercent) / 100,
          stopLoss: finalSignal.stopLoss
        },
        recommendation: aiAnalysis.recommendation,
        reasoning: aiAnalysis.reasoning
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      console.log(`✅ Generated comprehensive signal for ${symbol}: ${finalSignal.action} (${finalSignal.confidence}% confidence)`);
      return result;

    } catch (error) {
      console.error(`❌ Error generating signal for ${symbol}:`, error);
      return {
        symbol: symbol.toUpperCase(),
        timestamp: new Date().toISOString(),
        error: error.message,
        summary: null,
        marketData: null,
        technical: null,
        risk: null,
        recommendation: null,
        reasoning: null
      };
    }
  }

  /**
   * Generate AI analysis using LLM
   * @param {string} symbol - Stock symbol
   * @param {Object} marketData - Current market data
   * @param {Object} technicalData - Technical indicator data
   * @returns {Promise<Object>} AI analysis
   */
  async generateAIAnalysis(symbol, marketData, technicalData) {
    try {
      const prompt = `
        Analyze ${symbol} for trading signals:
        
        Current Market Data:
        - Price: $${marketData.currentPrice.toFixed(2)}
        - Change: ${marketData.changePercent.toFixed(2)}%
        - Volume: ${marketData.volume.toLocaleString()}
        - Day High: $${marketData.high.toFixed(2)}
        - Day Low: $${marketData.low.toFixed(2)}
        
        Technical Indicators:
        - RSI: ${technicalData.rsi.toFixed(2)}
        - MACD: ${technicalData.macd.toFixed(4)}
        - Moving Average (20): $${technicalData.movingAverage.toFixed(2)}
        - Bollinger Bands: Upper $${technicalData.bollinger.upper.toFixed(2)}, Middle $${technicalData.bollinger.middle.toFixed(2)}, Lower $${technicalData.bollinger.lower.toFixed(2)}
        
        Provide a trading recommendation (BUY/SELL/HOLD) with confidence level (0-100) and reasoning.
        Format: Action|Confidence|Reasoning
      `;

      const aiResponse = await sendLLMRequest('openai', 'gpt-3.5-turbo', prompt);
      
      // Parse AI response
      const parts = aiResponse.split('|');
      const action = parts[0]?.trim().toUpperCase() || 'HOLD';
      const confidence = parseInt(parts[1]?.trim()) || 50;
      const reasoning = parts[2]?.trim() || 'AI analysis completed';

      return {
        action,
        confidence,
        reasoning,
        recommendation: `AI recommends ${action} with ${confidence}% confidence. ${reasoning}`
      };
    } catch (error) {
      console.warn('AI analysis failed, using technical analysis only:', error.message);
      
      // Fallback to technical analysis
      return {
        action: 'HOLD',
        confidence: 50,
        reasoning: 'AI analysis unavailable, using technical indicators',
        recommendation: 'Technical analysis suggests a neutral position based on current indicators.'
      };
    }
  }

  /**
   * Generate signal based on technical indicators
   * @param {Object} indicators - Technical indicator values
   * @returns {Object} Technical signal
   */
  generateTechnicalSignal(indicators) {
    const { rsi, macd, currentPrice, bollinger, movingAverage } = indicators;
    
    let signal = 'HOLD';
    let confidence = 50;
    let sentiment = 'neutral';
    
    // RSI analysis
    if (rsi < 30) {
      signal = 'BUY';
      confidence += 20;
      sentiment = 'bullish';
    } else if (rsi > 70) {
      signal = 'SELL';
      confidence += 20;
      sentiment = 'bearish';
    }
    
    // MACD analysis
    if (macd > 0) {
      if (signal === 'BUY') confidence += 15;
      else if (signal === 'HOLD') {
        signal = 'BUY';
        confidence += 10;
        sentiment = 'bullish';
      }
    } else if (macd < 0) {
      if (signal === 'SELL') confidence += 15;
      else if (signal === 'HOLD') {
        signal = 'SELL';
        confidence += 10;
        sentiment = 'bearish';
      }
    }
    
    // Bollinger Bands analysis
    if (currentPrice <= bollinger.lower) {
      if (signal === 'BUY') confidence += 10;
      else if (signal === 'HOLD') signal = 'BUY';
    } else if (currentPrice >= bollinger.upper) {
      if (signal === 'SELL') confidence += 10;
      else if (signal === 'HOLD') signal = 'SELL';
    }
    
    // Price vs Moving Average
    if (currentPrice > movingAverage) {
      if (signal === 'BUY') confidence += 5;
      sentiment = sentiment === 'bearish' ? 'neutral' : 'bullish';
    } else {
      if (signal === 'SELL') confidence += 5;
      sentiment = sentiment === 'bullish' ? 'neutral' : 'bearish';
    }
    
    // Cap confidence at 95%
    confidence = Math.min(confidence, 95);
    
    // Calculate target and stop loss prices
    const targetPrice = signal === 'BUY' ? 
      currentPrice * 1.05 : currentPrice * 0.95;
    const stopLoss = signal === 'BUY' ? 
      currentPrice * 0.97 : currentPrice * 1.03;
    
    const riskRewardRatio = Math.abs(targetPrice - currentPrice) / Math.abs(currentPrice - stopLoss);
    
    return {
      action: signal,
      confidence,
      sentiment,
      entryPrice: { min: currentPrice * 0.999, max: currentPrice * 1.001 },
      targetPrice,
      stopLoss,
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100
    };
  }

  /**
   * Combine AI and technical signals
   * @param {Object} technicalSignal - Technical analysis signal
   * @param {Object} aiAnalysis - AI analysis
   * @param {Object} marketData - Market data
   * @returns {Object} Combined signal
   */
  combineSignals(technicalSignal, aiAnalysis, marketData) {
    // If AI and technical agree, boost confidence
    if (technicalSignal.action === aiAnalysis.action) {
      return {
        ...technicalSignal,
        confidence: Math.min(95, (technicalSignal.confidence + aiAnalysis.confidence) / 2 + 10)
      };
    }
    
    // If they disagree, use weighted average based on confidence
    const techWeight = technicalSignal.confidence / 100;
    const aiWeight = aiAnalysis.confidence / 100;
    const totalWeight = techWeight + aiWeight;
    
    let finalAction = 'HOLD';
    let finalConfidence = 50;
    
    if (totalWeight > 0) {
      const techScore = techWeight / totalWeight;
      const aiScore = aiWeight / totalWeight;
      
      if (techScore > 0.6) {
        finalAction = technicalSignal.action;
        finalConfidence = technicalSignal.confidence * 0.8; // Reduce confidence due to disagreement
      } else if (aiScore > 0.6) {
        finalAction = aiAnalysis.action;
        finalConfidence = aiAnalysis.confidence * 0.8;
      } else {
        finalAction = 'HOLD';
        finalConfidence = 40; // Low confidence due to disagreement
      }
    }
    
    return {
      ...technicalSignal,
      action: finalAction,
      confidence: Math.round(finalConfidence)
    };
  }

  /**
   * Assess risk level based on indicators
   * @param {number} rsi - RSI value
   * @param {number} changePercent - Price change percentage
   * @returns {string} Risk level
   */
  assessRiskLevel(rsi, changePercent) {
    const volatility = Math.abs(changePercent);
    
    if (volatility > 10 || rsi > 80 || rsi < 20) return 'high';
    if (volatility > 5 || rsi > 70 || rsi < 30) return 'medium';
    return 'low';
  }

  /**
   * Generate batch signals for multiple symbols
   * @param {Array} symbols - Array of symbols
   * @returns {Promise<Array>} Array of signals
   */
  async generateBatchSignals(symbols) {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.generateComprehensiveSignal(symbol))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          symbol: symbols[index].toUpperCase(),
          timestamp: new Date().toISOString(),
          error: result.reason.message,
          summary: null,
          marketData: null,
          technical: null,
          risk: null,
          recommendation: null,
          reasoning: null
        };
      }
    });
  }
}

module.exports = new TradingSignalService();
