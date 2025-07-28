import React from 'react';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';

const Performance = () => {
  const performanceMetrics = [
    {
      title: 'Total Return',
      value: '+24.5%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Portfolio Value',
      value: '$124,750',
      change: '+$3,250',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      title: 'Win Rate',
      value: '68.4%',
      change: '+1.2%',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'Sharpe Ratio',
      value: '1.84',
      change: '+0.12',
      icon: BarChart3,
      color: 'text-orange-500'
    }
  ];

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
          {[
            { symbol: 'AAPL', return: '+5.2%', date: '2024-01-15' },
            { symbol: 'TSLA', return: '-2.1%', date: '2024-01-14' },
            { symbol: 'MSFT', return: '+3.8%', date: '2024-01-13' },
            { symbol: 'GOOGL', return: '+1.9%', date: '2024-01-12' }
          ].map((trade, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-[var(--text-primary)]">{trade.symbol}</span>
                <span className="text-sm text-[var(--text-secondary)]">{trade.date}</span>
              </div>
              <span className={`font-medium ${trade.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {trade.return}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Performance;
