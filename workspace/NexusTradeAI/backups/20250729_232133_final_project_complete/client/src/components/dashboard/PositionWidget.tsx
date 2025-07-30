import React from 'react';

interface PositionData {
  dailyPnL: number;
  openPositions: number;
  winRate: number;
  portfolioHeat: number;
}

interface PositionWidgetProps {
  data?: PositionData;
}

export function PositionWidget({ data = {
  dailyPnL: 3247,
  openPositions: 2,
  winRate: 73,
  portfolioHeat: 45
} }: PositionWidgetProps) {
  
  const isPnLPositive = data.dailyPnL > 0;
  
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Position & Risk</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${isPnLPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPnLPositive ? '+' : '-'}${Math.abs(data.dailyPnL).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Daily P&L</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{data.openPositions}</div>
          <div className="text-xs text-gray-400 mt-1">Open Positions</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{data.winRate}%</div>
          <div className="text-xs text-gray-400 mt-1">Win Rate</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${
            data.portfolioHeat < 30 ? 'text-green-400' : 
            data.portfolioHeat < 60 ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {data.portfolioHeat}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Portfolio Heat</div>
        </div>
      </div>
    </div>
  );
}
