import React from 'react';

interface MarketQualityProps {
  data?: {
    liquidity: number;
    efficiency: number;
    volatility: number;
    momentum: number;
    microstructure: number;
    stability: number;
    overall: string;
    regime: string;
  };
}

export function MarketQualityWidget({ data = {
  liquidity: 92,
  efficiency: 78,
  volatility: 85,
  momentum: 91,
  microstructure: 73,
  stability: 88,
  overall: 'A-',
  regime: 'Trending'
} }: MarketQualityProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Market Quality Score</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.liquidity)}`}>{data.liquidity}</div>
          <div className="text-xs text-gray-400 mt-1">Liquidity</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.efficiency)}`}>{data.efficiency}</div>
          <div className="text-xs text-gray-400 mt-1">Efficiency</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.volatility)}`}>{data.volatility}</div>
          <div className="text-xs text-gray-400 mt-1">Volatility</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.momentum)}`}>{data.momentum}</div>
          <div className="text-xs text-gray-400 mt-1">Momentum</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.microstructure)}`}>{data.microstructure}</div>
          <div className="text-xs text-gray-400 mt-1">Microstructure</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(data.stability)}`}>{data.stability}</div>
          <div className="text-xs text-gray-400 mt-1">Stability</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-green-400">{data.overall}</div>
        <div className="text-sm text-gray-300 mt-1">Overall Grade • {data.regime} Market</div>
      </div>
    </div>
  );
}
