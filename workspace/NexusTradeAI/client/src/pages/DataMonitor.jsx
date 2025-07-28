import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, X, BarChart3, DollarSign } from 'lucide-react';
import apiService from '../services/apiService';
import SymbolSelector from '../components/common/SymbolSelector';

const DataMonitor = () => {
  const [symbolData, setSymbolData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const expandedRef = useRef(null);
  const [monitoredSymbols, setMonitoredSymbols] = useState(() => {
    // Try to load from localStorage first, fallback to default symbols
    try {
      const saved = localStorage.getItem('nexus_monitored_symbols');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Initializing with saved symbols:', parsed);
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading initial symbols:', error);
    }
    // Default symbols if nothing saved
    const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL'];
    console.log('Initializing with default symbols:', defaultSymbols);
    return defaultSymbols;
  });



  // Save monitored symbols to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_monitored_symbols', JSON.stringify(monitoredSymbols));
    console.log('Saved monitored symbols to localStorage:', monitoredSymbols);
  }, [monitoredSymbols]);

  const fetchSymbolData = async (symbol) => {
    try {
      const data = await apiService.getMarketData(symbol);
      const latestData = data[data.length - 1];
      if (!latestData) throw new Error('No data returned');

      return {
        symbol,
        price: latestData.close,
        open: latestData.open,
        high: latestData.high,
        low: latestData.low,
        volume: latestData.volume,
        change: latestData.close - latestData.open,
        changePercent: ((latestData.close - latestData.open) / latestData.open) * 100,
        timestamp: new Date(latestData.date).toISOString(),
        status: 'success',
        fullData: data
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return {
        symbol, price: 0, status: 'error', error: error.message
      };
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setConnectionStatus('connecting');
    try {
      const results = await Promise.all(monitoredSymbols.map(fetchSymbolData));
      const newData = {};
      results.forEach(result => { newData[result.symbol] = result; });
      setSymbolData(newData);
      setLastUpdate(new Date());
      setConnectionStatus(results.some(r => r.status === 'success') ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [monitoredSymbols]);

  const handleCardClick = (symbol) => {
    const data = symbolData[symbol];
    if (data && data.status === 'success') {
      setExpandedSymbol(symbol);
      setExpandedData(data);
    }
  };

  const handleBackToGrid = () => {
    setExpandedSymbol(null);
    setExpandedData(null);
  };

  const addSymbol = (symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return;
    
    console.log('Adding symbol:', upperSymbol, 'Current symbols:', monitoredSymbols);
    if (!monitoredSymbols.includes(upperSymbol)) {
      setMonitoredSymbols(prev => {
        const newSymbols = [...prev, upperSymbol];
        console.log('Updated symbols:', newSymbols);
        return newSymbols;
      });
      // Immediately fetch data for the new symbol
      fetchSymbolData(upperSymbol).then(data => {
        setSymbolData(prev => ({ ...prev, [upperSymbol]: data }));
      }).catch(error => {
        console.error('Error fetching data for new symbol:', upperSymbol, error);
      });
    } else {
      console.log('Symbol already exists:', upperSymbol);
    }
  };

  const removeSymbol = (symbol) => {
    console.log('Removing symbol:', symbol, 'Current symbols:', monitoredSymbols);
    setMonitoredSymbols(prev => {
      const newSymbols = prev.filter(s => s !== symbol);
      console.log('After removal:', newSymbols);
      return newSymbols;
    });
  };

  // Click outside handler for expanded view
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        handleBackToGrid();
      }
    };

    if (expandedSymbol) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedSymbol]);

  const formatPrice = (price) => price > 0 ? `$${price.toFixed(2)}` : 'N/A';

  if (expandedSymbol && expandedData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detailed Analysis - {expandedSymbol}</h1>
            <p className="text-[var(--text-muted)]">Click outside or "Back" to return to grid</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleBackToGrid}
              className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Back to Grid
            </button>
          </div>
        </div>

        {/* Main Price Display */}
        <div className="professional-card" ref={expandedRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">{expandedSymbol}</h2>
            <div className="flex items-center space-x-2">
              {expandedData.change >= 0 ? (
                <TrendingUp className="w-8 h-8 text-[var(--success)]" />
              ) : (
                <TrendingDown className="w-8 h-8 text-[var(--error)]" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-5xl font-bold text-[var(--text-primary)] mb-2">
                {formatPrice(expandedData.price)}
              </div>
              <div className="text-lg text-[var(--text-muted)]">Current Price</div>
            </div>
            
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className={`text-3xl font-semibold mb-2 ${expandedData.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {expandedData.change >= 0 ? '+' : ''}${expandedData.change.toFixed(2)}
              </div>
              <div className="text-lg text-[var(--text-muted)]">Change ($)</div>
            </div>
            
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className={`text-3xl font-semibold mb-2 ${expandedData.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {expandedData.change >= 0 ? '+' : ''}{expandedData.changePercent.toFixed(2)}%
              </div>
              <div className="text-lg text-[var(--text-muted)]">Change (%)</div>
            </div>
            
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-3xl font-semibold text-[var(--text-primary)] mb-2">
                {(expandedData.volume || 0).toLocaleString()}
              </div>
              <div className="text-lg text-[var(--text-muted)]">Volume</div>
            </div>
          </div>
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="professional-card text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[var(--success)] mr-2" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Day High</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {formatPrice(expandedData.high)}
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-2">
              Highest price today
            </div>
          </div>

          <div className="professional-card text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-[var(--error)] mr-2" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Day Low</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {formatPrice(expandedData.low)}
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-2">
              Lowest price today
            </div>
          </div>

          <div className="professional-card text-center">
            <div className="flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-[var(--info)] mr-2" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Opening Price</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {formatPrice(expandedData.open)}
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-2">
              Market open price
            </div>
          </div>

          <div className="professional-card text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-[var(--warning)] mr-2" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Trading Volume</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {(expandedData.volume || 0).toLocaleString()}
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-2">
              Shares traded today
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="professional-card">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Market Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-sm text-[var(--text-muted)] mb-2">Daily Range</div>
              <div className="text-xl font-semibold text-[var(--text-primary)]">
                {formatPrice(expandedData.low)} - {formatPrice(expandedData.high)}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Range: ${(expandedData.high - expandedData.low).toFixed(2)}
              </div>
            </div>
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-sm text-[var(--text-muted)] mb-2">Market Movement</div>
              <div className={`text-xl font-semibold ${expandedData.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {expandedData.change >= 0 ? '+' : ''}{expandedData.changePercent.toFixed(2)}%
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Since market open
              </div>
            </div>
            <div className="text-center p-6 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-sm text-[var(--text-muted)] mb-2">Market Status</div>
              <div className="text-xl font-semibold text-[var(--success)]">
                Active
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Live trading
              </div>
            </div>
          </div>
        </div>

        {/* Price Analysis */}
        <div className="professional-card">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Price Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Current Price:</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatPrice(expandedData.price)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Opening Price:</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatPrice(expandedData.open)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Day's Range:</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatPrice(expandedData.low)} - {formatPrice(expandedData.high)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Volume:</span>
                <span className="font-semibold text-[var(--text-primary)]">{(expandedData.volume || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Change:</span>
                <span className={`font-semibold ${expandedData.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {expandedData.change >= 0 ? '+' : ''}${expandedData.change.toFixed(2)} ({expandedData.change >= 0 ? '+' : ''}{expandedData.changePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-primary)]">
                <span className="text-[var(--text-secondary)]">Last Updated:</span>
                <span className="font-semibold text-[var(--text-primary)]">{lastUpdate?.toLocaleTimeString() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Real-Time Data Monitor</h1>
          <p className="text-[var(--text-muted)]">Live monitoring of market data - Click any card for detailed analysis</p>
        </div>
        <div className="flex items-center gap-4 w-full max-w-xs">
          <SymbolSelector
            selectedSymbol=""
            onSymbolChange={addSymbol}
            placeholder="Add new symbol..."
          />
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-sm text-[var(--text-muted)]">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {monitoredSymbols.map((symbol) => {
          const data = symbolData[symbol];
          const isPositive = data && data.change > 0;
          
          return (
            <div
              key={symbol}
              className="professional-card cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 relative"
              onClick={() => handleCardClick(symbol)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(symbol);
                }}
                className="absolute top-2 right-2 p-1 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--error)]" />
              </button>
              <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">{symbol}</h3>
                <div className={`w-2 h-2 rounded-full ${data?.status === 'success' ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--error)]'}`} />
              </div>

              {!data || (loading && !data.price) ? (
                <div className="animate-pulse h-24 bg-[var(--bg-tertiary)] rounded-md"></div>
              ) : data.status === 'error' ? (
                <div className="text-xs text-[var(--error)]">Error: {data.error}</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{formatPrice(data.price)}</div>
                  <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] space-y-1 pt-2 border-t border-[var(--border-primary)]">
                    <div className="flex justify-between"><span>Open:</span><span>{formatPrice(data.open)}</span></div>
                    <div className="flex justify-between"><span>High:</span><span>{formatPrice(data.high)}</span></div>
                    <div className="flex justify-between"><span>Low:</span><span>{formatPrice(data.low)}</span></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataMonitor;
