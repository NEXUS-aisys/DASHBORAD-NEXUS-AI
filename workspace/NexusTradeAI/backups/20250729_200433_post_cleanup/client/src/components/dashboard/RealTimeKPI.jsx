import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import apiService from '../../services/apiService';

const RealTimeKPI = ({ title, icon: Icon, dataType, formatter, className = '' }) => {
  const [value, setValue] = useState(null);
  const [prev, setPrev] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      if (dataType === 'portfolio') {
        const data = await apiService.getPortfolio();
        setPrev(value);
        // Handle both old and new portfolio data structure
        if (data.totalValue) {
          // New structure with totalValue
          setValue(parseFloat(data.totalValue));
        } else if (data.pnl) {
          // Old structure with pnl
        setValue(data.pnl);
        } else {
          setValue(0);
        }
      } else if (dataType === 'positions') {
        const data = await apiService.getPortfolio();
        setPrev(value);
        // Handle both old and new portfolio data structure
        if (data.positionCount) {
          // New structure with positionCount
          setValue(data.positionCount);
        } else if (data.position_count) {
          // Old structure with position_count
        setValue(data.position_count || 0);
        } else {
          setValue(0);
        }
      } else {
        // Unknown type
        setError('Unsupported KPI');
      }
    } catch (e) {
      console.error(e);
      setError('Data unavailable');
    }
  };

  useEffect(() => {
    fetchData();
    const ws = apiService.connectWebSocket();
    const listener = (e) => {
      const { type } = e.detail;
      if (type === 'portfolio_update') fetchData();
    };
    window.addEventListener('realtime-update', listener);
    const interval = setInterval(fetchData, 15000);
    return () => {
      window.removeEventListener('realtime-update', listener);
      clearInterval(interval);
      if (ws) {
      ws.close();
      }
    };
  }, []);

  const change = prev !== null && value !== null ? ((value - prev) / prev) * 100 : null;
  const isUp = change !== null ? change > 0 : null;

  return (
    <div className={`professional-card ${className}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
        <h3 className="text-subheading">{title}</h3>
      </div>
      {error ? (
        <div className="text-xs text-[var(--error)]">{error}</div>
      ) : (
        <div>
          <div className="text-2xl font-bold">
            {value !== null && value !== undefined ? (formatter ? formatter(value) : value.toLocaleString()) : '—'}
          </div>
          {change !== null && (
            <div className={`text-xs ${isUp ? 'text-[var(--success)]' : 'text-[var(--error)]'} flex items-center space-x-1`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change.toFixed(2)} %</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeKPI;

