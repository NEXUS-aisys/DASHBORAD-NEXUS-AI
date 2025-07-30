import React, { useState } from 'react';
import { BarChart3, LineChart, Search, ArrowUp, ArrowDown, Activity, BarChart2 } from 'lucide-react';
import { callChatAPIWithProviders } from '../../services/aiService';

const SymbolAnalysis = () => {
  const [symbol, setSymbol] = useState('');
  const [exchange, setExchange] = useState('CME');
  const [timeframe, setTimeframe] = useState('1d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('samaira');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');

  // List of common futures exchanges
  const exchanges = [
    { id: 'CME', name: 'Chicago Mercantile Exchange' },
    { id: 'CBOT', name: 'Chicago Board of Trade' },
    { id: 'NYMEX', name: 'New York Mercantile Exchange' },
    { id: 'COMEX', name: 'Commodity Exchange' },
    { id: 'ICE', name: 'Intercontinental Exchange' }
  ];

  // List of available timeframes
  const timeframes = [
    { id: '1h', name: '1 Hour' },
    { id: '4h', name: '4 Hours' },
    { id: '1d', name: '1 Day' },
    { id: '1w', name: '1 Week' },
    { id: '1m', name: '1 Month' }
  ];

  // Sample futures contracts by exchange
  const sampleContracts = {
    'CME': ['ES (S&P 500)', 'NQ (Nasdaq)', 'YM (Dow)', '6E (Euro FX)', '6J (Japanese Yen)'],
    'CBOT': ['ZB (T-Bond)', 'ZN (10Y T-Note)', 'ZC (Corn)', 'ZS (Soybeans)', 'ZW (Wheat)'],
    'NYMEX': ['CL (Crude Oil)', 'NG (Natural Gas)', 'HO (Heating Oil)', 'RB (RBOB Gasoline)'],
    'COMEX': ['GC (Gold)', 'SI (Silver)', 'HG (Copper)', 'PL (Platinum)'],
    'ICE': ['SB (Sugar)', 'KC (Coffee)', 'CC (Cocoa)', 'CT (Cotton)']
  };

  // Available AI providers
  const providers = [
    { id: 'samaira', name: 'Samaira AI', models: ['gpt-3.5-turbo', 'gpt-4'] },
    { id: 'google', name: 'Google AI', models: ['gemini-pro'] }
  ];

  // Handle model selection based on provider
  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setSelectedProvider(newProvider);

    // Set default model for the selected provider
    const providerData = providers.find(p => p.id === newProvider);
    if (providerData && providerData.models.length > 0) {
      setSelectedModel(providerData.models[0]);
    }
  };

  // Generate the prompt for the AI
  const generateAnalysisPrompt = (symbol, exchange, timeframe) => {
    return `Please analyze the futures contract ${symbol} on ${exchange} exchange for the ${timeframe} timeframe. 

Provide a comprehensive analysis including:
1. Current market trend and strength
2. Key support and resistance levels
3. Technical indicator analysis (RSI, MACD, Moving Averages)
4. Volume analysis and open interest trends
5. Potential entry/exit points
6. Risk assessment (volatility, risk/reward ratio)
7. Clear trading recommendation (Buy, Sell, Hold, Wait)
8. Suggested stop loss and take profit levels

Format your response in a clear, structured way with headings and bullet points where appropriate.`;
  };

  // Run the analysis
  const analyzeSymbol = async () => {
    if (!symbol) {
      alert('Please enter a symbol to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const prompt = generateAnalysisPrompt(symbol, exchange, timeframe);

      // Create a messages array with the user message
      const messages = [
        { role: 'user', content: prompt }
      ];

      // Call the AI service
      const response = await callChatAPIWithProviders(messages, selectedModel, selectedProvider);

      setAnalysisResult(response);
    } catch (error) {
      console.error('Error analyzing symbol:', error);
      setAnalysisResult('Error analyzing symbol. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
        <h3 className="text-subheading">Futures Symbol Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {/* Symbol Input */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Symbol</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
              placeholder="ES, NQ, CL, GC, etc."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-[var(--text-muted)]">Suggested contracts:</p>
            <div className="flex flex-wrap mt-1 gap-1">
              {sampleContracts[exchange]?.map((sample, index) => (
                <button
                  key={index}
                  className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-md hover:bg-[var(--bg-quaternary)]"
                  onClick={() => setSymbol(sample.split(' ')[0])}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exchange Selector */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Exchange</label>
          <select
            className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
          >
            {exchanges.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {/* Timeframe Selector */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">Timeframe</label>
          <select
            className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {timeframes.map((tf) => (
              <option key={tf.id} value={tf.id}>{tf.name}</option>
            ))}
          </select>
        </div>

        {/* AI Provider Selector */}
        <div>
          <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">AI Provider</label>
          <select
            className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            value={selectedProvider}
            onChange={handleProviderChange}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
          <select
            className="mt-2 w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {providers.find(p => p.id === selectedProvider)?.models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analysis Button */}
      <button
        className="w-full p-3 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-secondary)] transition-colors flex items-center justify-center"
        onClick={analyzeSymbol}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            Analyzing...
          </>
        ) : (
          <>
            <BarChart2 className="w-4 h-4 mr-2" />
            Analyze Symbol
          </>
        )}
      </button>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6 professional-card fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subheading">Analysis Results</h3>
            <div className="flex items-center">
              <span className="text-xs text-[var(--text-muted)] mr-2">Generated by {selectedProvider}</span>
              <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {/* Use white-space: pre-wrap to preserve formatting */}
            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolAnalysis;
