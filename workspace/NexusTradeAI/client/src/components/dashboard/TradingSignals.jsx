import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Zap, Clock } from 'lucide-react';
import apiService from '../../services/apiService';

const TradingSignals = ({ maxSignals = 6 }) => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSignals = async () => {
    try {
      const response = await apiService.getLatestSignals();
      // Handle both direct array and {data: array} response formats
      const signalsData = response.data || response;
      setSignals(signalsData.slice(0, maxSignals));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      setSignals([]);
    }
  };

  useEffect(() => {
    // Initial load
    setLoading(true);
    fetchSignals().finally(() => setLoading(false));

    // Set up WebSocket for real-time updates
    const ws = apiService.connectWebSocket();
    
    const handleRealtimeUpdate = (event) => {
      const { type, data } = event.detail;
      if (type === 'new_signal') {
        fetchSignals(); // Refresh signals when new ones arrive
      }
    };

    window.addEventListener('realtime-update', handleRealtimeUpdate);

    // Set up periodic refresh if auto-refresh is enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSignals, 30000); // Refresh every 30 seconds
    }

    return () => {
      window.removeEventListener('realtime-update', handleRealtimeUpdate);
      if (interval) clearInterval(interval);
      if (ws) ws.close();
    };
  }, [maxSignals, autoRefresh]);

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20';
      case 'SELL':
        return 'text-[var(--error)] bg-[var(--error)]/10 border-[var(--error)]/20';
      case 'HOLD':
        return 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20';
      default:
        return 'text-[var(--text-muted)] bg-[var(--bg-tertiary)] border-[var(--border-primary)]';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY':
        return TrendingUp;
      case 'SELL':
        return TrendingDown;
      case 'HOLD':
        return Minus;
      default:
        return Minus;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-[var(--success)]';
    if (confidence >= 60) return 'text-[var(--warning)]';
    return 'text-[var(--error)]';
  };

  if (loading) {
    return (
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <h3 className="text-subheading">AI Trading Signals</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-6 bg-[var(--bg-elevated)] rounded"></div>
                  <div className="w-16 h-4 bg-[var(--bg-elevated)] rounded"></div>
                </div>
                <div className="w-12 h-4 bg-[var(--bg-elevated)] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="professional-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <h3 className="text-subheading">AI Trading Signals</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-3 h-3 text-[var(--text-muted)] animate-spin" />
          <span className="text-xs text-[var(--text-muted)]">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Updating...'}
          </span>
        </div>
      </div>

      {/* Analysis Cards */}
      {/* The analysisData state and its related cards are removed as per the new_code */}
      
      <div className="space-y-3">
        {signals.map((signal, index) => {
          const SignalIcon = getSignalIcon(signal.signal);
          
          return (
            <div 
              key={`${signal.symbol}-${index}`}
              className="fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded border ${getSignalColor(signal.signal)}`}>
                      <div className="flex items-center space-x-1">
                        <SignalIcon className="w-3 h-3" />
                        <span>{signal.signal}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{signal.symbol}</div>
                      <div className="text-caption">${signal.price}</div>
                      {signal.priceChangePercent && (
                        <div className={`text-xs ${parseFloat(signal.priceChangePercent) >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                          {parseFloat(signal.priceChangePercent) >= 0 ? '+' : ''}{signal.priceChangePercent}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-medium ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence}%
                    </div>
                    <div className="text-caption">confidence</div>
                  </div>
                </div>
                
                <div className="text-xs text-[var(--text-secondary)] mt-2">
                  {signal.reason}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-primary)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Powered by AI Multi-Model Ensemble</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
            <span>Live Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;

