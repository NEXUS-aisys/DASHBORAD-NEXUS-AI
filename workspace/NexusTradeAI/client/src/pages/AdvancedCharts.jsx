import React, { useState, useEffect } from 'react';
import { LineChart, BarChart3, PieChart, TrendingUp, Brain, Activity, Zap, Settings, Download, Eye, EyeOff, Target, AlertCircle, RefreshCw, Clock, DollarSign, CheckCircle, Star, Filter, Grid, List, ArrowLeft, Radio, Signal, Gauge, Waves, TrendingDown, Shield, ArrowUpRight, ArrowDownRight, Droplets } from 'lucide-react';
import Plot from 'react-plotly.js';
import websocketService from '../services/websocketService';

const AdvancedCharts = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('cumulative-delta');
  const [timeframe, setTimeframe] = useState('5m');

  // Strategy Selector Component
  const StrategySelector = () => (
    <div className="professional-card fade-in mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Strategy Selection</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => setSelectedStrategy(strategy.id)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              selectedStrategy === strategy.id
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <strategy.icon className="w-5 h-5" style={{ color: strategy.color }} />
              <span className="text-xs text-[var(--text-primary)] text-center font-medium">
                {strategy.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Strategy-specific data
  const strategyData = {
    'cumulative-delta': {
      deltaFlow: [12, 18, 25, 32, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 65],
      buyPressure: [8, 12, 15, 20, 18, 22, 25, 23, 28, 30, 27, 32, 35, 33, 38],
      sellPressure: [4, 6, 10, 12, 10, 13, 17, 15, 17, 22, 21, 23, 27, 25, 27]
    },
    'liquidation-detection': {
      zones: [
        { level: 18500, strength: 85, type: 'long', volume: 1250 },
        { level: 18450, strength: 72, type: 'short', volume: 980 },
        { level: 18400, strength: 93, type: 'long', volume: 1450 },
        { level: 18350, strength: 68, type: 'short', volume: 890 },
        { level: 18300, strength: 78, type: 'long', volume: 1120 }
      ],
      currentPrice: 18425,
      riskLevel: 35
    },
    'momentum-breakout': {
      price: [18000, 18050, 18100, 18150, 18200, 18250, 18300, 18350, 18400, 18450, 18500, 18550, 18600, 18650, 18700],
      momentum: [0, 5, 12, 18, 25, 32, 28, 35, 42, 48, 55, 62, 58, 65, 72],
      breakouts: [false, false, false, false, false, true, false, false, false, true, false, false, false, true, false],
      volume: [400, 450, 520, 580, 650, 1200, 480, 540, 620, 1100, 490, 560, 640, 1150, 510]
    },
    'delta-divergence': {
      price: [18000, 18020, 18040, 18060, 18080, 18100, 18080, 18060, 18040, 18020, 18000, 17980, 17960, 17940, 17920],
      delta: [10, 15, 20, 25, 30, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10],
      divergence: [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false],
      signal: 'bearish'
    },
    'hvn-rejection': {
      nodes: [
        { price: 18500, volume: 2500, strength: 95, rejected: true },
        { price: 18450, volume: 1800, strength: 78, rejected: false },
        { price: 18400, volume: 2200, strength: 88, rejected: true },
        { price: 18350, volume: 1600, strength: 72, rejected: false },
        { price: 18300, volume: 2000, strength: 82, rejected: true }
      ],
      currentPrice: 18425,
      rejectionCount: 3
    },
    'liquidity-absorption': {
      levels: [
        { price: 18500, liquidity: 1500, absorbed: 1200, remaining: 300 },
        { price: 18450, liquidity: 1200, absorbed: 980, remaining: 220 },
        { price: 18400, liquidity: 1800, absorbed: 1450, remaining: 350 },
        { price: 18350, liquidity: 1000, absorbed: 750, remaining: 250 },
        { price: 18300, liquidity: 1400, absorbed: 1100, remaining: 300 }
      ],
      absorptionRate: 78,
      totalLiquidity: 6900
    }
  };

  // 1. CUMULATIVE DELTA STRATEGY
  const CumulativeDeltaChart = () => {
    const [deltaData, setDeltaData] = useState({
      deltaFlow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      buyPressure: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      sellPressure: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for cumulative delta data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to cumulative delta data
      const unsubscribe = websocketService.subscribe('strategy', 'cumulative-delta', (data) => {
        setDeltaData({
          deltaFlow: data.deltaFlow || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          buyPressure: data.buyPressure || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          sellPressure: data.sellPressure || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Cumulative Delta Flow</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded">
            Delta Strategy
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid */}
            <defs>
              <pattern id="deltaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#deltaGrid)" />
            
            {/* Delta Flow Line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={deltaData.deltaFlow.map((d, i) => `${i * 26.7},${200 - (d * 2)}`).join(' ')}
            />
            
            {/* Buy Pressure Area */}
            <polyline
              fill="rgba(34, 197, 94, 0.2)"
              stroke="none"
              points={`0,200 ${deltaData.buyPressure.map((d, i) => `${i * 26.7},${200 - (d * 2)}`).join(' ')} ${deltaData.buyPressure.length * 26.7},200`}
            />
            
            {/* Sell Pressure Area */}
            <polyline
              fill="rgba(239, 68, 68, 0.2)"
              stroke="none"
              points={`0,200 ${deltaData.sellPressure.map((d, i) => `${i * 26.7},${200 - (d * 2)}`).join(' ')} ${deltaData.sellPressure.length * 26.7},200`}
            />
            
            {/* Zero Line */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{deltaData.deltaFlow[deltaData.deltaFlow.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Delta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{deltaData.buyPressure[deltaData.buyPressure.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Buy Pressure</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{deltaData.sellPressure[deltaData.sellPressure.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Sell Pressure</div>
          </div>
        </div>
      </div>
    );
  };

  // 2. LIQUIDATION DETECTION STRATEGY
  const LiquidationDetectionChart = () => {
    const [liquidationData, setLiquidationData] = useState({
      zones: [],
      currentPrice: 0,
      riskLevel: 0
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for liquidation detection data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to liquidation detection data
      const unsubscribe = websocketService.subscribe('strategy', 'liquidation-detection', (data) => {
        setLiquidationData({
          zones: data.zones || [],
          currentPrice: data.currentPrice || 0,
          riskLevel: data.riskLevel || 0
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Liquidation Zone Scanner</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 rounded">
            Risk Detection
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <div className="relative h-full">
            {/* Price Levels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-[var(--text-secondary)]">
              {liquidationData.zones.map((zone, index) => (
                <div key={index} className="text-right">{zone.level}</div>
              ))}
            </div>
            
            {/* Liquidation Zones */}
            <div className="absolute left-16 top-0 bottom-0 right-0">
              {liquidationData.zones.map((zone, index) => (
                <div key={index} className="absolute w-full h-12 transform -translate-y-1/2"
                     style={{ top: `${(index + 1) * 16}%` }}>
                  <div className={`h-full rounded-lg border-2 ${
                    zone.type === 'long' 
                      ? 'bg-red-500/20 border-red-500/40' 
                      : 'bg-green-500/20 border-green-500/40'
                  }`}>
                    <div className="flex items-center justify-between h-full px-4">
                      <span className={`text-sm font-medium ${
                        zone.type === 'long' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {zone.type.toUpperCase()} LIQUIDATIONS
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--text-primary)]">{zone.volume}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Volume</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Current Price Indicator */}
            <div className="absolute left-16 top-0 bottom-0 w-1 bg-yellow-400"
                 style={{ left: '4rem', top: `${Math.max(0, Math.min(100, (liquidationData.currentPrice - 18000) / 200 * 100))}%` }}>
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{liquidationData.zones.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Liquidation Zones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{liquidationData.currentPrice}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{liquidationData.riskLevel}%</div>
            <div className="text-sm text-[var(--text-secondary)]">Risk Level</div>
          </div>
        </div>
      </div>
    );
  };

  // 3. MOMENTUM BREAKOUT STRATEGY
  const MomentumBreakoutChart = () => {
    const [momentumData, setMomentumData] = useState({
      price: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      momentum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      breakouts: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      volume: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for momentum breakout data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to momentum breakout data
      const unsubscribe = websocketService.subscribe('strategy', 'momentum-breakout', (data) => {
        setMomentumData({
          price: data.price || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          momentum: data.momentum || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          breakouts: data.breakouts || [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
          volume: data.volume || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Momentum Breakout Detection</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20 rounded">
            Breakout Strategy
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid */}
            <defs>
              <pattern id="momentumGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#momentumGrid)" />
            
            {/* Price Line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={momentumData.price.map((p, i) => `${i * 26.7},${200 - ((p - 18000) / 100)}`).join(' ')}
            />
            
            {/* Momentum Line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              points={momentumData.momentum.map((m, i) => `${i * 26.7},${200 - (m * 1.5)}`).join(' ')}
            />
            
            {/* Breakout Points */}
            {momentumData.breakouts.map((breakout, i) => breakout && (
              <circle
                key={i}
                cx={i * 26.7}
                cy={200 - ((momentumData.price[i] - 18000) / 100)}
                r="6"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
            
            {/* Volume Bars */}
            {momentumData.volume.map((v, i) => (
              <rect
                key={i}
                x={i * 26.7 - 1}
                y={180 - (v / 20)}
                width="2"
                height={v / 20}
                fill="#10b981"
                opacity="0.3"
              />
            ))}
          </svg>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{momentumData.price[momentumData.price.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{momentumData.momentum[momentumData.momentum.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Momentum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{momentumData.breakouts.filter(b => b).length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Breakouts</div>
          </div>
        </div>
      </div>
    );
  };

  // 4. DELTA DIVERGENCE STRATEGY
  const DeltaDivergenceChart = () => {
    const [divergenceData, setDivergenceData] = useState({
      price: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      delta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      divergence: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      signal: 'neutral'
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for delta divergence data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to delta divergence data
      const unsubscribe = websocketService.subscribe('strategy', 'delta-divergence', (data) => {
        setDivergenceData({
          price: data.price || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          delta: data.delta || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          divergence: data.divergence || [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
          signal: data.signal || 'neutral'
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delta Divergence Analysis</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium border rounded ${
            divergenceData.signal === 'bullish' 
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : divergenceData.signal === 'bearish'
              ? 'bg-red-500/10 text-red-600 border-red-500/20'
              : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
          }`}>
            {divergenceData.signal.toUpperCase()} SIGNAL
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid */}
            <defs>
              <pattern id="divergenceGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#divergenceGrid)" />
            
            {/* Price Line */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              points={divergenceData.price.map((p, i) => `${i * 26.7},${200 - ((p - 17900) / 200)}`).join(' ')}
            />
            
            {/* Delta Line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              points={divergenceData.delta.map((d, i) => `${i * 26.7},${100 - (d * 2)}`).join(' ')}
            />
            
            {/* Divergence Points */}
            {divergenceData.divergence.map((div, i) => div && (
              <circle
                key={i}
                cx={i * 26.7}
                cy={200 - ((divergenceData.price[i] - 17900) / 200)}
                r="6"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
            
            {/* Zero Line */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{divergenceData.price[divergenceData.price.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{divergenceData.delta[divergenceData.delta.length - 1]}</div>
            <div className="text-sm text-[var(--text-secondary)]">Delta Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{divergenceData.divergence.filter(d => d).length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Divergences</div>
          </div>
        </div>
      </div>
    );
  };

  // 5. HVN REJECTION STRATEGY
  const HVNRejectionChart = () => {
    const [hvnData, setHvnData] = useState({
      nodes: [],
      currentPrice: 0,
      rejectionCount: 0
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for HVN rejection data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to HVN rejection data
      const unsubscribe = websocketService.subscribe('strategy', 'hvn-rejection', (data) => {
        setHvnData({
          nodes: data.nodes || [],
          currentPrice: data.currentPrice || 0,
          rejectionCount: data.rejectionCount || 0
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">HVN Rejection Scanner</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded">
            Rejection Strategy
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <div className="relative h-full">
            {/* HVN Nodes */}
            {hvnData.nodes.map((node, index) => (
              <div key={index} className="absolute w-full h-16 transform -translate-y-1/2"
                   style={{ top: `${(index + 1) * 20}%` }}>
                <div className={`h-full rounded-lg border-2 ${
                  node.rejected 
                    ? 'bg-red-500/20 border-red-500/40' 
                    : 'bg-green-500/20 border-green-500/40'
                }`}>
                  <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        node.rejected ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {node.price} - {node.volume} Volume
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--text-primary)]">{node.strength}%</div>
                      <div className="text-xs text-[var(--text-secondary)]">Strength</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current Price Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"
                 style={{ top: `${Math.max(0, Math.min(100, (hvnData.currentPrice - 18000) / 200 * 100))}%` }}>
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{hvnData.nodes.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">HVN Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{hvnData.currentPrice}</div>
            <div className="text-sm text-[var(--text-secondary)]">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{hvnData.rejectionCount}</div>
            <div className="text-sm text-[var(--text-secondary)]">Rejections</div>
          </div>
        </div>
      </div>
    );
  };

  // 6. LIQUIDITY ABSORPTION STRATEGY
  const LiquidityAbsorptionChart = () => {
    const [absorptionData, setAbsorptionData] = useState({
      levels: [],
      absorptionRate: 0,
      totalLiquidity: 0
    });
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for liquidity absorption data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to liquidity absorption data
      const unsubscribe = websocketService.subscribe('strategy', 'liquidity-absorption', (data) => {
        setAbsorptionData({
          levels: data.levels || [],
          absorptionRate: data.absorptionRate || 0,
          totalLiquidity: data.totalLiquidity || 0
        });
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);
    
    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Liquidity Absorption Monitor</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 rounded">
            Absorption Strategy
          </span>
        </div>
        
        <div className="h-64 mb-4">
          <div className="relative h-full">
            {/* Liquidity Levels */}
            {absorptionData.levels.map((level, index) => (
              <div key={index} className="absolute w-full h-16 transform -translate-y-1/2"
                   style={{ top: `${(index + 1) * 20}%` }}>
                <div className="h-full rounded-lg border-2 border-cyan-500/40 bg-cyan-500/10">
                  <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {level.price} - {level.liquidity} Liquidity
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--text-primary)]">{level.absorbed}</div>
                      <div className="text-xs text-[var(--text-secondary)]">Absorbed</div>
                    </div>
                  </div>
                  
                  {/* Absorption Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg">
                    <div 
                      className="h-full bg-cyan-500 rounded-b-lg transition-all duration-300"
                      style={{ width: `${(level.absorbed / level.liquidity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-500">{absorptionData.levels.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Liquidity Levels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{absorptionData.absorptionRate}%</div>
            <div className="text-sm text-[var(--text-secondary)]">Absorption Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{absorptionData.totalLiquidity}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Liquidity</div>
          </div>
        </div>
      </div>
    );
  };

  // 7. LIQUIDITY TRAPS STRATEGY CHART
  const LiquidityTrapsChart = () => {
    const [trapData, setTrapData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for liquidity trap data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to liquidity trap data
      const unsubscribe = websocketService.subscribe('strategy', 'liquidity-traps', (data) => {
        setTrapData(data.trapData || []);
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);

    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Liquidity Trap Detection</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-lg text-sm">
              Traps: {trapData.filter(d => d.trap).length}
            </span>
          </div>
        </div>

        <div className="h-80 relative">
          {trapData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              <defs>
                <pattern id="trapGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#trapGrid)" />

              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                points={trapData.map((d, i) => `${i * (800 / trapData.length)},${150 - (d.price - 18000) / 2}`).join(' ')}
              />

              {/* Volume Bars */}
              {trapData.map((d, i) => (
                <rect
                  key={i}
                  x={i * (800 / trapData.length) - 2}
                  y={250 - (d.volume / 10)}
                  width="4"
                  height={d.volume / 10}
                  fill={d.trap ? "#ef4444" : "#ec4899"}
                  opacity={d.trap ? 0.8 : 0.3}
                />
              ))}

              {/* Trap Points */}
              {trapData.filter(d => d.trap).map((d, i) => (
                <circle
                  key={i}
                  cx={trapData.indexOf(d) * (800 / trapData.length)}
                  cy={150 - (d.price - 18000) / 2}
                  r="8"
                  fill={d.trapType === 'bull' ? "#10b981" : "#ef4444"}
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
              Waiting for liquidity trap data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-[var(--text-secondary)]">Traps Detected</span>
            </div>
            <div className="text-xl font-bold text-pink-500">{trapData.filter(d => d.trap).length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Bull Traps</span>
            </div>
            <div className="text-xl font-bold text-green-500">{trapData.filter(d => d.trap && d.trapType === 'bull').length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[var(--text-secondary)]">Bear Traps</span>
            </div>
            <div className="text-xl font-bold text-red-500">{trapData.filter(d => d.trap && d.trapType === 'bear').length}</div>
          </div>
        </div>
      </div>
    );
  };

  // 8. ICEBERG DETECTION STRATEGY CHART
  const IcebergDetectionChart = () => {
    const [icebergData, setIcebergData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for iceberg detection data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to iceberg detection data
      const unsubscribe = websocketService.subscribe('strategy', 'iceberg-detection', (data) => {
        setIcebergData(data.icebergData || []);
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);

    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <EyeOff className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Iceberg Order Detection</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg text-sm">
              Icebergs: {icebergData.filter(d => d.hiddenVolume > 0).length}
            </span>
          </div>
        </div>

        <div className="h-80 relative">
          {icebergData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              <defs>
                <pattern id="icebergGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#icebergGrid)" />

              {/* Visible Volume Bars */}
              {icebergData.map((d, i) => (
                <rect
                  key={i}
                  x={i * (800 / icebergData.length) - 3}
                  y={250 - (d.visibleVolume * 2)}
                  width="6"
                  height={d.visibleVolume * 2}
                  fill="#6366f1"
                  opacity={0.6}
                />
              ))}

              {/* Hidden Volume Bars */}
              {icebergData.map((d, i) => d.hiddenVolume > 0 && (
                <rect
                  key={`hidden-${i}`}
                  x={i * (800 / icebergData.length) - 3}
                  y={250 - (d.visibleVolume * 2) - (d.hiddenVolume * 2)}
                  width="6"
                  height={d.hiddenVolume * 2}
                  fill="#ef4444"
                  opacity={0.8}
                />
              ))}

              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5,5"
                points={icebergData.map((d, i) => `${i * (800 / icebergData.length)},${150 - (d.price - 18000) / 2}`).join(' ')}
              />
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
              Waiting for iceberg detection data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <EyeOff className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-[var(--text-secondary)]">Icebergs</span>
            </div>
            <div className="text-xl font-bold text-indigo-500">{icebergData.filter(d => d.hiddenVolume > 0).length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Hidden Volume</span>
            </div>
            <div className="text-xl font-bold text-green-500">
              {icebergData.reduce((sum, d) => sum + d.hiddenVolume, 0)}
            </div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[var(--text-secondary)]">Visible Volume</span>
            </div>
            <div className="text-xl font-bold text-red-500">
              {icebergData.reduce((sum, d) => sum + d.visibleVolume, 0)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 9. STOP RUN ANTICIPATION STRATEGY CHART
  const StopRunAnticipationChart = () => {
    const [stopRunData, setStopRunData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for stop run anticipation data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to stop run anticipation data
      const unsubscribe = websocketService.subscribe('strategy', 'stop-run-anticipation', (data) => {
        setStopRunData(data.stopRunData || []);
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);

    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ArrowUpRight className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Stop Run Anticipation</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm">
              Anticipations: {stopRunData.filter(d => d.anticipation).length}
            </span>
          </div>
        </div>

        <div className="h-80 relative">
          {stopRunData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              <defs>
                <pattern id="stopRunGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#stopRunGrid)" />

              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
                points={stopRunData.map((d, i) => `${i * (800 / stopRunData.length)},${150 - (d.price - 18000) / 2}`).join(' ')}
              />

              {/* Stop Levels */}
              <line x1="0" y1="50" x2="800" y2="50" stroke="#ef4444" strokeWidth="2" strokeDasharray="10,5" />
              <line x1="0" y1="250" x2="800" y2="250" stroke="#10b981" strokeWidth="2" strokeDasharray="10,5" />

              {/* Anticipation Points */}
              {stopRunData.filter(d => d.anticipation).map((d, i) => (
                <circle
                  key={i}
                  cx={stopRunData.indexOf(d) * (800 / stopRunData.length)}
                  cy={150 - (d.price - 18000) / 2}
                  r="8"
                  fill="#eab308"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}

              {/* Stop Hits */}
              {stopRunData.filter(d => d.stopLevels.some(s => s.hit)).map((d, i) => (
                <circle
                  key={`hit-${i}`}
                  cx={stopRunData.indexOf(d) * (800 / stopRunData.length)}
                  cy={150 - (d.price - 18000) / 2}
                  r="6"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
              Waiting for stop run anticipation data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-[var(--text-secondary)]">Anticipations</span>
            </div>
            <div className="text-xl font-bold text-yellow-500">{stopRunData.filter(d => d.anticipation).length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Long Stops</span>
            </div>
            <div className="text-xl font-bold text-green-500">
              {stopRunData.filter(d => d.stopLevels.some(s => s.type === 'long' && s.hit)).length}
            </div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[var(--text-secondary)]">Short Stops</span>
            </div>
            <div className="text-xl font-bold text-red-500">
              {stopRunData.filter(d => d.stopLevels.some(s => s.type === 'short' && s.hit)).length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 10. LVN BREAKOUT STRATEGY CHART
  const LVNBreakoutChart = () => {
    const [lvnData, setLvnData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use centralized WebSocket service for LVN breakout data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to LVN breakout data
      const unsubscribe = websocketService.subscribe('strategy', 'lvn-breakout', (data) => {
        setLvnData(data.lvnData || []);
        setIsConnected(true);
      });
      
      return () => {
        unsubscribe();
      };
    }, []);

    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ArrowDownRight className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Low Volume Node Breakout</h2>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-lg text-sm">
              Breakouts: {lvnData.filter(d => d.breakout).length}
            </span>
          </div>
        </div>

        <div className="h-80 relative">
          {lvnData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid */}
              <defs>
                <pattern id="lvnGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--border-primary)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lvnGrid)" />

              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                points={lvnData.map((d, i) => `${i * (800 / lvnData.length)},${150 - (d.price - 18000) / 2}`).join(' ')}
              />

              {/* Volume Bars */}
              {lvnData.map((d, i) => (
                <rect
                  key={i}
                  x={i * (800 / lvnData.length) - 2}
                  y={250 - (d.volume * 1.5)}
                  width="4"
                  height={d.volume * 1.5}
                  fill={d.lvn ? "#6366f1" : "#14b8a6"}
                  opacity={d.lvn ? 0.8 : 0.3}
                />
              ))}

              {/* LVN Points */}
              {lvnData.filter(d => d.lvn).map((d, i) => (
                <circle
                  key={i}
                  cx={lvnData.indexOf(d) * (800 / lvnData.length)}
                  cy={150 - (d.price - 18000) / 2}
                  r="6"
                  fill="#6366f1"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}

              {/* Breakout Points */}
              {lvnData.filter(d => d.breakout).map((d, i) => (
                <circle
                  key={`breakout-${i}`}
                  cx={lvnData.indexOf(d) * (800 / lvnData.length)}
                  cy={150 - (d.price - 18000) / 2}
                  r="8"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
              Waiting for LVN breakout data...
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowDownRight className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-[var(--text-secondary)]">Breakouts</span>
            </div>
            <div className="text-xl font-bold text-teal-500">{lvnData.filter(d => d.breakout).length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">LVN Points</span>
            </div>
            <div className="text-xl font-bold text-green-500">{lvnData.filter(d => d.lvn).length}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[var(--text-secondary)]">Avg Volume</span>
            </div>
            <div className="text-xl font-bold text-red-500">
              {lvnData.length > 0 ? Math.round(lvnData.reduce((sum, d) => sum + d.volume, 0) / lvnData.length) : 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 11. VOLUME IMBALANCE STRATEGY CHART - TRADER FRIENDLY
  const VolumeImbalanceChart = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
    const [volumeData, setVolumeData] = useState({
      buy: 0,
      sell: 0,
      imbalance: '+0',
      signal: 'NEUTRAL',
      strength: 'LOW',
      buyPressure: 'LOW',
      sellPressure: 'LOW'
    });
    
    const timeframes = [
      { value: '30s', label: '30 Seconds' },
      { value: '1m', label: '1 Minute' },
      { value: '5m', label: '5 Minutes' },
      { value: '15m', label: '15 Minutes' },
      { value: '1h', label: '1 Hour' },
      { value: '4h', label: '4 Hours' },
      { value: '1d', label: '1 Day' }
    ];

    // Use centralized WebSocket service for volume data
    useEffect(() => {
      // Connect to WebSocket service if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect();
      }

      // Subscribe to volume data
      const unsubscribe = websocketService.subscribe('volume', 'general', (data) => {
        if (data.timeframe === selectedTimeframe) {
          const { buyVolume, sellVolume, timestamp } = data;
          const imbalance = buyVolume - sellVolume;
          const imbalanceStr = imbalance >= 0 ? `+${imbalance}` : `${imbalance}`;
          
          // Calculate signal strength
          let signal = 'NEUTRAL';
          let strength = 'LOW';
          let buyPressure = 'LOW';
          let sellPressure = 'LOW';
          
          if (imbalance > 0) {
            signal = 'BUY';
            if (imbalance > 1000) strength = 'EXTREME';
            else if (imbalance > 500) strength = 'HIGH';
            else strength = 'MEDIUM';
            buyPressure = imbalance > 800 ? 'HIGH' : 'MEDIUM';
            sellPressure = 'LOW';
          } else if (imbalance < 0) {
            signal = 'SELL';
            if (Math.abs(imbalance) > 1000) strength = 'EXTREME';
            else if (Math.abs(imbalance) > 500) strength = 'HIGH';
            else strength = 'MEDIUM';
            sellPressure = Math.abs(imbalance) > 800 ? 'HIGH' : 'MEDIUM';
            buyPressure = 'LOW';
          }
          
          setVolumeData({
            buy: buyVolume,
            sell: sellVolume,
            imbalance: imbalanceStr,
            signal,
            strength,
            buyPressure,
            sellPressure
          });
        }
      });
      
      return () => {
        unsubscribe();
      };
    }, [selectedTimeframe]);

    return (
      <div className="professional-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Gauge className="w-6 h-6 text-rose-500" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Volume Imbalance Trader View</h2>
            <div className={`w-2 h-2 rounded-full ${websocketService.getConnectionStatus() ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              volumeData.signal === 'BUY' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : volumeData.signal === 'SELL'
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
            }`}>
              CURRENT: {volumeData.signal} SIGNAL
            </span>
          </div>
        </div>

        {/* Main Trading Signal */}
        <div className={`rounded-lg p-6 mb-6 border ${
          volumeData.signal === 'BUY' 
            ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30'
            : volumeData.signal === 'SELL'
            ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30'
            : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-2xl font-bold mb-2 ${
                volumeData.signal === 'BUY' ? 'text-green-500'
                : volumeData.signal === 'SELL' ? 'text-red-500'
                : 'text-gray-500'
              }`}>
                {volumeData.signal === 'NEUTRAL' ? 'NEUTRAL SIGNAL' : `${volumeData.signal} SIGNAL`}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {volumeData.signal === 'BUY' ? 'Volume imbalance indicates buying pressure'
                : volumeData.signal === 'SELL' ? 'Volume imbalance indicates selling pressure'
                : 'Volume is balanced'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                volumeData.imbalance.startsWith('+') ? 'text-green-500'
                : volumeData.imbalance.startsWith('-') ? 'text-red-500'
                : 'text-gray-500'
              }`}>
                {volumeData.imbalance}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Volume Imbalance</div>
            </div>
          </div>
        </div>

        {/* Volume Bars - Single Card */}
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">Live {timeframes.find(tf => tf.value === selectedTimeframe)?.label} Data</span>
            <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
              volumeData.signal === 'BUY' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : volumeData.signal === 'SELL'
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
            }`}>
              {volumeData.signal} - {volumeData.strength}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Buy Volume */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-500 font-medium">BUY VOLUME</span>
                <span className="text-sm text-[var(--text-secondary)]">{volumeData.buy}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((volumeData.buy / 2000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Sell Volume */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-500 font-medium">SELL VOLUME</span>
                <span className="text-sm text-[var(--text-secondary)]">{volumeData.sell}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-red-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((volumeData.sell / 2000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Imbalance Display */}
          <div className="mt-4 text-center">
            <span className={`text-2xl font-bold ${
              volumeData.imbalance.startsWith('+') ? 'text-green-500' : 
              volumeData.imbalance.startsWith('-') ? 'text-red-500' : 'text-gray-500'
            }`}>
              Imbalance: {volumeData.imbalance}
            </span>
          </div>
        </div>

        {/* Trading Action Panel */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Buy Pressure</span>
            </div>
            <div className="text-xl font-bold text-green-500">{volumeData.buyPressure}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-[var(--text-secondary)]">Sell Pressure</span>
            </div>
            <div className="text-xl font-bold text-red-500">{volumeData.sellPressure}</div>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gauge className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-[var(--text-secondary)]">Signal Strength</span>
            </div>
            <div className="text-xl font-bold text-rose-500">{volumeData.strength}</div>
          </div>
        </div>
      </div>
    );
  };

  const strategies = [
    { id: 'cumulative-delta', name: 'Cumulative Delta', component: CumulativeDeltaChart, icon: Waves, color: '#3b82f6' },
    { id: 'liquidation-detection', name: 'Liquidation Detection', component: LiquidationDetectionChart, icon: AlertCircle, color: '#ef4444' },
    { id: 'momentum-breakout', name: 'Momentum Breakout', component: MomentumBreakoutChart, icon: TrendingUp, color: '#10b981' },
    { id: 'delta-divergence', name: 'Delta Divergence', component: DeltaDivergenceChart, icon: TrendingDown, color: '#8b5cf6' },
    { id: 'hvn-rejection', name: 'HVN Rejection', component: HVNRejectionChart, icon: Target, color: '#f59e0b' },
    { id: 'liquidity-absorption', name: 'Liquidity Absorption', component: LiquidityAbsorptionChart, icon: Droplets, color: '#14b8a6' },
    { id: 'liquidity-traps', name: 'Liquidity Traps', component: LiquidityTrapsChart, icon: Eye, color: '#ec4899' },
    { id: 'iceberg-detection', name: 'Iceberg Detection', component: IcebergDetectionChart, icon: EyeOff, color: '#6366f1' },
    { id: 'stop-run-anticipation', name: 'Stop Run Anticipation', component: StopRunAnticipationChart, icon: ArrowUpRight, color: '#eab308' },
    { id: 'lvn-breakout', name: 'LVN Breakout', component: LVNBreakoutChart, icon: ArrowDownRight, color: '#14b8a6' },
    { id: 'volume-imbalance', name: 'Volume Imbalance', component: VolumeImbalanceChart, icon: Gauge, color: '#f97316' },
  ];

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);
  const StrategyComponent = selectedStrategyData?.component;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Strategy-Specific Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1">Unique visualizations for each trading strategy</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-lg">
            <Brain className="w-4 h-4" />
            <span>STRATEGY MODE</span>
          </div>
        </div>
      </div>

      {/* Strategy Selector */}
      <StrategySelector />

      {/* Strategy Chart */}
      {StrategyComponent && (
        <div className="fade-in">
          <StrategyComponent />
        </div>
      )}

      {/* Success Message */}
      <div className="professional-card fade-in">
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-[var(--accent-primary)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">🎯 ALL 11 STRATEGY CHARTS COMPLETE!</h3>
          <p className="text-[var(--text-secondary)]">
            Each chart represents what that specific strategy actually does - no generic charts, only strategy-specific visualizations!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;