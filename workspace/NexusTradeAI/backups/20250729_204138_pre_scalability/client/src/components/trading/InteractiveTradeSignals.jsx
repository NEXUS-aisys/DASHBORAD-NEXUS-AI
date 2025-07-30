import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Signal, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Brain,
  Zap,
  Eye,
  Bell,
  Settings,
  Download,
  Share2,
  Database,
  Wifi,
  WifiOff,
  Activity,
  Layers,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import SymbolSelector from '../common/SymbolSelector';

// Context for sharing data between components
export const TradeSignalsContext = createContext();

export const useTradeSignals = () => {
  const context = useContext(TradeSignalsContext);
  if (!context) {
    throw new Error('useTradeSignals must be used within a TradeSignalsProvider');
  }
  return context;
};

const InteractiveTradeSignals = () => {
  const [symbol, setSymbol] = useState('');
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState(['ES', 'NQ', 'CL', 'GC', 'ZB']);
  const [performance, setPerformance] = useState(null);
  const [providers, setProviders] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [indicatorSignals, setIndicatorSignals] = useState([]);
  const [connectedComponents, setConnectedComponents] = useState([]);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);

  // Fetch trade signals for a single symbol
  const fetchSignals = async (symbolToFetch, refresh = false, notify = false) => {
    if (!symbolToFetch) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use test endpoint for development (no auth required)
      const response = await fetch(`/api/trading/signals/test/${symbolToFetch}?refresh=${refresh}&notify=${notify}`);
      
      const data = await response.json();
      
      if (data.success) {
        setSignals(data.data);
        // Notify connected components
        notifyConnectedComponents('signals_updated', data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch trade signals');
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch provider status
  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/trading/market/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data.providers);
        setCacheStats(data.data.cache);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  // Fetch indicator signals
  const fetchIndicatorSignals = async (symbol) => {
    try {
      const response = await fetch(`/api/trading/indicators/signals/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIndicatorSignals(data.data.signals);
      }
    } catch (err) {
      console.error('Error fetching indicator signals:', err);
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const response = await fetch('/api/trading/market/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchProviders(); // Refresh provider status
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };

  // Check Telegram status
  const checkTelegramStatus = async () => {
    try {
      const response = await fetch('/api/trading/telegram/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTelegramStatus(data.data);
        setTelegramEnabled(data.data.activated);
      }
    } catch (err) {
      console.error('Error checking Telegram status:', err);
    }
  };

  // Activate Telegram notifications
  const activateTelegram = async (phoneNumber) => {
    try {
      const response = await fetch('/api/trading/telegram/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTelegramEnabled(true);
        checkTelegramStatus();
      }
    } catch (err) {
      console.error('Error activating Telegram:', err);
    }
  };

  // Notify connected components
  const notifyConnectedComponents = (event, data) => {
    // This would be used to communicate with other components on the page
    window.dispatchEvent(new CustomEvent('tradeSignalsUpdate', {
      detail: { event, data, timestamp: new Date().toISOString() }
    }));
  };

  // Listen for events from other components
  useEffect(() => {
    const handleTradeSignalsUpdate = (event) => {
      const { event: eventType, data } = event.detail;
      
      switch (eventType) {
        case 'portfolio_update':
          // Update signals based on portfolio changes
          if (data.symbols) {
            setSelectedSymbols(data.symbols);
          }
          break;
        case 'watchlist_update':
          // Update watchlist
          setWatchlist(data.watchlist || []);
          break;
        case 'settings_update':
          // Update settings
          if (data.autoRefresh !== undefined) setAutoRefresh(data.autoRefresh);
          if (data.realTimeMode !== undefined) setRealTimeMode(data.realTimeMode);
          break;
        default:
          break;
      }
    };

    window.addEventListener('tradeSignalsUpdate', handleTradeSignalsUpdate);
    return () => window.removeEventListener('tradeSignalsUpdate', handleTradeSignalsUpdate);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && symbol) {
      const interval = setInterval(() => {
        fetchSignals(symbol, true);
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, symbol]);

  // Initial data fetch
  useEffect(() => {
    fetchProviders();
    checkTelegramStatus();
  }, []);

  // Fetch indicator signals when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchIndicatorSignals(symbol);
    }
  }, [symbol]);

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'HOLD':
        return <Minus className="w-5 h-5 text-yellow-500" />;
      default:
        return <Signal className="w-5 h-5 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProviderStatusIcon = (enabled, hasApiKey) => {
    if (!enabled) return <WifiOff className="w-4 h-4 text-gray-400" />;
    if (!hasApiKey) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  return (
    <TradeSignalsContext.Provider value={{
      signals,
      setSignals,
      symbol,
      setSymbol,
      loading,
      error,
      realTimeMode,
      setRealTimeMode,
      autoRefresh,
      setAutoRefresh,
      fetchSignals,
      notifyConnectedComponents
    }}>
      <div className={`space-y-6 ${expandedView ? 'fixed inset-0 z-50 bg-[var(--bg-primary)] p-6 overflow-auto' : ''}`}>
        {/* Header with Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading">Interactive Futures Signals</h2>
            <p className="text-body">Advanced analysis with multi-provider data and real-time updates</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpandedView(!expandedView)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                expandedView 
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]' 
                  : 'bg-[var(--accent-primary)] text-white'
              }`}
            >
              {expandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {expandedView ? 'Minimize' : 'Expand'}
            </button>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                realTimeMode 
                  ? 'bg-[var(--accent-primary)] text-white' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
              }`}
            >
              <Zap className="w-4 h-4 mr-2 inline" />
              {realTimeMode ? 'Live' : 'Real-time'}
            </button>
            <button
              onClick={() => fetchSignals(symbol, false, telegramEnabled)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                telegramEnabled 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
              }`}
              title={telegramEnabled ? 'Generate signal with Telegram notification' : 'Telegram notifications disabled'}
            >
              <Bell className="w-4 h-4 mr-2 inline" />
              {telegramEnabled ? 'Signal + Notify' : 'Telegram Off'}
            </button>
            <button 
              onClick={fetchProviders}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Provider Status */}
        {providers && providers.length > 0 && (
          <div className="professional-card">
            <div className="p-4 border-b border-[var(--border-primary)]">
              <h3 className="text-subheading flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Providers Status
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {providers.map((provider) => (
                  <div key={provider.name} className="flex items-center space-x-2 p-2 bg-[var(--bg-secondary)] rounded-lg">
                    {getProviderStatusIcon(provider.enabled, provider.hasApiKey)}
                    <div>
                      <div className="text-sm font-medium">{provider.displayName}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {provider.enabled ? (provider.hasApiKey ? 'Active' : 'No API Key') : 'Disabled'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cacheStats && (
                <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>Cache: {cacheStats.size} items</span>
                  <button 
                    onClick={clearCache}
                    className="px-3 py-1 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    Clear Cache
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <SymbolSelector
                selectedSymbol={symbol}
                onSymbolChange={setSymbol}
                placeholder="Search symbols (e.g., BTC, AAPL, NQ=F, ES=F)"
              />
            </div>
            <button 
              onClick={() => fetchSignals(symbol)} 
              disabled={!symbol || loading}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Signal className="w-4 h-4" />}
              Analyze
            </button>
            <button 
              onClick={() => fetchSignals(symbol, true)} 
              disabled={!symbol}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-secondary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
              />
              <label htmlFor="auto-refresh" className="text-sm text-[var(--text-primary)]">Auto-refresh</label>
            </div>
            
            <select 
              value={selectedProvider} 
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-40 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            >
              <option value="all">All Providers</option>
              {providers && providers.filter(p => p.enabled).map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-[var(--error)]" />
              <span className="text-[var(--error)]">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {signals && (
          <div className="space-y-6">
            {/* Signal Summary */}
            <div className="professional-card">
              <div className="p-4 border-b border-[var(--border-primary)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-subheading">{signals.symbol} Signal Summary</h3>
                  <div className="flex items-center space-x-2">
                    {getSignalIcon(signals.summary.signal)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      signals.summary.signal === 'BUY' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                      signals.summary.signal === 'SELL' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                      'bg-[var(--warning)]/20 text-[var(--warning)]'
                    }`}>
                      {signals.summary.signal}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs border border-[var(--border-primary)]">
                      {signals.marketData.provider || 'Unknown Provider'}
                    </span>
                    {signals.marketData.instrumentType === 'futures' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        FUTURES
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confidence</span>
                      <span className={`text-sm font-bold ${getConfidenceColor(signals.summary.confidence)}`}>
                        {signals.summary.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                      <div 
                        className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${signals.summary.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sentiment</span>
                      <span className="px-2 py-1 rounded-full text-xs border border-[var(--border-primary)] capitalize">
                        {signals.summary.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Risk/Reward */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk/Reward</span>
                      <span className="text-sm font-bold">{signals.summary.riskRewardRatio}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--border-primary)] my-4"></div>

                {/* Price Targets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Entry Price</div>
                    <div className="text-lg font-bold text-green-700">
                      ${signals.summary.entryPrice.min} - ${signals.summary.entryPrice.max}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Target Price</div>
                    <div className="text-lg font-bold text-blue-700">
                      ${signals.summary.targetPrice}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Stop Loss</div>
                    <div className="text-lg font-bold text-red-700">
                      ${signals.summary.stopLoss}
                    </div>
                  </div>
                </div>

                {/* Futures Contract Information */}
                {signals.marketData.instrumentType === 'futures' && signals.marketData.contractInfo && (
                  <div className="mt-4">
                    <div className="border-t border-[var(--border-primary)] my-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">Contract</div>
                        <div className="text-sm font-bold text-orange-700">
                          {signals.marketData.contractInfo.name}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">Exchange</div>
                        <div className="text-sm font-bold text-orange-700">
                          {signals.marketData.contractInfo.exchange}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">Tick Value</div>
                        <div className="text-sm font-bold text-orange-700">
                          ${signals.marketData.contractInfo.tickValue}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">Margin</div>
                        <div className="text-sm font-bold text-orange-700">
                          ${signals.marketData.contractInfo.margin?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Indicators */}
            {signals.technicalIndicators && (
              <div className="professional-card">
                <div className="p-4 border-b border-[var(--border-primary)]">
                  <h3 className="text-subheading flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Technical Indicators
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">RSI</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.rsi?.value?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">
                        {signals.technicalIndicators.rsi?.signal || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">MACD</div>
                      <div className="text-lg font-bold capitalize">{signals.technicalIndicators.macd?.signal || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {signals.technicalIndicators.macd?.histogram?.toFixed(3) || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">Stochastic</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.stochastic?.k?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">
                        {signals.technicalIndicators.stochastic?.signal || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">Volume</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.volumeAnalysis?.volumeRatio?.toFixed(2) || 'N/A'}x</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">
                        {signals.technicalIndicators.volumeAnalysis?.trend || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">Williams %R</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.williamsR?.value?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">
                        {signals.technicalIndicators.williamsR?.signal || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">CCI</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.cci?.value?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">
                        {signals.technicalIndicators.cci?.signal || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)]">ATR</div>
                      <div className="text-lg font-bold">{signals.technicalIndicators.atr?.value?.toFixed(2) || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {signals.technicalIndicators.atr?.volatility?.toFixed(2) || 'N/A'}% vol
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicator Signals */}
            {indicatorSignals.length > 0 && (
              <div className="professional-card">
                <div className="p-4 border-b border-[var(--border-primary)]">
                  <h3 className="text-subheading flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Indicator Signals
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {indicatorSignals.map((signal, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getSignalIcon(signal.signal)}
                          <span className="font-medium">{signal.indicator}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            signal.signal === 'BUY' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                            signal.signal === 'SELL' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                            'bg-[var(--warning)]/20 text-[var(--warning)]'
                          }`}>
                            {signal.signal}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs border border-[var(--border-primary)] capitalize">
                            {signal.strength}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <Bell className="w-4 h-4 mr-2 inline" />
                  Add Alert
                </button>
                <button className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export
                </button>
                <button className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <Share2 className="w-4 h-4 mr-2 inline" />
                  Share
                </button>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Updated: {new Date(signals.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!signals && !loading && (
          <div className="text-center py-12">
            <Signal className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">
              Enter a futures symbol to get comprehensive trade signals and analysis
            </p>
          </div>
        )}
      </div>
    </TradeSignalsContext.Provider>
  );
};

export default InteractiveTradeSignals; 