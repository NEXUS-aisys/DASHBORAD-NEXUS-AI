import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Target, Brain, Signal, ArrowUp, Grid, Layers } from 'lucide-react';
import PortfolioChart from '../components/charts/PortfolioChart';
import CorrelationMatrix from '../components/charts/CorrelationMatrix';
import RiskAnalysisChart from '../components/charts/RiskAnalysisChart';
import StrategyComparisonChart from '../components/charts/StrategyComparisonChart';
import SymbolAnalysis from '../components/trading/SymbolAnalysis';
import EnhancedSymbolAnalysis from '../components/trading/EnhancedSymbolAnalysis';
import SignalsDashboard from '../components/trading/SignalsDashboard';
import InteractiveTradeSignals from '../components/trading/InteractiveTradeSignals';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('performance');
  
  useEffect(() => {
    // Handle URL parameters for tab selection
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['performance', 'risk', 'correlation', 'strategy', 'signals', 'dashboard', 'interactive'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const tabs = [
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'risk', label: 'Risk Analysis', icon: Target },
    { id: 'correlation', label: 'Correlation', icon: PieChart },
    { id: 'strategy', label: 'Strategy Comparison', icon: Brain },
    { id: 'signals', label: 'Trade Signals', icon: Signal },
    { id: 'dashboard', label: 'Signals Dashboard', icon: Grid },
    { id: 'interactive', label: 'Interactive Signals', icon: Layers }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <div className="space-y-6">
            <div className="professional-card fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="text-subheading mb-4">Portfolio Performance Analysis</h3>
              <PortfolioChart timeframe="1M" height={400} />
            </div>
            
            <div className="professional-card fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-subheading mb-4">Daily Returns Distribution</h3>
              <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-[var(--text-muted)]">Returns distribution chart</p>
                </div>
              </div>
            </div>
            
            {/* Rolling Metrics - Individual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="professional-card fade-in" style={{ animationDelay: '300ms' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">1.84</div>
                  <div className="text-sm text-[var(--text-muted)]">30-Day Sharpe Ratio</div>
                </div>
              </div>
              <div className="professional-card fade-in" style={{ animationDelay: '350ms' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">15.6%</div>
                  <div className="text-sm text-[var(--text-muted)]">30-Day Volatility</div>
                </div>
              </div>
              <div className="professional-card fade-in" style={{ animationDelay: '400ms' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--error)] mb-1">-4.2%</div>
                  <div className="text-sm text-[var(--text-muted)]">30-Day Max Drawdown</div>
                </div>
              </div>
              <div className="professional-card fade-in" style={{ animationDelay: '450ms' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--success)] mb-1">68.4%</div>
                  <div className="text-sm text-[var(--text-muted)]">30-Day Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'risk':
        return (
          <div className="professional-card fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-subheading mb-4">Risk Analysis & Value at Risk</h3>
            <RiskAnalysisChart height={400} />
          </div>
        );
        
      case 'correlation':
        return (
          <div className="professional-card fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-subheading mb-4">Asset Correlation Matrix</h3>
            <p className="text-body mb-4">
              Correlation analysis between major assets in the portfolio. Values range from -1 (perfect negative correlation) 
              to +1 (perfect positive correlation).
            </p>
            <CorrelationMatrix height={500} />
          </div>
        );
        
      case 'strategy':
        return (
          <div className="professional-card fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-subheading mb-4">Trading Strategy Performance Comparison</h3>
            <p className="text-body mb-4">
              Comprehensive comparison of different trading strategies across multiple performance metrics.
            </p>
            <StrategyComparisonChart height={400} />
          </div>
        );
        
      case 'signals':
        return (
          <div>
            <div className="professional-card fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center space-x-3 mb-4">
                <Signal className="w-5 h-5 text-[var(--accent-primary)]" />
                <h3 className="text-subheading">Futures Contract Analysis</h3>
              </div>
              <p className="text-body mb-6">
                Enter a futures contract symbol to get detailed AI analysis including market trends, support/resistance levels,
                technical indicators, and clear trading recommendations.
              </p>
              <EnhancedSymbolAnalysis />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="professional-card fade-in" style={{ animationDelay: '300ms' }}>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center mr-3">
                      <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <h4 className="text-lg font-medium">Technical Analysis</h4>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Trend:</span>
                      <span className="font-medium">Bullish</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">RSI:</span>
                      <span className="font-medium">68.2 (Overbought)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">MACD:</span>
                      <span className="font-medium">Bullish Crossover</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Volume:</span>
                      <span className="font-medium">Above Average</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="professional-card fade-in" style={{ animationDelay: '400ms' }}>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center mr-3">
                      <Signal className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <h4 className="text-lg font-medium">Signal</h4>
                  </div>
                  <div className="flex items-center justify-center my-3">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-[var(--success)]/20 text-[var(--success)]">
                      <ArrowUp className="w-5 h-5 mr-2" /> BUY
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Confidence:</span>
                      <span className="font-medium text-[var(--success)]">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Entry Point:</span>
                      <span className="font-medium">4,805 - 4,820</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Target:</span>
                      <span className="font-medium">4,900</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="professional-card fade-in" style={{ animationDelay: '500ms' }}>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--warning)]/10 flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-[var(--warning)]" />
                    </div>
                    <h4 className="text-lg font-medium">Risk Management</h4>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Stop Loss:</span>
                      <span className="font-medium text-[var(--error)]">4,765</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Risk/Reward:</span>
                      <span className="font-medium">1:2.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Position Size:</span>
                      <span className="font-medium">2% of Capital</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] text-sm">Max Risk:</span>
                      <span className="font-medium">1% per Trade</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'dashboard':
        return (
          <div className="fade-in" style={{ animationDelay: '100ms' }}>
            <SignalsDashboard />
          </div>
        );
        
      case 'interactive':
        return (
          <div className="fade-in" style={{ animationDelay: '100ms' }}>
            <InteractiveTradeSignals />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading">Advanced Analytics</h1>
          <p className="text-body">Deep dive into your trading performance and market analysis</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]">
          <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
          <span>Live Data • Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--border-primary)]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {renderTabContent()}
      </div>

      {/* Analytics Summary - Individual Cards */}
      {activeTab !== 'signals' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="professional-card fade-in" style={{ animationDelay: '500ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--accent-primary)] mb-1">
                1.84
              </div>
              <div className="text-caption">Sharpe Ratio</div>
            </div>
          </div>
          <div className="professional-card fade-in" style={{ animationDelay: '550ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--success)] mb-1">
                68.4%
              </div>
              <div className="text-caption">Win Rate</div>
            </div>
          </div>
          <div className="professional-card fade-in" style={{ animationDelay: '600ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--info)] mb-1">
                15.6%
              </div>
              <div className="text-caption">Volatility</div>
            </div>
          </div>
          <div className="professional-card fade-in" style={{ animationDelay: '650ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--warning)] mb-1">
                -4.2%
              </div>
              <div className="text-caption">Max Drawdown</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

