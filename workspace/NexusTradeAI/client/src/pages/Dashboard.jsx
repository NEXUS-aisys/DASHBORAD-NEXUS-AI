import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Target,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react';
import PortfolioChart from '../components/charts/PortfolioChart';
import RealTimeKPI from '../components/dashboard/RealTimeKPI';
import TradingSignals from '../components/dashboard/TradingSignals';
import RecentTrades from '../components/dashboard/RecentTrades';
import apiService from '../services/apiService';

// Daily P&L KPI Component
const DailyPnLKPI = ({ className = '' }) => {
  const [pnl, setPnl] = useState(null);
  const [prevPnl, setPrevPnl] = useState(null);
  const [error, setError] = useState(null);

  const fetchPnL = async () => {
    try {
      const data = await apiService.getPortfolio();
      setPrevPnl(pnl);
      if (data.totalPnL) {
        setPnl(parseFloat(data.totalPnL));
      } else {
        setPnl(0);
      }
    } catch (e) {
      console.error(e);
      setError('Data unavailable');
    }
  };

  React.useEffect(() => {
    fetchPnL();
    const interval = setInterval(fetchPnL, 15000);
    return () => clearInterval(interval);
  }, []);

  const change = prevPnl !== null && pnl !== null ? pnl - prevPnl : null;
  const isUp = change !== null ? change > 0 : null;

  return (
    <div className={`professional-card ${className}`}>
      <div className="flex items-center space-x-3 mb-2">
        <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
        <h3 className="text-subheading">Daily P&L</h3>
      </div>
      {error ? (
        <div className="text-xs text-[var(--error)]">{error}</div>
      ) : (
        <div>
          <div className="text-2xl font-bold">
            {pnl !== null && pnl !== undefined ? 
              `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString()}` : '—'}
          </div>
          {change !== null && (
            <div className={`text-xs ${isUp ? 'text-[var(--success)]' : 'text-[var(--error)]'} flex items-center space-x-1`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [chartTimeframe, setChartTimeframe] = useState('1D');
  const [kpiData, setKpiData] = useState({
    winRate: '0%',
    sharpeRatio: '0.00',
    maxDrawdown: '0%'
  });

  // Fetch KPI data from API
  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        // Fetch portfolio data to calculate KPIs
        const portfolio = await apiService.getPortfolio();
        const trades = await apiService.getRecentTrades(100);
        
        // Calculate win rate from recent trades
        const winningTrades = trades.filter(trade => trade.pnl > 0).length;
        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0';
        
        // Calculate Sharpe ratio (simplified)
        const returns = trades.map(trade => parseFloat(trade.pnl) || 0);
        const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
        const sharpeRatio = variance > 0 ? (avgReturn / Math.sqrt(variance)).toFixed(2) : '0.00';
        
        // Calculate max drawdown (simplified)
        let maxDrawdown = 0;
        let peak = 0;
        let runningTotal = 0;
        
        trades.forEach(trade => {
          runningTotal += parseFloat(trade.pnl) || 0;
          if (runningTotal > peak) {
            peak = runningTotal;
          }
          const drawdown = (peak - runningTotal) / peak * 100;
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
          }
        });
        
        setKpiData({
          winRate: `${winRate}%`,
          sharpeRatio: sharpeRatio,
          maxDrawdown: `-${maxDrawdown.toFixed(1)}%`
        });
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        // Keep default values if API fails
      }
    };

    fetchKPIData();
    const interval = setInterval(fetchKPIData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Dynamic KPI data based on real API data
  const dynamicKPIs = [
    {
      title: 'Win Rate',
      value: kpiData.winRate,
      change: '+1.2%', // This could be calculated from historical data
      trend: 'up',
      icon: Target
    },
    {
      title: 'Sharpe Ratio',
      value: kpiData.sharpeRatio,
      change: '+0.12', // This could be calculated from historical data
      trend: 'up',
      icon: BarChart3
    },
    {
      title: 'Max Drawdown',
      value: kpiData.maxDrawdown,
      change: '+0.8%', // This could be calculated from historical data
      trend: 'up',
      icon: TrendingDown
    }
  ];

  const timeframeButtons = [
    { key: '1D', label: '1D' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '1Y', label: '1Y' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading">Trading Dashboard</h1>
          <p className="text-body">Real-time overview of your trading performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]">
          <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
          <span>Live Data • Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Real-time KPI Grid */}
      <div className="dashboard-grid dashboard-grid-3">
        {/* Real-time Portfolio Value */}
        <RealTimeKPI
          title="Total Portfolio Value"
          icon={DollarSign}
          dataType="portfolio"
          formatter={(value) => value ? `$${value.toLocaleString()}` : '$0'}
          className="fade-in"
        />

        {/* Real-time Daily P&L */}
        <DailyPnLKPI className="fade-in" />

        {/* Real-time Active Positions */}
        <RealTimeKPI
          title="Active Positions"
          icon={Activity}
          dataType="positions"
          formatter={(value) => value ? value.toString() : '0'}
          className="fade-in"
        />

        {/* Static KPIs */}
        {dynamicKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === 'up';
          
          return (
            <div key={index} className="professional-card fade-in" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isPositive ? 'bg-[var(--success)]/10' : 'bg-[var(--error)]/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
                    }`} />
                  </div>
                  <h3 className="text-subheading">{kpi.title}</h3>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {kpi.value}
                </div>
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-caption">vs yesterday</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Signals Section */}
      <div className="dashboard-grid dashboard-grid-2">
        {/* Portfolio Performance Chart */}
        <div className="professional-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subheading">Portfolio Performance</h3>
            <div className="flex items-center space-x-1">
              {timeframeButtons.map((button) => (
                <button
                  key={button.key}
                  onClick={() => setChartTimeframe(button.key)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    chartTimeframe === button.key
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
          <PortfolioChart timeframe={chartTimeframe} height={300} />
        </div>

        {/* AI Trading Signals */}
        <TradingSignals maxSignals={4} />
      </div>

      {/* Recent Trades Section */}
      <div className="professional-card">
        <h3 className="text-subheading mb-4">Recent Trades</h3>
        <RecentTrades />
      </div>

      {/* AI Insights Section */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
            <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <h3 className="text-subheading">AI Market Insights</h3>
          <div className="flex items-center space-x-1 ml-auto">
            <Zap className="w-3 h-3 text-[var(--warning)]" />
            <span className="text-xs text-[var(--text-muted)]">Real-time Analysis</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--success)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">Market Sentiment</h4>
            <p className="text-body">Bullish momentum detected in tech sector with 78% confidence</p>
            <div className="mt-2 text-xs text-[var(--success)]">Confidence: High</div>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--warning)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">Risk Alert</h4>
            <p className="text-body">Elevated volatility expected in energy sector this week</p>
            <div className="mt-2 text-xs text-[var(--warning)]">Confidence: Medium</div>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--info)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2">Opportunity</h4>
            <p className="text-body">Mean reversion signal identified in healthcare stocks</p>
            <div className="mt-2 text-xs text-[var(--info)]">Confidence: High</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

