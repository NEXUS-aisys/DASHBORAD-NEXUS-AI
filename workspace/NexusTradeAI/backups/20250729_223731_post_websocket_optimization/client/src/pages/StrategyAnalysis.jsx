import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Target, TrendingUp, BarChart3, Power, PowerOff,
  Triangle, AlertTriangle, Zap, GitBranch, Shield,
  Droplets, MousePointer, Eye, StopCircle, BarChart2, Scale,
  Play, Pause, RotateCcw, Download, Upload, Settings,
  Calendar, DollarSign, Activity, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, RefreshCw, Database, Code
} from 'lucide-react';
import WebSocketService from '../services/websocketService';
import TradingService from '../services/tradingService';

const StrategyAnalysis = () => {
  const [strategyStates, setStrategyStates] = useState({
    'cumulative_delta': true,
    'liquidation_detection': true,
    'momentum_breakout': true,
    'delta_divergence': true,
    'hvn_rejection': true,
    'liquidity_absorption': true,
    'liquidity_traps': true,
    'iceberg_detection': true,
    'stop_run_anticipation': true,
    'lvn_breakout': true,
    'volume_imbalance': true
  });

  // Real data state
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategyPerformance, setStrategyPerformance] = useState({});
  const [strategyErrors, setStrategyErrors] = useState({});
  const [strategyStatus, setStrategyStatus] = useState({});
  const [botConnection, setBotConnection] = useState(false);
  const [botStatus, setBotStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({});
  const [tradingSignals, setTradingSignals] = useState([]);

  const intervalRef = useRef(null);
  const wsServiceRef = useRef(null);
  const tradingServiceRef = useRef(null);

  // Initialize services
  useEffect(() => {
    wsServiceRef.current = WebSocketService;
    tradingServiceRef.current = TradingService;
    
    // Connect to WebSocket for real-time data
    wsServiceRef.current.connect();
    
    // Subscribe to strategy data
    const strategies = [
      'cumulative-delta', 'liquidation-detection', 'momentum-breakout',
      'delta-divergence', 'hvn-rejection', 'liquidity-absorption',
      'liquidity-traps', 'iceberg-detection', 'stop-run-anticipation',
      'lvn-breakout', 'volume-imbalance'
    ];

    strategies.forEach(strategy => {
      wsServiceRef.current.subscribe('strategy', strategy, (data) => {
        handleStrategyData(strategy, data);
      });
    });

    // Initial data fetch
    fetchInitialData();

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  const handleStrategyData = (strategy, data) => {
    setRealTimeData(prev => ({
      ...prev,
      [strategy]: data
    }));

    // Update strategy performance with real data
    if (data.performance) {
      setStrategyPerformance(prev => ({
        ...prev,
        [strategy]: {
          win_rate: data.performance.win_rate || 0,
          pnl: data.performance.pnl || '0%',
          total_trades: data.performance.total_trades || 0,
          avg_return: data.performance.avg_return || 0
        }
      }));
    }

    // Update strategy status
    if (data.status) {
      setStrategyStatus(prev => ({
        ...prev,
        [strategy]: data.status
      }));
    }

    // Update errors if any
    if (data.error) {
      setStrategyErrors(prev => ({
        ...prev,
        [strategy]: data.error
      }));
    }

    setLastUpdate(new Date());
  };

  const fetchInitialData = async () => {
    try {
      // Get real trading signals
      const signals = await tradingServiceRef.current.getTradingSignals();
      setTradingSignals(signals.data || []);

      // Get real portfolio data for performance calculation
      const portfolio = await tradingServiceRef.current.getPortfolio();
      
      // Initialize strategy status based on real data
      const strategies = [
        'cumulative-delta', 'liquidation-detection', 'momentum-breakout',
        'delta-divergence', 'hvn-rejection', 'liquidity-absorption',
        'liquidity-traps', 'iceberg-detection', 'stop-run-anticipation',
        'lvn-breakout', 'volume-imbalance'
      ];

      strategies.forEach(strategy => {
        setStrategyStatus(prev => ({
          ...prev,
          [strategy]: 'active'
        }));
      });

      setBotConnection(true);
      setBotStatus('connected');
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setBotConnection(false);
      setBotStatus('error');
    }
  };

  // Monitor WebSocket connection
  useEffect(() => {
    const checkConnection = () => {
      if (wsServiceRef.current) {
        const status = wsServiceRef.current.getConnectionStatus();
        setBotConnection(status.isConnected);
        setBotStatus(status.isConnected ? 'connected' : 'disconnected');
      }
    };

    intervalRef.current = setInterval(checkConnection, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const toggleStrategy = async (strategyKey) => {
    try {
      const newState = !strategyStates[strategyKey];
      setStrategyStates(prev => ({
        ...prev,
        [strategyKey]: newState
      }));

      // Send real command to backend
      if (wsServiceRef.current && wsServiceRef.current.isConnected) {
        wsServiceRef.current.ws.send(JSON.stringify({
          type: 'strategy_control',
          action: newState ? 'start' : 'stop',
          strategy: strategyKey
        }));
      }

      // Update status
      setStrategyStatus(prev => ({
        ...prev,
        [strategyKey]: newState ? 'active' : 'inactive'
      }));

    } catch (error) {
      console.error(`Failed to toggle strategy ${strategyKey}:`, error);
      // Revert state on error
      setStrategyStates(prev => ({
        ...prev,
        [strategyKey]: !prev[strategyKey]
      }));
    }
  };

  const getStatusColor = (strategyKey) => {
    const status = strategyStatus[strategyKey];
    const hasError = strategyErrors[strategyKey];
    
    if (hasError || status === 'error') return 'text-red-600';
    if (status === 'active') return 'text-green-600';
    if (status === 'inactive') return 'text-slate-400';
    return 'text-slate-400';
  };

  const getStatusIcon = (strategyKey) => {
    const status = strategyStatus[strategyKey];
    const hasError = strategyErrors[strategyKey];
    
    if (hasError || status === 'error') return <AlertTriangle className="w-4 h-4" />;
    if (status === 'active') return <CheckCircle className="w-4 h-4" />;
    if (status === 'inactive') return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getConnectionColor = () => {
    switch (botStatus) {
      case 'connected': return 'bg-green-500/5 text-green-600 border border-green-500/20';
      case 'error': return 'bg-red-500/5 text-red-600 border border-red-500/20';
      default: return 'bg-slate-500/5 text-slate-600 border border-slate-500/20';
    }
  };

  const getConnectionDotColor = () => {
    switch (botStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getRealStrategyData = (strategyKey) => {
    const realData = realTimeData[strategyKey.replace('_', '-')];
    const performance = strategyPerformance[strategyKey.replace('_', '-')];
    const status = strategyStatus[strategyKey.replace('_', '-')];
    const error = strategyErrors[strategyKey.replace('_', '-')];

    return {
      performance: performance?.pnl || '0%',
      winRate: performance?.win_rate ? `${performance.win_rate}%` : '0%',
      sharpe: realData?.sharpe_ratio?.toFixed(2) || '0.00',
      status: status || 'inactive',
      totalTrades: performance?.total_trades || 0,
      avgReturn: performance?.avg_return?.toFixed(2) || '0.00',
      error: error
    };
  };

  const strategies = [
    {
      key: 'cumulative_delta',
      name: 'Cumulative Delta Strategy',
      description: 'Tracks cumulative delta to identify institutional order flow',
      icon: Triangle,
      category: 'Order Flow',
      complexity: 'Advanced'
    },
    {
      key: 'liquidation_detection',
      name: 'Liquidation Detection Strategy',
      description: 'Identifies forced liquidations and capitalizes on price dislocations',
      icon: AlertTriangle,
      category: 'Risk Management',
      complexity: 'Intermediate'
    },
    {
      key: 'momentum_breakout',
      name: 'Momentum Breakout Strategy',
      description: 'Captures momentum breakouts with volume confirmation',
      icon: Zap,
      category: 'Technical',
      complexity: 'Beginner'
    },
    {
      key: 'delta_divergence',
      name: 'Delta Divergence Strategy',
      description: 'Exploits divergences between price and delta flow',
      icon: GitBranch,
      category: 'Order Flow',
      complexity: 'Advanced'
    },
    {
      key: 'hvn_rejection',
      name: 'HVN Rejection Strategy',
      description: 'Trades rejections at High Volume Nodes (HVN)',
      icon: Shield,
      category: 'Volume Analysis',
      complexity: 'Intermediate'
    },
    {
      key: 'liquidity_absorption',
      name: 'Liquidity Absorption Strategy',
      description: 'Monitors liquidity absorption patterns for reversal signals',
      icon: Droplets,
      category: 'Volume Analysis',
      complexity: 'Advanced'
    },
    {
      key: 'liquidity_traps',
      name: 'Liquidity Traps Strategy',
      description: 'Identifies and avoids liquidity trap setups',
      icon: MousePointer,
      category: 'Risk Management',
      complexity: 'Intermediate'
    },
    {
      key: 'iceberg_detection',
      name: 'Iceberg Detection Strategy',
      description: 'Detects large hidden orders (icebergs) in the order book',
      icon: Eye,
      category: 'Order Flow',
      complexity: 'Advanced'
    },
    {
      key: 'stop_run_anticipation',
      name: 'Stop Run Anticipation Strategy',
      description: 'Anticipates and trades stop-loss sweeps',
      icon: StopCircle,
      category: 'Risk Management',
      complexity: 'Intermediate'
    },
    {
      key: 'lvn_breakout',
      name: 'LVN Breakout Strategy',
      description: 'Trades breakouts from Low Volume Nodes (LVN)',
      icon: BarChart2,
      category: 'Volume Analysis',
      complexity: 'Beginner'
    },
    {
      key: 'volume_imbalance',
      name: 'Volume Imbalance Strategy',
      description: 'Exploits volume imbalances for directional bias',
      icon: Scale,
      category: 'Volume Analysis',
      complexity: 'Intermediate'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Bot Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Strategy Analysis</h1>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getConnectionColor()}`}>
            <div className={`w-2 h-2 rounded-full ${getConnectionDotColor()}`}></div>
            <span>
              {botStatus === 'connected' ? 'Bot Connected' : 
               botStatus === 'error' ? 'Connection Error' : 'Bot Disconnected'}
            </span>
          </div>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          Last Update: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Strategy Performance Overview */}
      <div className="professional-card fade-in">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Strategy Performance Overview</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">Real-time strategy performance chart</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {botConnection ? 'Connected to local bot for live data' : 'Waiting for bot connection...'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Strategies - Enhanced Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {strategies.map((strategy, index) => {
          const isEnabled = strategyStates[strategy.key];
          const realData = getRealStrategyData(strategy.key);
          const hasError = realData.error;
          const status = realData.status;
          
          return (
            <div key={index} className={`professional-card fade-in ${
              isEnabled ? '' : 'opacity-60'
            }`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <strategy.icon className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{strategy.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)]">
                        {strategy.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)]">
                        {strategy.complexity}
                      </span>
                      {/* Status Indicator */}
                      <div className={`flex items-center space-x-1 ${getStatusColor(strategy.key)}`}>
                        {getStatusIcon(strategy.key)}
                        <span className="text-xs">
                          {hasError ? 'Error' : status === 'active' ? 'Active' : 'Idle'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleStrategy(strategy.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 ${
                      isEnabled ? 'bg-green-500' : 'bg-slate-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-3">{strategy.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Performance</p>
                  <p className="font-medium text-[var(--text-primary)]">{realData.performance}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Win Rate</p>
                  <p className="font-medium text-[var(--text-primary)]">{realData.winRate}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Sharpe Ratio</p>
                  <p className="font-medium text-[var(--text-primary)]">{realData.sharpe}</p>
                </div>
              </div>

              {/* Real-time Performance Metrics */}
              {status === 'active' && (
                <div className="mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="text-xs text-green-600 mb-1">Live Performance</div>
                  <div className="text-sm text-[var(--text-primary)]">
                    Win Rate: {realData.winRate} | 
                    P&L: {realData.performance} | 
                    Trades: {realData.totalTrades}
                  </div>
                  {realData.avgReturn !== '0.00' && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      Avg Return: {realData.avgReturn}%
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {hasError && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="text-xs text-red-600 mb-1">Error</div>
                  <div className="text-sm text-[var(--text-primary)]">{hasError}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time Trading Signals */}
      <div className="professional-card fade-in">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Real-time Trading Signals</h2>
        {tradingSignals.length > 0 ? (
          <div className="space-y-3">
            {tradingSignals.slice(0, 5).map((signal, index) => (
              <div key={index} className={`flex items-start p-3 border rounded-lg ${
                signal.side === 'buy' ? 'bg-green-500/5 border-green-500/20' :
                signal.side === 'sell' ? 'bg-red-500/5 border-red-500/20' :
                'bg-blue-500/5 border-blue-500/20'
              }`}>
                <Target className={`w-5 h-5 mr-3 mt-0.5 ${
                  signal.side === 'buy' ? 'text-green-600' :
                  signal.side === 'sell' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[var(--text-primary)] font-medium">
                      {signal.symbol} - {signal.side?.toUpperCase() || 'SIGNAL'}
                    </p>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {signal.strategy || 'Strategy'} | Price: ${signal.price || 'N/A'} | 
                    Confidence: {signal.confidence || 'N/A'}%
                  </p>
                  {signal.reason && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {signal.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">Waiting for trading signals...</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {botConnection ? 'Connected to real-time data stream' : 'Connecting to data stream...'}
            </p>
          </div>
        )}
      </div>

      {/* Real-time Market Data */}
      <div className="professional-card fade-in">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Live Market Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(realTimeData).slice(0, 6).map((strategy, index) => {
            const data = realTimeData[strategy];
            return (
              <div key={index} className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  {strategy.replace('-', ' ').toUpperCase()}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <span className={data?.status === 'active' ? 'text-green-600' : 'text-slate-400'}>
                      {data?.status || 'idle'}
                    </span>
                  </div>
                  {data?.last_signal && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Last Signal:</span>
                      <span className="text-[var(--text-primary)]">
                        {new Date(data.last_signal).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {data?.signal_count && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Signals:</span>
                      <span className="text-[var(--text-primary)]">{data.signal_count}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Integration Note */}
      <div className="professional-card fade-in">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-[var(--accent-primary)] mt-0.5" />
          <div>
            <h4 className="text-[var(--accent-primary)] font-medium mb-1">Dashboard Integration</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Strategy signals and performance data are automatically sent to the Dashboard for 
              trading signal generation and portfolio management. This monitor provides real-time 
              oversight of strategy health and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyAnalysis;
