import React from 'react';

interface Strategy {
  name: string;
  status: 'active' | 'disabled' | 'error';
}

interface StrategyMonitorProps {
  strategies?: Strategy[];
}

export function StrategyMonitor({ strategies = [
  { name: 'Order Flow Imbalance', status: 'active' },
  { name: 'Volume Profile', status: 'active' },
  { name: 'Liquidation Hunter', status: 'active' },
  { name: 'Mean Reversion', status: 'disabled' },
  { name: 'Momentum Breakout', status: 'active' },
  { name: 'Scalping Bot', status: 'error' },
  { name: 'Support/Resistance', status: 'active' },
  { name: 'News Sentiment', status: 'disabled' },
  { name: 'ML Predictor', status: 'active' },
  { name: 'Iceberg Detection', status: 'active' },
  { name: 'Delta Divergence', status: 'active' }
] }: StrategyMonitorProps) {
  
  const activeCount = strategies.filter(s => s.status === 'active').length;
  
  return (
    <div className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--border-primary)]/50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
          <span className="mr-2">🎯</span>
          Trading Strategies
        </h2>
        <div className="text-sm text-[var(--success)]">{activeCount}/{strategies.length} Active</div>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {strategies.map((strategy, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
              strategy.status === 'active' 
                ? 'bg-[var(--success)]/10 border-[var(--success)]' 
                : strategy.status === 'error'
                  ? 'bg-[var(--error)]/10 border-[var(--error)]'
                  : 'bg-[var(--bg-tertiary)]/50 border-[var(--border-primary)]'
            }`}
          >
            <span className="text-sm text-[var(--text-primary)]">{strategy.name}</span>
            <span 
              className={`text-xs px-2 py-1 rounded-full ${
                strategy.status === 'active' 
                  ? 'bg-[var(--success)]/20 text-[var(--success)]' 
                  : strategy.status === 'error'
                    ? 'bg-[var(--error)]/20 text-[var(--error)]'
                    : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
              }`}
            >
              {strategy.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
