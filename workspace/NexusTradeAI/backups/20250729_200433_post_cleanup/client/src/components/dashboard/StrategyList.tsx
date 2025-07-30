import React from 'react';

interface Strategy {
  name: string;
  status: 'active' | 'disabled' | 'error';
}

interface StrategyListProps {
  strategies?: Strategy[];
  onToggle?: (index: number) => void;
}

export function StrategyList({ 
  strategies = [
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
  ],
  onToggle = () => {}
}: StrategyListProps) {
  
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Trading Strategies ({strategies.filter(s => s.status === 'active').length}/{strategies.length})</h2>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {strategies.map((strategy, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
              strategy.status === 'active' 
                ? 'bg-green-500/10 border-l-2 border-green-500' 
                : strategy.status === 'error'
                  ? 'bg-red-500/10 border-l-2 border-red-500'
                  : 'bg-white/5 border-l-2 border-transparent'
            }`}
            onClick={() => onToggle(index)}
          >
            <div className="font-medium text-white">{strategy.name}</div>
            <div className={`text-xs px-2 py-1 rounded ${
              strategy.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : strategy.status === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
            }`}>
              {strategy.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
