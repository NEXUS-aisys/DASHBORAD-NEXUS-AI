import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, AlertTriangle, Save } from 'lucide-react';

const TradingPreferences = () => {
  const [preferences, setPreferences] = useState({
    riskTolerance: 'moderate',
    preferredMarkets: ['stocks', 'crypto'],
    maxPositionSize: 5,
    maxDailyLoss: 2,
    tradingHours: {
      start: '09:30',
      end: '16:00'
    },
    autoStopLoss: true,
    stopLossPercentage: 2,
    takeProfitPercentage: 5,
    enableAlerts: true,
    maxOpenPositions: 3
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('nexus_trading_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading trading preferences:', error);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketToggle = (market) => {
    setPreferences(prev => ({
      ...prev,
      preferredMarkets: prev.preferredMarkets.includes(market)
        ? prev.preferredMarkets.filter(m => m !== market)
        : [...prev.preferredMarkets, market]
    }));
  };

  const savePreferences = async () => {
    try {
      setSaveStatus('saving');
      // Save to localStorage
      localStorage.setItem('nexus_trading_preferences', JSON.stringify(preferences));
      // Here you would typically also save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const markets = [
    { id: 'stocks', label: 'Stocks', description: 'US and International stocks' },
    { id: 'crypto', label: 'Cryptocurrency', description: 'Bitcoin, Ethereum, and altcoins' },
    { id: 'forex', label: 'Forex', description: 'Currency pairs' },
    { id: 'futures', label: 'Futures', description: 'Commodity and index futures' },
    { id: 'options', label: 'Options', description: 'Stock and index options' }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Management */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Risk Management</h2>
          </div>
          <button
            onClick={savePreferences}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved!' : 
               saveStatus === 'error' ? 'Error!' : 'Save'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Risk Tolerance</label>
            <select
              value={preferences.riskTolerance}
              onChange={(e) => handleChange('riskTolerance', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Max Position Size (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={preferences.maxPositionSize}
              onChange={(e) => handleChange('maxPositionSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Max Daily Loss (%)</label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={preferences.maxDailyLoss}
              onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Stop Loss (%)</label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={preferences.stopLossPercentage}
              onChange={(e) => handleChange('stopLossPercentage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Take Profit (%)</label>
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={preferences.takeProfitPercentage}
              onChange={(e) => handleChange('takeProfitPercentage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Max Open Positions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={preferences.maxOpenPositions}
              onChange={(e) => handleChange('maxOpenPositions', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <input
            type="checkbox"
            id="autoStopLoss"
            checked={preferences.autoStopLoss}
            onChange={(e) => handleChange('autoStopLoss', e.target.checked)}
            className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
          />
          <label htmlFor="autoStopLoss" className="text-sm text-[var(--text-primary)]">
            Enable automatic stop-loss orders
          </label>
        </div>
      </div>

      {/* Preferred Markets */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Preferred Markets</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <div
              key={market.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                preferences.preferredMarkets.includes(market.id)
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-10'
                  : 'border-[var(--border-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
              }`}
              onClick={() => handleMarketToggle(market.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{market.label}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{market.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferredMarkets.includes(market.id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Hours */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trading Hours</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Start Time</label>
            <input
              type="time"
              value={preferences.tradingHours.start}
              onChange={(e) => handleChange('tradingHours', { ...preferences.tradingHours, start: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">End Time</label>
            <input
              type="time"
              value={preferences.tradingHours.end}
              onChange={(e) => handleChange('tradingHours', { ...preferences.tradingHours, end: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <input
            type="checkbox"
            id="enableAlerts"
            checked={preferences.enableAlerts}
            onChange={(e) => handleChange('enableAlerts', e.target.checked)}
            className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
          />
          <label htmlFor="enableAlerts" className="text-sm text-[var(--text-primary)]">
            Enable trading alerts and notifications
          </label>
        </div>
      </div>
    </div>
  );
};

export default TradingPreferences; 