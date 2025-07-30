import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
// TODO: replace with real portfolio history endpoint

const PortfolioChart = ({ timeframe = '1D', height = 300 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      let days;
      switch (timeframe) {
        case '1D':
          days = 1;
          break;
        case '1W':
          days = 7;
          break;
        case '1M':
          days = 30;
          break;
        case '3M':
          days = 90;
          break;
        case '1Y':
          days = 365;
          break;
        default:
          days = 30;
      }
      
      const portfolioData = [];
      setData(portfolioData);
      setLoading(false);
    }, 500);
  }, [timeframe]);

  const formatValue = (value) => {
    return `$${(value / 1000000).toFixed(2)}M`;
  };

  const formatTooltipValue = (value, name) => {
    if (name === 'value') {
      return [`$${value.toLocaleString()}`, 'Portfolio Value'];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-3 shadow-lg">
          <p className="text-[var(--text-primary)] font-medium">{label}</p>
          <p className="text-[var(--accent-primary)] font-semibold">
            Portfolio: {formatValue(data.value)}
          </p>
          <p className={`text-sm ${data.dailyPnL >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            Daily P&L: {data.dailyPnL >= 0 ? '+' : ''}${data.dailyPnL.toLocaleString()}
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            Return: {data.cumulativeReturn}%
          </p>
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
    <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
      Portfolio chart will appear here once historical data endpoint is available.
    </div>
  );
};

export default PortfolioChart;

