import React from 'react';
import { Shield, AlertTriangle, Target, TrendingDown } from 'lucide-react';

const RiskAnalysis = () => {
  const riskMetrics = [
    {
      title: 'Portfolio Risk Score',
      value: '6.2/10',
      status: 'Moderate',
      icon: Shield,
      color: 'text-yellow-500'
    },
    {
      title: 'Value at Risk (VaR)',
      value: '$2,450',
      status: '95% confidence',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      title: 'Beta',
      value: '1.15',
      status: 'vs S&P 500',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      title: 'Max Drawdown',
      value: '-8.3%',
      status: 'Last 12 months',
      icon: TrendingDown,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Risk Analysis</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="professional-card fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-opacity-20 ${metric.color}`}>
                  <IconComponent className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{metric.value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{metric.status}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Distribution Chart */}
      <div className="professional-card fade-in" style={{ animationDelay: `400ms` }}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Risk Distribution by Asset Class</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-lg">
          <div className="text-center">
            <Shield className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">Risk distribution chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="professional-card fade-in" style={{ animationDelay: `500ms` }}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Risk Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <p className="text-[var(--text-primary)] font-medium">High Concentration Risk</p>
              <p className="text-sm text-[var(--text-secondary)]">Tech sector represents 45% of portfolio</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
            <Target className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="text-[var(--text-primary)] font-medium">Correlation Alert</p>
              <p className="text-sm text-[var(--text-secondary)]">High correlation detected between AAPL and MSFT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
