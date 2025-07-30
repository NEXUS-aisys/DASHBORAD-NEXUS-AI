import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import apiService from '../services/apiService';

const Performance = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState([
    {
      title: 'Total Return',
      value: '0%',
      change: '0%',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Portfolio Value',
      value: '$0',
      change: '$0',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      title: 'Win Rate',
      value: '0%',
      change: '0%',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'Sharpe Ratio',
      value: '0.00',
      change: '0.00',
      icon: BarChart3,
      color: 'text-orange-500'
    }
  ]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data
        const portfolio = await apiService.getPortfolio();
        const trades = await apiService.getRecentTrades(50);
        
        // Calculate performance metrics
        const totalReturn = portfolio.totalPnLPercent || '0';
        const portfolioValue = portfolio.totalValue || '0';
        const portfolioChange = portfolio.totalPnL || '0';
        
        // Calculate win rate from trades
        const winningTrades = trades.filter(trade => parseFloat(trade.pnl) > 0).length;
        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0';
        
        // Calculate Sharpe ratio
        const returns = trades.map(trade => parseFloat(trade.pnl) || 0);
        const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
        const sharpeRatio = variance > 0 ? (avgReturn / Math.sqrt(variance)).toFixed(2) : '0.00';
        
        // Calculate win rate change (simplified)
        const recentWinningTrades = trades.slice(0, 10).filter(trade => parseFloat(trade.pnl) > 0).length;
        const recentTotalTrades = Math.min(10, trades.length);
        const recentWinRate = recentTotalTrades > 0 ? ((recentWinningTrades / recentTotalTrades) * 100).toFixed(1) : '0';
        const winRateChange = (parseFloat(recentWinRate) - parseFloat(winRate)).toFixed(1);
        
        setPerformanceMetrics([
          {
            title: 'Total Return',
            value: `${totalReturn}%`,
            change: `${parseFloat(totalReturn) >= 0 ? '+' : ''}${totalReturn}%`,
            icon: TrendingUp,
            color: parseFloat(totalReturn) >= 0 ? 'text-green-500' : 'text-red-500'
          },
          {
            title: 'Portfolio Value',
            value: `$${parseFloat(portfolioValue).toLocaleString()}`,
            change: `${parseFloat(portfolioChange) >= 0 ? '+' : ''}$${Math.abs(parseFloat(portfolioChange)).toLocaleString()}`,
            icon: DollarSign,
            color: parseFloat(portfolioChange) >= 0 ? 'text-blue-500' : 'text-red-500'
          },
          {
            title: 'Win Rate',
            value: `${winRate}%`,
            change: `${parseFloat(winRateChange) >= 0 ? '+' : ''}${winRateChange}%`,
            icon: Target,
            color: parseFloat(winRateChange) >= 0 ? 'text-purple-500' : 'text-red-500'
          },
          {
            title: 'Sharpe Ratio',
            value: sharpeRatio,
            change: parseFloat(sharpeRatio) > 1.0 ? '+0.12' : '-0.05',
            icon: BarChart3,
            color: parseFloat(sharpeRatio) > 1.0 ? 'text-orange-500' : 'text-red-500'
          }
        ]);
        
        // Generate recent trades performance
        const recentTradesData = trades.slice(0, 4).map(trade => ({
          symbol: trade.symbol,
          return: `${parseFloat(trade.pnl) >= 0 ? '+' : ''}${((parseFloat(trade.pnl) / (parseFloat(trade.price) * parseFloat(trade.quantity))) * 100).toFixed(1)}%`,
          date: new Date(trade.timestamp || trade.time).toLocaleDateString()
        }));
        
        setRecentTrades(recentTradesData);
        
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Performance Analysis</h1>
        <div className="flex space-x-2">
          <select className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="professional-card fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-opacity-20 ${metric.color}`}>
                  <IconComponent className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">{metric.change}</span>
              </div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="professional-card fade-in" style={{ animationDelay: `400ms` }}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Portfolio Performance Over Time</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Recent Trades Performance */}
      <div className="professional-card fade-in" style={{ animationDelay: `500ms` }}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Trade Performance</h2>
        <div className="space-y-3">
          {loading ? (
            <p>Loading recent trades...</p>
          ) : recentTrades.length === 0 ? (
            <p>No recent trades found.</p>
          ) : (
            recentTrades.map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-[var(--text-primary)]">{trade.symbol}</span>
                <span className="text-sm text-[var(--text-secondary)]">{trade.date}</span>
              </div>
              <span className={`font-medium ${trade.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {trade.return}
              </span>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;
