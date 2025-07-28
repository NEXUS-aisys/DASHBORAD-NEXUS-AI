import React, { useState, useEffect } from 'react';
import { useSymbol } from '../contexts/SymbolContext';
import SymbolSelector from '../components/common/SymbolSelector';
import apiService from '../services/apiService';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const Trading = () => {
  const { selectedSymbol, updateSymbol } = useSymbol();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!selectedSymbol) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getMarketData(selectedSymbol);
        setMarketData(data);
      } catch (err) {
        setError(`Failed to fetch data for ${selectedSymbol}`);
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedSymbol]);

  const getCurrentPrice = () => {
    if (!marketData || !marketData.length) return 0;
    return marketData[marketData.length - 1]?.close || 0;
  };

  const getPriceChange = () => {
    if (!marketData || marketData.length < 2) return { change: 0, changePercent: 0 };
    const current = marketData[marketData.length - 1]?.close || 0;
    const previous = marketData[marketData.length - 2]?.close || 0;
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    return { change, changePercent };
  };

  const { change, changePercent } = getPriceChange();
  const currentPrice = getCurrentPrice();
  const isPositive = change >= 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trading</h1>
          <p className="text-[var(--text-muted)]">Analyze and execute trades for {selectedSymbol}</p>
        </div>
        
        {/* Mobile Symbol Selector */}
        <div className="block sm:hidden w-full max-w-xs">
          <SymbolSelector 
            selectedSymbol={selectedSymbol}
            onSymbolChange={updateSymbol}
            placeholder="Select symbol to trade..."
          />
        </div>
      </div>

      {/* Current Price Display */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{selectedSymbol}</h2>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-[var(--error)]" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Activity className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
            <span className="ml-2 text-[var(--text-muted)]">Loading market data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[var(--error)]">
            <p>{error}</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Please check if the symbol is valid and try again.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--text-primary)]">
                ${currentPrice.toFixed(2)}
              </div>
              <div className="text-sm text-[var(--text-muted)]">Current Price</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-semibold ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {isPositive ? '+' : ''}${change.toFixed(2)}
              </div>
              <div className="text-sm text-[var(--text-muted)]">Change</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-semibold ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
              <div className="text-sm text-[var(--text-muted)]">Change %</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Trade Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="professional-card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Buy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--success)]"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[var(--success)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Buy {selectedSymbol}
            </button>
          </div>
        </div>

        <div className="professional-card">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Sell</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[var(--error)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Sell {selectedSymbol}
            </button>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="professional-card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Market Analysis for {selectedSymbol}</h3>
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">Loading analysis...</div>
        ) : error ? (
          <div className="text-center py-8 text-[var(--error)]">Unable to load analysis</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-[var(--accent-primary)]" />
              <div className="text-sm text-[var(--text-muted)]">Volume</div>
              <div className="font-semibold text-[var(--text-primary)]">
                {marketData && marketData.length > 0 ? 
                  (marketData[marketData.length - 1]?.volume || 0).toLocaleString() : 
                  'N/A'
                }
              </div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[var(--success)]" />
              <div className="text-sm text-[var(--text-muted)]">Day High</div>
              <div className="font-semibold text-[var(--text-primary)]">
                ${marketData && marketData.length > 0 ? 
                  (marketData[marketData.length - 1]?.high || 0).toFixed(2) : 
                  '0.00'
                }
              </div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <TrendingDown className="w-6 h-6 mx-auto mb-2 text-[var(--error)]" />
              <div className="text-sm text-[var(--text-muted)]">Day Low</div>
              <div className="font-semibold text-[var(--text-primary)]">
                ${marketData && marketData.length > 0 ? 
                  (marketData[marketData.length - 1]?.low || 0).toFixed(2) : 
                  '0.00'
                }
              </div>
            </div>
            <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-[var(--info)]" />
              <div className="text-sm text-[var(--text-muted)]">Open</div>
              <div className="font-semibold text-[var(--text-primary)]">
                ${marketData && marketData.length > 0 ? 
                  (marketData[marketData.length - 1]?.open || 0).toFixed(2) : 
                  '0.00'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trading;

