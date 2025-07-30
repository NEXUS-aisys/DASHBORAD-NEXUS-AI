import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Plus,
  Filter,
  Grid,
  List,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';
import SymbolSelector from '../common/SymbolSelector';

const SignalsDashboard = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterSignal, setFilterSignal] = useState('all');
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [selectedSymbols, setSelectedSymbols] = useState(['ES', 'NQ', 'CL', 'GC', 'ZB']);
  const [newSymbol, setNewSymbol] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);

  // Fetch batch signals
  const fetchBatchSignals = async (notify = false) => {
    if (selectedSymbols.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use test endpoint for development (no auth required)
      const response = await fetch('/api/trading/signals/test/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbols: selectedSymbols, notify })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSignals(data.data.filter(signal => !signal.error));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch signals');
      console.error('Error fetching batch signals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add symbol to watchlist
  const addSymbol = () => {
    if (newSymbol && !selectedSymbols.includes(newSymbol.toUpperCase())) {
      setSelectedSymbols([...selectedSymbols, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  // Remove symbol from watchlist
  const removeSymbol = (symbolToRemove) => {
    setSelectedSymbols(selectedSymbols.filter(s => s !== symbolToRemove));
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

  // Auto-refresh effect
  useEffect(() => {
    fetchBatchSignals();
    
    if (autoRefresh) {
      const interval = setInterval(() => fetchBatchSignals(telegramEnabled), 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [selectedSymbols, autoRefresh, telegramEnabled]);

  // Check Telegram status on mount
  useEffect(() => {
    checkTelegramStatus();
  }, []);

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    if (filterSignal !== 'all' && signal.summary?.signal !== filterSignal) return false;
    if (filterConfidence !== 'all') {
      const confidence = signal.summary?.confidence || 0;
      if (filterConfidence === 'high' && confidence < 80) return false;
      if (filterConfidence === 'medium' && (confidence < 60 || confidence >= 80)) return false;
      if (filterConfidence === 'low' && confidence >= 60) return false;
    }
    return true;
  });

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'HOLD':
        return <Minus className="w-4 h-4 text-yellow-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalCard = (signal) => (
    <div key={signal.symbol} className="professional-card h-full">
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{signal.symbol}</h3>
          <div className="flex items-center space-x-2">
            {getSignalIcon(signal.summary?.signal)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              signal.summary?.signal === 'BUY' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
              signal.summary?.signal === 'SELL' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
              'bg-[var(--warning)]/20 text-[var(--warning)]'
            }`}>
              {signal.summary?.signal || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Price Info */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--text-muted)]">Current Price</span>
          <span className="font-medium">${signal.marketData?.currentPrice?.toFixed(2) || 'N/A'}</span>
        </div>
        
        {/* Change */}
        {signal.marketData?.change && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">Change</span>
            <span className={`font-medium ${signal.marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${signal.marketData.change.toFixed(2)} ({signal.marketData.changePercent.toFixed(2)}%)
            </span>
          </div>
        )}

        {/* Confidence */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[var(--text-muted)]">Confidence</span>
            <span className={`text-sm font-medium ${getConfidenceColor(signal.summary?.confidence || 0)}`}>
              {signal.summary?.confidence || 0}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
            <div 
              className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${signal.summary?.confidence || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--text-muted)]">Sentiment</span>
          <span className="px-2 py-1 rounded-full text-xs border border-[var(--border-primary)] capitalize">
            {signal.summary?.sentiment || 'neutral'}
          </span>
        </div>

        {/* Price Targets */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Entry:</span>
            <span className="font-medium">${signal.summary?.entryPrice?.min?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Target:</span>
            <span className="font-medium text-green-600">${signal.summary?.targetPrice?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Stop:</span>
            <span className="font-medium text-red-600">${signal.summary?.stopLoss?.toFixed(2) || 'N/A'}</span>
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--text-muted)]">R/R Ratio</span>
          <span className="text-sm font-medium">{signal.summary?.riskRewardRatio || 'N/A'}</span>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-[var(--text-muted)] text-center pt-2 border-t border-[var(--border-primary)]">
          {new Date(signal.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading">Futures Signals Dashboard</h2>
          <p className="text-body">Monitor multiple futures contracts with real-time trade signals</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
            }`}
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Auto-refresh
          </button>
          <button 
            onClick={() => fetchBatchSignals(telegramEnabled)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              telegramEnabled 
                ? 'bg-green-600 text-white' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
            }`}
            title={telegramEnabled ? 'Refresh with Telegram notifications' : 'Telegram notifications disabled'}
          >
            <Bell className="w-4 h-4 mr-2 inline" />
            {telegramEnabled ? 'Refresh + Notify' : 'Telegram Off'}
          </button>
          <button 
            onClick={() => fetchBatchSignals(false)} 
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Symbol Management */}
        <div className="flex items-center space-x-2">
          <div className="max-w-xs">
            <SymbolSelector
              selectedSymbol={newSymbol}
              onSymbolChange={setNewSymbol}
              placeholder="Search symbols to add..."
          />
          </div>
          <button 
            onClick={addSymbol} 
            disabled={!newSymbol}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Current Symbols */}
        <div className="flex flex-wrap gap-2">
          {selectedSymbols.map(symbol => (
            <span 
              key={symbol} 
              className="px-3 py-1 rounded-full text-sm border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              onClick={() => removeSymbol(symbol)}
            >
              {symbol} ×
            </span>
          ))}
        </div>

        {/* Filters and View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select 
              value={filterSignal} 
              onChange={(e) => setFilterSignal(e.target.value)}
              className="w-32 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            >
              <option value="all">All Signals</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="HOLD">Hold</option>
            </select>

            <select 
              value={filterConfidence} 
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="w-32 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            >
              <option value="all">All Levels</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (60-79%)</option>
              <option value="low">Low (&lt;60%)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[var(--accent-primary)] text-white' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[var(--accent-primary)] text-white' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
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

      {/* Signals Grid/List */}
      {filteredSignals.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSignals.map(signal => getSignalCard(signal))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSignals.map(signal => (
              <div key={signal.symbol} className="professional-card">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold">{signal.symbol}</div>
                      <div className="flex items-center space-x-2">
                        {getSignalIcon(signal.summary?.signal)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          signal.summary?.signal === 'BUY' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                          signal.summary?.signal === 'SELL' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                          'bg-[var(--warning)]/20 text-[var(--warning)]'
                        }`}>
                          {signal.summary?.signal || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-medium">${signal.marketData?.currentPrice?.toFixed(2) || 'N/A'}</div>
                        <div className="text-sm text-[var(--text-muted)]">Current Price</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getConfidenceColor(signal.summary?.confidence || 0)}`}>
                          {signal.summary?.confidence || 0}%
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Confidence</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{signal.summary?.riskRewardRatio || 'N/A'}</div>
                        <div className="text-sm text-[var(--text-muted)]">R/R Ratio</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[var(--text-muted)]">
                          {new Date(signal.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">
            {loading ? 'Loading signals...' : 'No signals found. Try adding some futures symbols or adjusting filters.'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {signals.length > 0 && (
        <div className="professional-card">
          <div className="p-4 border-b border-[var(--border-primary)]">
            <h3 className="text-subheading flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Dashboard Summary
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--accent-primary)]">
                  {signals.length}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Total Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {signals.filter(s => s.summary?.signal === 'BUY').length}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Buy Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {signals.filter(s => s.summary?.signal === 'SELL').length}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Sell Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {signals.filter(s => s.summary?.signal === 'HOLD').length}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Hold Signals</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalsDashboard; 