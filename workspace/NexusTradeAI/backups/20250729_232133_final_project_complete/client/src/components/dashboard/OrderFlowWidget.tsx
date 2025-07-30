import React from 'react';

interface OrderFlowProps {
  data?: {
    delta: number;
    bidAskRatio: number;
    absorption: string;
    hvnLevel: number;
  };
}

export function OrderFlowWidget({ data = {
  delta: 2847,
  bidAskRatio: 1.34,
  absorption: 'HIGH',
  hvnLevel: 4521
} }: OrderFlowProps) {
  
  const isDeltaPositive = data.delta > 0;
  
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Order Flow Analysis</h2>
      
      <div className="h-24 bg-gradient-to-r from-red-500/10 to-green-500/10 rounded-lg flex items-center justify-center mb-4">
        <div className={`text-3xl font-bold ${isDeltaPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isDeltaPositive ? '+' : ''}{data.delta.toLocaleString()}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{data.bidAskRatio}</div>
          <div className="text-xs text-gray-400">Bid/Ask Ratio</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{data.absorption}</div>
          <div className="text-xs text-gray-400">Absorption</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{data.hvnLevel}</div>
          <div className="text-xs text-gray-400">HVN Level</div>
        </div>
      </div>
    </div>
  );
}
