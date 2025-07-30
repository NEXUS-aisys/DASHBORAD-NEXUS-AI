import React, { useState, useEffect } from 'react';
import { Grid, TrendingUp, AlertCircle, Zap, BarChart3, Clock, RefreshCw, Info, X, BookOpen, Target, Shield, TrendingDown } from 'lucide-react';

const CorrelationMatrix = () => {
  const [correlationData, setCorrelationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Futures contracts priority list
  const futuresContracts = ['NQ', 'ES', 'RTY', 'YM', 'GC', 'CL'];
  const stockAssets = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD'];

  // Generate correlation data for futures contracts
  const generateFuturesCorrelations = () => {
    const correlations = [];
    
    // NQ correlations (Nasdaq futures)
    correlations.push({ asset1: 'NQ', asset2: 'ES', correlation: 0.92, strength: 'Very Strong', category: 'futures' });
    correlations.push({ asset1: 'NQ', asset2: 'RTY', correlation: 0.78, strength: 'Strong', category: 'futures' });
    correlations.push({ asset1: 'NQ', asset2: 'YM', correlation: 0.85, strength: 'Strong', category: 'futures' });
    correlations.push({ asset1: 'NQ', asset2: 'GC', correlation: -0.15, strength: 'Weak', category: 'futures' });
    correlations.push({ asset1: 'NQ', asset2: 'CL', correlation: -0.08, strength: 'Very Weak', category: 'futures' });

    // ES correlations (S&P 500 futures)
    correlations.push({ asset1: 'ES', asset2: 'RTY', correlation: 0.89, strength: 'Strong', category: 'futures' });
    correlations.push({ asset1: 'ES', asset2: 'YM', correlation: 0.94, strength: 'Very Strong', category: 'futures' });
    correlations.push({ asset1: 'ES', asset2: 'GC', correlation: -0.12, strength: 'Weak', category: 'futures' });
    correlations.push({ asset1: 'ES', asset2: 'CL', correlation: -0.05, strength: 'Very Weak', category: 'futures' });

    // RTY correlations (Russell 2000 futures)
    correlations.push({ asset1: 'RTY', asset2: 'YM', correlation: 0.82, strength: 'Strong', category: 'futures' });
    correlations.push({ asset1: 'RTY', asset2: 'GC', correlation: -0.18, strength: 'Weak', category: 'futures' });
    correlations.push({ asset1: 'RTY', asset2: 'CL', correlation: -0.10, strength: 'Very Weak', category: 'futures' });

    // YM correlations (Dow futures)
    correlations.push({ asset1: 'YM', asset2: 'GC', correlation: -0.14, strength: 'Weak', category: 'futures' });
    correlations.push({ asset1: 'YM', asset2: 'CL', correlation: -0.06, strength: 'Very Weak', category: 'futures' });

    // GC correlations (Gold futures)
    correlations.push({ asset1: 'GC', asset2: 'CL', correlation: 0.45, strength: 'Moderate', category: 'futures' });

    // Add some stock correlations for comparison
    correlations.push({ asset1: 'AAPL', asset2: 'MSFT', correlation: 0.85, strength: 'Strong', category: 'stocks' });
    correlations.push({ asset1: 'TSLA', asset2: 'NVDA', correlation: 0.68, strength: 'Moderate', category: 'stocks' });

    return correlations;
  };

  const fetchCorrelationData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to local bot for correlation data
      // In real implementation, this would call your local bot API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateFuturesCorrelations();
      setCorrelationData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching correlation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelationData();
  }, [timeframe]);

  const getCorrelationColor = (correlation) => {
    const absCorr = Math.abs(correlation);
    if (absCorr > 0.8) return 'text-red-600';
    if (absCorr > 0.6) return 'text-orange-600';
    if (absCorr > 0.4) return 'text-yellow-600';
    if (absCorr > 0.2) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Very Strong': return 'bg-red-500/5 text-red-600 border border-red-500/20';
      case 'Strong': return 'bg-orange-500/5 text-orange-600 border border-orange-500/20';
      case 'Moderate': return 'bg-yellow-500/5 text-yellow-600 border border-yellow-500/20';
      case 'Weak': return 'bg-blue-500/5 text-blue-600 border border-blue-500/20';
      case 'Very Weak': return 'bg-green-500/5 text-green-600 border border-green-500/20';
      default: return 'bg-slate-500/5 text-slate-600 border border-slate-500/20';
    }
  };

  const futuresCorrelations = correlationData.filter(item => item.category === 'futures');
  const stockCorrelations = correlationData.filter(item => item.category === 'stocks');

  // Help Modal Component
  const HelpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Correlation Matrix Trading Guide</h2>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          <div className="space-y-6">
            {/* What is Correlation */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                What is Correlation?
              </h3>
              <p className="text-[var(--text-primary)] mb-3">
                Correlation measures how two assets move together. Values range from -1 to +1:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-red-500/5 border border-red-500/20 rounded p-3">
                  <div className="font-semibold text-red-600">+0.8 to +1.0</div>
                  <div className="text-red-600">Very Strong Positive</div>
                  <div className="text-[var(--text-secondary)] text-xs">Move together strongly</div>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded p-3">
                  <div className="font-semibold text-green-600">-0.2 to +0.2</div>
                  <div className="text-green-600">Very Weak/No Correlation</div>
                  <div className="text-[var(--text-secondary)] text-xs">Move independently</div>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded p-3">
                  <div className="font-semibold text-blue-600">-0.8 to -1.0</div>
                  <div className="text-blue-600">Very Strong Negative</div>
                  <div className="text-[var(--text-secondary)] text-xs">Move opposite directions</div>
                </div>
              </div>
            </div>

            {/* Trading Strategies */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-600 mb-2 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Trading Strategies
              </h3>
              <div className="space-y-4">
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">🎯 Hedging Strategy</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>When:</strong> High correlation (0.8+) between assets
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Example:</strong> Long NQ, Short ES (92% correlation)
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Result:</strong> If NQ drops 10%, ES drops ~9.2%, your short ES profits offset NQ losses
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">📊 Pairs Trading</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>When:</strong> High correlation assets diverge temporarily
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Example:</strong> NQ up 2%, ES up 0.5% (expect convergence)
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Action:</strong> Short NQ, Long ES, profit when correlation returns
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">🛡️ Diversification</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>When:</strong> Low correlation (0.2 or less) between assets
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Example:</strong> NQ + GC (-15% correlation) = True diversification
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Result:</strong> Portfolio risk reduced, better risk-adjusted returns
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Risk Management Rules
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Never trade high correlation assets with full position sizes</p>
                    <p className="text-[var(--text-secondary)] text-sm">ES-YM: 0.94 correlation = same bet, reduce size by 50%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Use correlations for position sizing</p>
                    <p className="text-[var(--text-secondary)] text-sm">Higher correlation = smaller position sizes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Monitor correlation changes</p>
                    <p className="text-[var(--text-secondary)] text-sm">Correlation shifts signal market regime changes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Examples */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-600 mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Practical Trading Examples
              </h3>
              <div className="space-y-4">
                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">📈 Bull Market Portfolio</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Position:</strong> 60% NQ, 40% ES
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Risk:</strong> 92% correlation = 92% same bet
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Better:</strong> 40% NQ, 30% ES, 30% GC (true diversification)
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">📉 Crisis Protection</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Normal:</strong> NQ-ES correlation: 0.92
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Crisis:</strong> Correlation drops to 0.5-0.7
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Action:</strong> Reduce tech exposure, increase defensive positions
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">⚡ Volatility Management</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>High Volatility:</strong> Correlations increase (everything moves together)
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    <strong>Low Volatility:</strong> Correlations decrease (more diversification opportunities)
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    <strong>Strategy:</strong> Adjust position sizes based on correlation regime
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-600 mb-2">💡 Quick Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-[var(--text-secondary)]">Use 30-day correlation for short-term trades</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-[var(--text-secondary)]">Use 1-year correlation for portfolio construction</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-[var(--text-secondary)]">Negative correlations are rare but valuable</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-[var(--text-secondary)]">Correlations change over time - monitor regularly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Correlation Matrix</h1>
          <p className="text-[var(--text-secondary)] mt-1">Futures Contracts Focus - NQ, ES, RTY Priority</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500/5 text-purple-600 border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>How to Use</span>
          </button>
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="365">1 Year</option>
          </select>
          <button
            onClick={fetchCorrelationData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/5 text-blue-600 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
          <Clock className="w-4 h-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Futures Contracts Correlation Matrix */}
      <div className="professional-card fade-in">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Futures Contracts Correlation</h2>
        </div>
        
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 animate-spin" />
              <p className="text-[var(--text-secondary)]">Loading correlation data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {futuresCorrelations.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-[var(--text-primary)]">
                    {item.asset1} - {item.asset2}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">Futures</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(item.strength)}`}>
                    {item.strength}
                  </span>
                  <span className={`font-bold text-lg ${getCorrelationColor(item.correlation)}`}>
                    {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* High Correlation Alerts - Futures Focus */}
      <div className="professional-card fade-in" style={{ animationDelay: `100ms` }}>
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">High Correlation Alerts</h2>
        </div>
        <div className="space-y-3">
          {futuresCorrelations
            .filter(item => Math.abs(item.correlation) > 0.8)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">{item.asset1} - {item.asset2}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-600 font-medium">{item.strength}</span>
                  <span className="font-bold text-red-600">
                    {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Correlation Insights */}
      <div className="professional-card fade-in" style={{ animationDelay: `200ms` }}>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Futures Correlation Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <h3 className="font-medium text-green-600 mb-2">NQ-ES Correlation</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">0.92</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Very Strong - Consider hedging</p>
          </div>
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <h3 className="font-medium text-orange-600 mb-2">ES-YM Correlation</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">0.94</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">Very Strong - High risk concentration</p>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <h3 className="font-medium text-blue-600 mb-2">GC-CL Correlation</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">0.45</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Moderate - Good diversification</p>
          </div>
        </div>
      </div>

      {/* Stock Correlations (Secondary) */}
      <div className="professional-card fade-in" style={{ animationDelay: `300ms` }}>
        <div className="flex items-center space-x-2 mb-4">
          <Grid className="w-5 h-5 text-[var(--text-secondary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Stock Correlations (Reference)</h2>
        </div>
        <div className="space-y-3">
          {stockCorrelations.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg opacity-75">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="font-medium text-[var(--text-secondary)]">
                  {item.asset1} - {item.asset2}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">Stocks</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[var(--text-secondary)] text-sm">{item.strength}</span>
                <span className="font-bold text-[var(--text-secondary)]">
                  {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && <HelpModal />}
    </div>
  );
};

export default CorrelationMatrix;
