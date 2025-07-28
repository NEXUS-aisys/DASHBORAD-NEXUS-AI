import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Wifi, 
  WifiOff,
  RefreshCw
} from 'lucide-react';
import SymbolSelector from '../components/common/SymbolSelector';
import apiService from '../services/apiService';

// Performance-optimized Symbol Card Component
const SymbolCard = React.memo(({ 
  symbol, 
  data, 
  animationClass, 
  isLiveMode, 
  onCardClick, 
  onRemove 
}) => {
  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove(symbol);
  }, [symbol, onRemove]);

  const handleClick = useCallback(() => {
    onCardClick(symbol);
  }, [symbol, onCardClick]);

  // Helper functions for formatting
  const formatPrice = useCallback((price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }, []);

  const formatVolume = useCallback((volume) => {
    if (typeof volume !== 'number') return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(0);
  }, []);

  // Memoize expensive calculations
  const priceDisplay = useMemo(() => {
    if (data && data.status === 'success' && data.data && data.data.price !== undefined) {
      return formatPrice(data.data.price);
    }
    return 'Loading...';
  }, [data, formatPrice]);

  const changeDisplay = useMemo(() => {
    if (data && data.status === 'success' && data.data) {
      const change = data.data.change;
      const changePercent = data.data.changePercent;
      
      if (change !== undefined && changePercent !== undefined) {
        return {
          change: typeof change === 'number' ? change.toFixed(2) : '0.00',
          changePercent: typeof changePercent === 'number' ? changePercent.toFixed(2) : '0.00',
          isPositive: change >= 0
        };
      }
    }
    return null;
  }, [data]);

  const volumeDisplay = useMemo(() => {
    if (data && data.status === 'success' && data.data && data.data.volume !== undefined) {
      return formatVolume(data.data.volume);
    }
    return null;
  }, [data, formatVolume]);

  return (
    <div
      onClick={handleClick}
      className={`trading-card group relative overflow-hidden rounded-xl border border-[var(--border-primary)] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] hover:from-[var(--bg-secondary)] hover:to-[var(--bg-tertiary)] transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${animationClass}`}
    >
      {/* Elegant Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="trading-symbol text-lg font-bold text-[var(--text-primary)] tracking-wide">{symbol}</h3>
          {isLiveMode && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[var(--success)] rounded-full live-pulse"></div>
              <span className="text-xs text-[var(--text-muted)] font-medium">LIVE</span>
            </div>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-200 hover:scale-110 performance-button"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Main Price Display */}
      <div className="px-4 pb-3">
        <div className={`trading-price text-2xl font-bold mb-2 transition-colors duration-300 ${animationClass}`}>
          <span className={data?.status === 'success' ? animationClass : 'text-[var(--text-muted)]'}>
            {priceDisplay}
          </span>
        </div>

        {/* Change Display */}
        {changeDisplay ? (
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 ${changeDisplay.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {changeDisplay.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {changeDisplay.isPositive ? '+' : ''}{changeDisplay.change}
              </span>
            </div>
            <div className={`text-sm font-medium ${changeDisplay.isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {changeDisplay.isPositive ? '+' : ''}{changeDisplay.changePercent}%
            </div>
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            {data?.error || data?.message || 'No data available'}
          </div>
        )}

        {/* Volume */}
        {volumeDisplay && (
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            Vol: {volumeDisplay}
          </div>
        )}

        {/* Data Source Indicator */}
        {data && data.status === 'success' && data.data && (
          <div className="mt-2 flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              data.data.isEmergencyFallback ? 'bg-[var(--error)]' :
              data.data.metadata?.isMockRealTime ? 'bg-[var(--warning)]' :
              data.provider === 'yahoo_finance' ? 'bg-[var(--success)]' :
              data.provider === 'polygon' ? 'bg-[var(--info)]' :
              data.provider === 'bybit' ? 'bg-[var(--accent-primary)]' :
              'bg-[var(--text-muted)]'
            }`}></div>
            <span className="text-xs text-[var(--text-muted)]">
              {data.data.isEmergencyFallback ? 'Fallback' :
               data.data.metadata?.isMockRealTime ? 'Simulated' :
               data.provider === 'yahoo_finance' ? 'Yahoo' :
               data.provider === 'polygon' ? 'Polygon' :
               data.provider === 'bybit' ? 'Bybit' :
               data.provider || 'Unknown'}
            </span>
          </div>
        )}

        {/* Live Indicator */}
        {isLiveMode && (
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-[var(--success)] rounded-full live-pulse"></div>
            <span className="text-xs text-[var(--text-muted)]">Live</span>
          </div>
        )}
      </div>

      {/* Subtle Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ultra-smooth"></div>
    </div>
  );
});

SymbolCard.displayName = 'SymbolCard';

// Performance-optimized Data Monitor Component
const DataMonitor = () => {
  const navigate = useNavigate();
  
  // State management with persistence
  const [monitoredSymbols, setMonitoredSymbols] = useState(() => {
    // Load saved symbols from localStorage on component mount
      const saved = localStorage.getItem('nexus_monitored_symbols');
    return saved ? JSON.parse(saved) : [];
  });

  const [symbolData, setSymbolData] = useState({});
  const [isLiveMode, setIsLiveMode] = useState(() => {
    // Load saved live mode preference
    const saved = localStorage.getItem('nexus_live_mode');
    return saved ? JSON.parse(saved) : true;
  });

  const [updateFrequency, setUpdateFrequency] = useState(() => {
    // Load saved frequency preference
    const saved = localStorage.getItem('nexus_update_frequency');
    return saved ? parseInt(saved) : 3000; // Conservative default to avoid rate limits
  });

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [priceAnimations, setPriceAnimations] = useState({});

  // Save symbols to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nexus_monitored_symbols', JSON.stringify(monitoredSymbols));
  }, [monitoredSymbols]);

  // Save live mode preference
  useEffect(() => {
    localStorage.setItem('nexus_live_mode', JSON.stringify(isLiveMode));
  }, [isLiveMode]);

  // Save frequency preference
  useEffect(() => {
    localStorage.setItem('nexus_update_frequency', updateFrequency.toString());
  }, [updateFrequency]);

  // Notification when symbols are loaded from storage
  useEffect(() => {
    const savedSymbols = localStorage.getItem('nexus_monitored_symbols');
    if (savedSymbols && JSON.parse(savedSymbols).length > 0) {
      console.log('📊 Loaded saved symbols from storage');
    }
  }, []);

  // Refs for performance
  const updateIntervalRef = useRef(null);
  const previousDataRef = useRef({});

  // Memoized helper functions
  const formatPrice = useCallback((price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }, []);

  const formatVolume = useCallback((volume) => {
    if (typeof volume !== 'number') return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(0);
  }, []);

  const getPriceAnimationClass = useCallback((symbol) => {
    return priceAnimations[symbol] || '';
  }, [priceAnimations]);

  const getConnectionStatusIcon = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-[var(--success)]" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-[var(--warning)] animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-[var(--error)]" />;
      default:
        return <Wifi className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  }, [connectionStatus]);

  const getConnectionStatusText = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }, [connectionStatus]);

  // Optimized data fetching with caching
  const fetchAllData = useCallback(async () => {
    if (monitoredSymbols.length === 0) return;

    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      const promises = monitoredSymbols.map(async (symbol) => {
        try {
          const response = await apiService.getMarketData(symbol);
          return { symbol, data: response };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return { symbol, data: { status: 'error', error: error.message } };
        }
      });

      const results = await Promise.allSettled(promises);
      const newData = {};
      const newAnimations = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { symbol, data } = result.value;
          newData[symbol] = data;

          // Check for price changes and set animations
          const previousData = previousDataRef.current[symbol];
          if (previousData && data.status === 'success' && previousData.status === 'success') {
            const currentPrice = data.data?.price;
            const previousPrice = previousData.data?.price;
            
            if (currentPrice !== undefined && previousPrice !== undefined) {
              if (currentPrice > previousPrice) {
                newAnimations[symbol] = 'animate-price-up';
              } else if (currentPrice < previousPrice) {
                newAnimations[symbol] = 'animate-price-down';
              }
            }
          }
        } else {
          // Handle rejected promises
          const symbol = monitoredSymbols[index];
          newData[symbol] = { status: 'error', error: result.reason?.message || 'Unknown error' };
        }
      });

      setSymbolData(prev => ({ ...prev, ...newData }));
      setPriceAnimations(newAnimations);
      setConnectionStatus('connected');

      // Clear animations after delay
      setTimeout(() => {
        setPriceAnimations({});
      }, 600);

      // Update previous data reference
      previousDataRef.current = newData;

    } catch (error) {
      console.error('Error fetching market data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, [monitoredSymbols]);

  // Optimized symbol management
  const addSymbol = useCallback((symbol) => {
    if (!symbol || monitoredSymbols.includes(symbol)) return;
    const newSymbols = [...monitoredSymbols, symbol];
    setMonitoredSymbols(newSymbols);
    // Immediately save to localStorage
    localStorage.setItem('nexus_monitored_symbols', JSON.stringify(newSymbols));
  }, [monitoredSymbols]);

  const removeSymbol = useCallback((symbol) => {
    const newSymbols = monitoredSymbols.filter(s => s !== symbol);
    setMonitoredSymbols(newSymbols);
    setSymbolData(prev => {
      const newData = { ...prev };
      delete newData[symbol];
      return newData;
    });
    setPriceAnimations(prev => {
      const newAnimations = { ...prev };
      delete newAnimations[symbol];
      return newAnimations;
    });
    // Immediately save to localStorage
    localStorage.setItem('nexus_monitored_symbols', JSON.stringify(newSymbols));
  }, [monitoredSymbols]);

  const clearAllSymbols = useCallback(() => {
    setMonitoredSymbols([]);
    setSymbolData({});
    setPriceAnimations({});
    localStorage.removeItem('nexus_monitored_symbols');
  }, []);

  const handleCardClick = useCallback((symbol) => {
    console.log(`Card clicked: ${symbol}`);
    // Navigate to Analysis page with symbol context
    navigate('/analysis', { state: { selectedSymbol: symbol } });
  }, [navigate]);

  // Memoized symbol cards for better performance
  const symbolCards = useMemo(() => {
    return monitoredSymbols.map((symbol) => (
      <SymbolCard
        key={symbol}
        symbol={symbol}
        data={symbolData[symbol]}
        animationClass={getPriceAnimationClass(symbol)}
        isLiveMode={isLiveMode}
        onCardClick={handleCardClick}
        onRemove={removeSymbol}
      />
    ));
  }, [monitoredSymbols, symbolData, getPriceAnimationClass, isLiveMode, handleCardClick, removeSymbol]);

  // Optimized live mode management
  useEffect(() => {
    if (isLiveMode && monitoredSymbols.length > 0) {
      fetchAllData();
      updateIntervalRef.current = setInterval(fetchAllData, updateFrequency);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isLiveMode, updateFrequency, monitoredSymbols.length, fetchAllData]);

  // Clear animations effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceAnimations({});
    }, 600);

    return () => clearTimeout(timer);
  }, [priceAnimations]);

  // Performance monitoring
  useEffect(() => {
    // renderCountRef.current += 1; // This line was removed as per the edit hint
    // if (renderCountRef.current % 100 === 0) { // This line was removed as per the edit hint
    //   console.log(`DataMonitor rendered ${renderCountRef.current} times`); // This line was removed as per the edit hint
    // } // This line was removed as per the edit hint
  });

  return (
    <div className="p-6 space-y-6 performance-optimized">
      {/* Performance-optimized Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Data Monitor
          </h1>
          <p className="text-[var(--text-muted)]">
            Real-time market data monitoring with enhanced performance
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] ultra-smooth">
            {getConnectionStatusIcon()}
            <span className="text-sm text-[var(--text-muted)]">
              {getConnectionStatusText()}
            </span>
          </div>

          {/* Live Mode Toggle */}
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 performance-button ${
              isLiveMode
                ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
                : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-muted)]'
            }`}
          >
            <Zap className={`w-4 h-4 ${isLiveMode ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isLiveMode ? 'Live' : 'Static'}
            </span>
          </button>

          {/* Update Frequency */}
          {isLiveMode && (
            <select
              value={updateFrequency}
              onChange={(e) => setUpdateFrequency(Number(e.target.value))}
              className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] ultra-smooth"
            >
              <option value={2000}>2s</option>
              <option value={3000}>3s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          )}
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SymbolSelector onSymbolChange={addSymbol} />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[var(--text-muted)]">
            {monitoredSymbols.length} symbols monitored
          </div>
          {monitoredSymbols.length > 0 && (
            <button
              onClick={clearAllSymbols}
              className="px-3 py-1 text-xs bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] rounded-lg hover:bg-[var(--error)]/20 transition-colors duration-200 performance-button"
              title="Clear all symbols"
            >
              Clear All
              </button>
          )}
        </div>
              </div>

      {/* Performance-optimized Data Grid */}
      <div className="space-y-3">
        {monitoredSymbols.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Symbols Added</h3>
            <p className="text-[var(--text-muted)] mb-4">Add symbols above to start monitoring live market data</p>
          </div>
        ) : (
          <>
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 text-[var(--accent-primary)] animate-spin mr-2" />
                <span className="text-sm text-[var(--text-muted)]">Updating market data...</span>
                </div>
              )}
            
            <div className="elegant-grid">
              {symbolCards}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(DataMonitor);
