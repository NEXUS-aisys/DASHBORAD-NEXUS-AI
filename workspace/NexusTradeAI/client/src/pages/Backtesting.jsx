import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Calendar,
  Settings,
  Download,
  Share2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Clock,
  Activity,
  PieChart,
  LineChart,
  BarChart
} from 'lucide-react';

const Backtesting = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(100);
  const [results, setResults] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [symbols, setSymbols] = useState(['AAPL', 'TSLA', 'MSFT']);
  const [symbolsInput, setSymbolsInput] = useState('AAPL, TSLA, MSFT');
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  const [symbolSuggestions, setSymbolSuggestions] = useState([]);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [positionSize, setPositionSize] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);

  // Strategy configurations
  const strategies = {
    momentum: {
      name: 'Momentum Strategy',
      description: 'Buy when price is trending up, sell when trending down',
      parameters: {
        lookbackPeriod: 20,
        threshold: 0.02,
        stopLoss: 0.05,
        takeProfit: 0.10
      }
    },
    meanReversion: {
      name: 'Mean Reversion Strategy',
      description: 'Buy oversold, sell overbought based on moving averages',
      parameters: {
        shortPeriod: 10,
        longPeriod: 30,
        oversoldThreshold: -0.02,
        overboughtThreshold: 0.02
      }
    },
    breakout: {
      name: 'Breakout Strategy',
      description: 'Buy when price breaks above resistance, sell below support',
      parameters: {
        breakoutPeriod: 20,
        volumeThreshold: 1.5,
        confirmationPeriod: 3
      }
    },
    custom: {
      name: 'Custom Strategy',
      description: 'Build your own strategy with custom rules',
      parameters: {}
    }
  };

  // Performance metrics
  const [metrics, setMetrics] = useState({
    totalReturn: 0,
    annualizedReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    avgTradeDuration: 0
  });

  // Popular trading symbols for auto-suggest
  const popularSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
    'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'VEA', 'VWO', 'BND', 'GLD', 'SLV',
    'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'LTC', 'BCH', 'XRP', 'SOL',
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY', 'NZD/JPY',
    'ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'PL', 'PA', 'HG',
    'ZC', 'ZS', 'ZW', 'ZC', 'ZS', 'ZW', 'ZC', 'ZS', 'ZW', 'ZC'
  ];

  // Get filtered symbols based on input
  const getFilteredSymbols = (input) => {
    if (!input) return popularSymbols.slice(0, 10);
    
    return popularSymbols
      .filter(symbol => symbol.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 10);
  };

  // Handle symbol input with auto-suggest
  const handleSymbolInput = (value) => {
    setSymbolsInput(value);
    
    // Extract the last symbol being typed
    const parts = value.split(',').map(s => s.trim());
    const lastPart = parts[parts.length - 1];
    
    if (lastPart.length > 0) {
      const suggestions = getFilteredSymbols(lastPart);
      setSymbolSuggestions(suggestions);
      setShowSymbolSuggestions(true);
    } else {
      setShowSymbolSuggestions(false);
    }
  };

  // Select symbol from suggestions
  const selectSymbol = (symbol) => {
    const parts = symbolsInput.split(',').map(s => s.trim());
    parts[parts.length - 1] = symbol;
    const newInput = parts.join(', ');
    setSymbolsInput(newInput);
    setSymbols(parts.filter(s => s.length > 0));
    setShowSymbolSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.symbol-input-container')) {
        setShowSymbolSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real historical data from Yahoo Finance API
  const fetchHistoricalData = async (symbol, startDate, endDate) => {
    try {
      console.log(`Fetching historical data for ${symbol} from ${startDate} to ${endDate}`);
      
      // Use the existing working market endpoint
      const response = await fetch(`/api/market/${symbol}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Received ${data.length} data points for ${symbol}`);
        
        if (data.length === 0) {
          console.warn(`No data received for ${symbol}, using mock data`);
          return generateMockHistoricalData(symbol, startDate, endDate);
        }
        
        // Filter data by date range
        const filteredData = data.filter(item => {
          const itemDate = new Date(item.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return itemDate >= start && itemDate <= end;
        });
        
        console.log(`Filtered to ${filteredData.length} data points for date range`);
        
        if (filteredData.length === 0) {
          console.warn(`No data in date range for ${symbol}, using mock data`);
          return generateMockHistoricalData(symbol, startDate, endDate);
        }
        
        return filteredData.map(item => ({
          date: new Date(item.date),
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume)
        }));
      } else {
        console.warn(`Failed to fetch data for ${symbol}, using mock data`);
        return generateMockHistoricalData(symbol, startDate, endDate);
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return generateMockHistoricalData(symbol, startDate, endDate);
    }
  };

  // Mock historical data generator (fallback)
  const generateMockHistoricalData = (symbol, startDate, endDate) => {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentPrice = 100 + Math.random() * 100;
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
        currentPrice *= (1 + change);
        
        data.push({
          date: new Date(date),
          open: currentPrice * (1 + (Math.random() - 0.5) * 0.01),
          high: currentPrice * (1 + Math.random() * 0.02),
          low: currentPrice * (1 - Math.random() * 0.02),
          close: currentPrice,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }
    }
    return data;
  };

  // Run backtest with real data
  const runBacktest = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Fetch historical data for all symbols
      setCurrentStep(10);
      const historicalData = {};
      console.log('Fetching data for symbols:', symbols);
      
      for (const symbol of symbols) {
        console.log(`Processing symbol: ${symbol}`);
        const data = await fetchHistoricalData(symbol, dateRange.start, dateRange.end);
        historicalData[symbol] = data;
        console.log(`Data for ${symbol}:`, data.length, 'points');
        setCurrentStep(10 + (symbols.indexOf(symbol) + 1) * 20);
      }
      
      console.log('Historical data loaded:', Object.keys(historicalData));

      // Step 2: Load trader's actual trading records
      setCurrentStep(50);
      const savedBotTrades = localStorage.getItem('nexus_bot_trades');
      const savedManualTrades = localStorage.getItem('nexus_manual_trades');
      
      const botTrades = savedBotTrades ? JSON.parse(savedBotTrades) : [];
      const manualTrades = savedManualTrades ? JSON.parse(savedManualTrades) : [];
      
      // Filter trades by date range and symbols
      const allTrades = [...botTrades, ...manualTrades].filter(trade => {
        const tradeDate = new Date(trade.openTime || trade.entryDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return tradeDate >= startDate && tradeDate <= endDate && symbols.includes(trade.symbol);
      });

      setCurrentStep(70);

      // Step 3: Apply strategy logic to historical data
      const strategyResults = applyStrategyLogic(historicalData, selectedStrategy, strategies[selectedStrategy].parameters);
      
      setCurrentStep(90);

      // Step 4: Calculate performance metrics
      const performanceMetrics = calculatePerformanceMetrics(strategyResults, initialCapital, positionSize);
      
      setCurrentStep(100);

      // Set results
      setResults({
        trades: strategyResults.trades,
        equity: strategyResults.equity,
        drawdown: strategyResults.drawdown,
        actualTrades: allTrades // Include trader's actual trades for comparison
      });

      setMetrics(performanceMetrics);

    } catch (error) {
      console.error('Backtest error:', error);
      // Fallback to mock results if real data fails
      const mockResults = {
        trades: [
          {
            id: 1,
            symbol: 'AAPL',
            action: 'BUY',
            entryDate: '2024-01-15',
            entryPrice: 150.25,
            exitDate: '2024-01-25',
            exitPrice: 165.50,
            quantity: 10,
            pnl: 152.50,
            return: 0.1016
          }
        ],
        equity: [{ date: '2024-01-01', value: initialCapital }],
        drawdown: [{ date: '2024-01-01', value: 0 }]
      };

      setResults(mockResults);
      setMetrics({
        totalReturn: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
        avgTradeDuration: 0
      });
    }

    setIsRunning(false);
  };

  // Apply strategy logic to historical data
  const applyStrategyLogic = (historicalData, strategyType, parameters) => {
    const trades = [];
    const equity = [];
    const drawdown = [];
    let currentCapital = initialCapital;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    // Initialize equity curve
    equity.push({ date: dateRange.start, value: currentCapital });

    for (const symbol in historicalData) {
      const data = historicalData[symbol];
      
      for (let i = 20; i < data.length; i++) { // Start after lookback period
        const currentPrice = data[i].close;
        const lookbackData = data.slice(i - 20, i);
        
        let signal = null;
        
        // Apply strategy logic
        switch (strategyType) {
          case 'momentum':
            signal = applyMomentumStrategy(lookbackData, parameters);
            break;
          case 'meanReversion':
            signal = applyMeanReversionStrategy(lookbackData, parameters);
            break;
          case 'breakout':
            signal = applyBreakoutStrategy(lookbackData, parameters);
            break;
          default:
            signal = null;
        }
        
        if (signal) {
          const positionSizeValue = (currentCapital * (positionSize / 100)) / currentPrice;
          const trade = {
            id: trades.length + 1,
            symbol: symbol,
            action: signal,
            entryDate: data[i].date.toISOString().split('T')[0],
            entryPrice: currentPrice,
            exitDate: data[Math.min(i + 10, data.length - 1)].date.toISOString().split('T')[0],
            exitPrice: data[Math.min(i + 10, data.length - 1)].close,
            quantity: Math.floor(positionSizeValue),
            pnl: 0,
            return: 0
          };
          
          // Calculate P&L
          if (signal === 'BUY') {
            trade.pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
            trade.return = (trade.exitPrice - trade.entryPrice) / trade.entryPrice;
          } else {
            trade.pnl = (trade.entryPrice - trade.exitPrice) * trade.quantity;
            trade.return = (trade.entryPrice - trade.exitPrice) / trade.entryPrice;
          }
          
          trades.push(trade);
          currentCapital += trade.pnl;
          
          // Update equity curve
          equity.push({ date: trade.exitDate, value: currentCapital });
          
          // Calculate drawdown
          if (currentCapital > peakCapital) {
            peakCapital = currentCapital;
          }
          const currentDrawdown = ((currentCapital - peakCapital) / peakCapital) * 100;
          if (currentDrawdown < maxDrawdown) {
            maxDrawdown = currentDrawdown;
          }
          drawdown.push({ date: trade.exitDate, value: currentDrawdown });
        }
      }
    }

    return { trades, equity, drawdown };
  };

  // Strategy implementations
  const applyMomentumStrategy = (data, params) => {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i-1].close) / data[i-1].close);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const currentReturn = returns[returns.length - 1];
    
    if (currentReturn > avgReturn + params.threshold) return 'BUY';
    if (currentReturn < avgReturn - params.threshold) return 'SELL';
    return null;
  };

  const applyMeanReversionStrategy = (data, params) => {
    const shortMA = calculateMA(data, params.shortPeriod);
    const longMA = calculateMA(data, params.longPeriod);
    
    const deviation = (data[data.length - 1].close - longMA) / longMA;
    
    if (deviation < params.oversoldThreshold) return 'BUY';
    if (deviation > params.overboughtThreshold) return 'SELL';
    return null;
  };

  const applyBreakoutStrategy = (data, params) => {
    const high = Math.max(...data.map(d => d.high));
    const low = Math.min(...data.map(d => d.low));
    const currentPrice = data[data.length - 1].close;
    
    if (currentPrice > high * 0.98) return 'BUY';
    if (currentPrice < low * 1.02) return 'SELL';
    return null;
  };

  const calculateMA = (data, period) => {
    const prices = data.slice(-period).map(d => d.close);
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = (results, initialCap, posSize) => {
    const { trades, equity } = results;
    
    if (trades.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        totalTrades: 0,
        avgTradeDuration: 0
      };
    }

    const finalCapital = equity[equity.length - 1]?.value || initialCap;
    const totalReturn = ((finalCapital - initialCap) / initialCap) * 100;
    
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    const maxDrawdown = Math.min(...results.drawdown.map(d => d.value));
    
    // Calculate Sharpe ratio (simplified)
    const returns = equity.slice(1).map((e, i) => 
      (e.value - equity[i].value) / equity[i].value
    );
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      annualizedReturn: parseFloat((totalReturn * 12).toFixed(2)), // Simplified annualization
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      totalTrades: trades.length,
      avgTradeDuration: 10 // Simplified average
    };
  };

  const stopBacktest = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  const saveStrategy = () => {
    const strategy = {
      id: Date.now(),
      name: strategies[selectedStrategy].name,
      type: selectedStrategy,
      parameters: strategies[selectedStrategy].parameters,
      dateRange,
      symbols,
      initialCapital,
      positionSize,
      createdAt: new Date().toISOString()
    };
    
    setSavedStrategies(prev => [...prev, strategy]);
    localStorage.setItem('nexus_saved_strategies', JSON.stringify([...savedStrategies, strategy]));
  };

  const loadSavedStrategies = () => {
    const saved = localStorage.getItem('nexus_saved_strategies');
    if (saved) {
      setSavedStrategies(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadSavedStrategies();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[var(--bg-primary)] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backtesting Engine</h1>
          <p className="text-[var(--text-secondary)]">Test your trading strategies with historical data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStrategyBuilder(true)}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Strategy Builder</span>
          </button>
          <button
            onClick={saveStrategy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Strategy</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Strategy Selection */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Strategy Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Strategy Type</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  {Object.keys(strategies).map(key => (
                    <option key={key} value={key}>{strategies[key].name}</option>
                  ))}
                </select>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {strategies[selectedStrategy].description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div className="symbol-input-container relative">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Symbols</label>
                <input
                  type="text"
                  value={symbolsInput}
                  onChange={(e) => handleSymbolInput(e.target.value)}
                  onFocus={() => {
                    const parts = symbolsInput.split(',').map(s => s.trim());
                    const lastPart = parts[parts.length - 1];
                    if (lastPart.length > 0) {
                      const suggestions = getFilteredSymbols(lastPart);
                      setSymbolSuggestions(suggestions);
                      setShowSymbolSuggestions(true);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="Start typing symbols (e.g., AAPL, TSLA, BTC)"
                />
                
                {/* Symbol Suggestions Dropdown */}
                {showSymbolSuggestions && symbolSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
                      Found {symbolSuggestions.length} symbols
                    </div>
                    {symbolSuggestions.map((symbol, index) => (
                      <button
                        key={symbol}
                        onClick={() => selectSymbol(symbol)}
                        className={`w-full px-3 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors border-b border-[var(--border-primary)] ${
                          symbol === symbolsInput.split(',').pop()?.trim() ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{symbol}</span>
                          {popularSymbols.includes(symbol) && (
                            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Initial Capital</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Position Size (%)</label>
                <input
                  type="number"
                  value={positionSize}
                  onChange={(e) => setPositionSize(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  min="1"
                  max="100"
                  step="1"
                />
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-between"
              >
                <span>Advanced Settings</span>
                {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Commission (%)</label>
                    <input
                      type="number"
                      defaultValue="0.1"
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Slippage (%)</label>
                    <input
                      type="number"
                      defaultValue="0.05"
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved Strategies */}
          {savedStrategies.length > 0 && (
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Saved Strategies</h3>
              <div className="space-y-2">
                {savedStrategies.map(strategy => (
                  <div key={strategy.id} className="p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[var(--text-primary)]">{strategy.name}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {new Date(strategy.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Control Panel */}
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Backtest Control</h3>
              <div className="flex space-x-2">
                {!isRunning ? (
                  <button
                    onClick={runBacktest}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Backtest</span>
                  </button>
                ) : (
                  <button
                    onClick={stopBacktest}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Progress</span>
                  <span>{currentStep}%</span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                  <div 
                    className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentStep}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running backtest...</span>
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          {results && (
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{metrics.totalReturn}%</div>
                  <div className="text-sm text-[var(--text-secondary)]">Total Return</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{metrics.sharpeRatio}</div>
                  <div className="text-sm text-[var(--text-secondary)]">Sharpe Ratio</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{metrics.maxDrawdown}%</div>
                  <div className="text-sm text-[var(--text-secondary)]">Max Drawdown</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">{metrics.winRate}%</div>
                  <div className="text-sm text-[var(--text-secondary)]">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{metrics.profitFactor}</div>
                  <div className="text-sm text-[var(--text-secondary)]">Profit Factor</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-indigo-500">{metrics.totalTrades}</div>
                  <div className="text-sm text-[var(--text-secondary)]">Total Trades</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-teal-500">{metrics.annualizedReturn}%</div>
                  <div className="text-sm text-[var(--text-secondary)]">Annualized Return</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                  <div className="text-2xl font-bold text-pink-500">{metrics.avgTradeDuration}d</div>
                  <div className="text-sm text-[var(--text-secondary)]">Avg Trade Duration</div>
                </div>
              </div>
            </div>
          )}

          {/* Trade List */}
          {results && (
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Trade History</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded hover:text-[var(--text-primary)] transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)]">
                      <th className="text-left py-2 text-[var(--text-secondary)]">Symbol</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Action</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Entry Date</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Entry Price</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Exit Date</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Exit Price</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">P&L</th>
                      <th className="text-left py-2 text-[var(--text-secondary)]">Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.trades.map(trade => (
                      <tr key={trade.id} className="border-b border-[var(--border-primary)]">
                        <td className="py-2 text-[var(--text-primary)] font-medium">{trade.symbol}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.action === 'BUY' 
                              ? 'bg-[var(--bg-tertiary)] text-green-500 border border-green-500/20' 
                              : 'bg-[var(--bg-tertiary)] text-red-500 border border-red-500/20'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="py-2 text-[var(--text-secondary)]">{trade.entryDate}</td>
                        <td className="py-2 text-[var(--text-primary)]">${trade.entryPrice}</td>
                        <td className="py-2 text-[var(--text-secondary)]">{trade.exitDate}</td>
                        <td className="py-2 text-[var(--text-primary)]">${trade.exitPrice}</td>
                        <td className={`py-2 font-medium ${
                          trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          ${trade.pnl}
                        </td>
                        <td className={`py-2 font-medium ${
                          trade.return >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {(trade.return * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {results && (
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Debug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-2">Test Configuration</h4>
                  <div className="space-y-1 text-[var(--text-secondary)]">
                    <div>Strategy: {strategies[selectedStrategy].name}</div>
                    <div>Symbols: {symbols.join(', ')}</div>
                    <div>Date Range: {dateRange.start} to {dateRange.end}</div>
                    <div>Initial Capital: ${initialCapital.toLocaleString()}</div>
                    <div>Position Size: {positionSize}%</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-2">Results Summary</h4>
                  <div className="space-y-1 text-[var(--text-secondary)]">
                    <div>Total Trades: {results.trades?.length || 0}</div>
                    <div>Equity Points: {results.equity?.length || 0}</div>
                    <div>Drawdown Points: {results.drawdown?.length || 0}</div>
                    <div>Actual Trades: {results.actualTrades?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Charts */}
          {results && (
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Charts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equity Curve Chart */}
                <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Equity Curve</h4>
                  <div className="h-48 flex items-center justify-center">
                    {results.equity && results.equity.length > 1 ? (
                      <div className="w-full h-full">
                        {/* Simple SVG Chart */}
                        <svg width="100%" height="100%" className="text-[var(--text-primary)]">
                          <defs>
                            <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.2"/>
                            </linearGradient>
                          </defs>
                          <g>
                            {/* Y-axis */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="var(--border-primary)" strokeWidth="1"/>
                            {/* X-axis */}
                            <line x1="40" y1="180" x2="280" y2="180" stroke="var(--border-primary)" strokeWidth="1"/>
                            
                            {/* Equity curve */}
                            {results.equity.map((point, index) => {
                              if (index === 0) return null;
                              const prevPoint = results.equity[index - 1];
                              const x1 = 40 + (index - 1) * (240 / (results.equity.length - 1));
                              const y1 = 180 - (prevPoint.value / initialCapital) * 160;
                              const x2 = 40 + index * (240 / (results.equity.length - 1));
                              const y2 = 180 - (point.value / initialCapital) * 160;
                              
                              return (
                                <line
                                  key={index}
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke="var(--accent-primary)"
                                  strokeWidth="2"
                                />
                              );
                            })}
                            
                            {/* Fill area */}
                            <path
                              d={`M 40 180 ${results.equity.map((point, index) => {
                                const x = 40 + index * (240 / (results.equity.length - 1));
                                const y = 180 - (point.value / initialCapital) * 160;
                                return `L ${x} ${y}`;
                              }).join(' ')} L 280 180 Z`}
                              fill="url(#equityGradient)"
                            />
                          </g>
                        </svg>
                      </div>
                    ) : (
                      <div className="text-center">
                        <LineChart className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
                        <p className="text-[var(--text-secondary)]">No equity data available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Drawdown Chart */}
                <div className="h-64 bg-[var(--bg-tertiary)] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Drawdown</h4>
                  <div className="h-48 flex items-center justify-center">
                    {results.drawdown && results.drawdown.length > 1 ? (
                      <div className="w-full h-full">
                        {/* Simple SVG Chart */}
                        <svg width="100%" height="100%" className="text-[var(--text-primary)]">
                          <g>
                            {/* Y-axis */}
                            <line x1="40" y1="20" x2="40" y2="180" stroke="var(--border-primary)" strokeWidth="1"/>
                            {/* X-axis */}
                            <line x1="40" y1="180" x2="280" y2="180" stroke="var(--border-primary)" strokeWidth="1"/>
                            
                            {/* Drawdown bars */}
                            {results.drawdown.map((point, index) => {
                              const x = 40 + index * (240 / (results.drawdown.length - 1));
                              const height = Math.abs(point.value) * 2; // Scale for visibility
                              const y = 180 - height;
                              
                              return (
                                <rect
                                  key={index}
                                  x={x - 2}
                                  y={y}
                                  width="4"
                                  height={height}
                                  fill={point.value < 0 ? "#ef4444" : "#10b981"}
                                  opacity="0.7"
                                />
                              );
                            })}
                          </g>
                        </svg>
                      </div>
                    ) : (
                      <div className="text-center">
                        <BarChart className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
                        <p className="text-[var(--text-secondary)]">No drawdown data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Builder Modal */}
      {showStrategyBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Strategy Builder</h2>
              <button
                onClick={() => setShowStrategyBuilder(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Strategy Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="My Custom Strategy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Entry Conditions</label>
                <textarea
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  rows="3"
                  placeholder="Enter your entry logic here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Exit Conditions</label>
                <textarea
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  rows="3"
                  placeholder="Enter your exit logic here..."
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                  Save Strategy
                </button>
                <button
                  onClick={() => setShowStrategyBuilder(false)}
                  className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backtesting; 