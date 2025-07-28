import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

const StrategyComparisonChart = ({ height = 400 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock strategy comparison data
    setTimeout(() => {
      const strategies = [
        {
          name: 'AI Momentum',
          color: 'var(--accent-primary)',
          metrics: {
            'Return': 85,
            'Sharpe Ratio': 78,
            'Win Rate': 72,
            'Max Drawdown': 65,
            'Volatility': 60,
            'Consistency': 80
          }
        },
        {
          name: 'Mean Reversion',
          color: 'var(--info)',
          metrics: {
            'Return': 65,
            'Sharpe Ratio': 85,
            'Win Rate': 68,
            'Max Drawdown': 80,
            'Volatility': 75,
            'Consistency': 90
          }
        },
        {
          name: 'Trend Following',
          color: 'var(--success)',
          metrics: {
            'Return': 75,
            'Sharpe Ratio': 70,
            'Win Rate': 55,
            'Max Drawdown': 45,
            'Volatility': 40,
            'Consistency': 65
          }
        }
      ];

      // Transform data for radar chart
      const radarData = Object.keys(strategies[0].metrics).map(metric => {
        const dataPoint = { metric };
        strategies.forEach(strategy => {
          dataPoint[strategy.name] = strategy.metrics[metric];
        });
        return dataPoint;
      });

      setData({ strategies, radarData });
      setLoading(false);
    }, 1200);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-3 shadow-lg">
          <p className="text-[var(--text-primary)] font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Strategy Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.strategies.map((strategy, index) => (
          <div key={strategy.name} className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: strategy.color }}
              ></div>
              <h4 className="font-medium text-[var(--text-primary)]">{strategy.name}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Avg Return:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {strategy.metrics['Return']}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Win Rate:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {strategy.metrics['Win Rate']}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Sharpe:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {(strategy.metrics['Sharpe Ratio'] / 100 * 3).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Radar Chart */}
      <div style={{ height }}>
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
          Strategy Performance Comparison
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data.radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid stroke="var(--border-primary)" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            
            {data.strategies.map((strategy, index) => (
              <Radar
                key={strategy.name}
                name={strategy.name}
                dataKey={strategy.name}
                stroke={strategy.color}
                fill={strategy.color}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ r: 4, fill: strategy.color }}
              />
            ))}
            
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                color: 'var(--text-primary)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics Explanation */}
      <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
        <h5 className="font-medium text-[var(--text-primary)] mb-2">Metrics Explanation</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
          <div>
            <strong>Return:</strong> Annualized return percentage
          </div>
          <div>
            <strong>Sharpe Ratio:</strong> Risk-adjusted return measure
          </div>
          <div>
            <strong>Win Rate:</strong> Percentage of profitable trades
          </div>
          <div>
            <strong>Max Drawdown:</strong> Largest peak-to-trough decline
          </div>
          <div>
            <strong>Volatility:</strong> Standard deviation of returns
          </div>
          <div>
            <strong>Consistency:</strong> Stability of performance over time
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyComparisonChart;

