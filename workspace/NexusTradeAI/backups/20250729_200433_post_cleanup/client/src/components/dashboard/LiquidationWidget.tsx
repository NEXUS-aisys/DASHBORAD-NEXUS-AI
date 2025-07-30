import React from 'react';

interface LiquidationEvent {
  price: number;
  volume: number;
  timeAgo: string;
}

interface LiquidationWidgetProps {
  events?: LiquidationEvent[];
}

export function LiquidationWidget({ events = [
  { price: 4521.50, volume: 847, timeAgo: '2m ago' },
  { price: 4518.25, volume: 1234, timeAgo: '5m ago' },
  { price: 4515.75, volume: 623, timeAgo: '8m ago' },
  { price: 4512.00, volume: 2156, timeAgo: '12m ago' }
] }: LiquidationWidgetProps) {
  
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Liquidation Events</h2>
      
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {events.map((event, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-3 bg-red-500/10 border-l-2 border-red-500 rounded-lg"
          >
            <div>
              <div className="font-bold text-red-400">${event.price.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Vol: {event.volume} BTC</div>
            </div>
            <div className="text-xs text-gray-500">{event.timeAgo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
