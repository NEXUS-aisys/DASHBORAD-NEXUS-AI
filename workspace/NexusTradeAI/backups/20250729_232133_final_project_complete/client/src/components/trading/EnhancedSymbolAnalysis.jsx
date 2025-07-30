import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, LineChart, Search, ArrowUp, ArrowDown, Activity, BarChart2, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Clock, Bell, Settings, XCircle } from 'lucide-react';
import { callChatAPIWithProviders } from '../../services/aiService';

const EnhancedSymbolAnalysis = () => {
  const [symbol, setSymbol] = useState('');
  const [exchange, setExchange] = useState('CME');
  const [timeframe, setTimeframe] = useState('1h');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedAnalysis, setParsedAnalysis] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('samaira');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const eventSourceRef = useRef(null);

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
    { id: '5m', name: '5 Minutes' },
    { id: '15m', name: '15 Minutes' },
    { id: '30m', name: '30 Minutes' },
    { id: '1h', name: '1 Hour' },
    { id: '4h', name: '4 Hours' }
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

Organize your analysis into these three main sections:

# 1. TECHNICAL ANALYSIS
- Current market trend direction and strength
- Key support and resistance levels with specific price points
- Technical indicator readings:
  * RSI (Relative Strength Index)
  * MACD (Moving Average Convergence Divergence)
  * Moving Averages (key crossing points)
  * Other relevant momentum indicators
- Volume analysis and open interest trends
- Price patterns and chart formations

# 2. TRADE RECOMMENDATION
- Clear trading action (BUY, SELL, HOLD, or WAIT)
- Specific reasoning for this recommendation
- Confidence level (LOW, MEDIUM, or HIGH)
- Timeframe for the trade (immediate, short-term, medium-term)
- Suggested entry price range
- Primary price targets
- Alternative scenarios that could invalidate this analysis

# 3. RISK MANAGEMENT
- Suggested stop-loss level with specific price
- Take-profit targets (multiple levels if applicable)
- Position sizing recommendation
- Risk/reward ratio calculation
- Volatility assessment
- Maximum recommended risk percentage

For each section above, provide detailed explanations with specific data points, levels, and reasoning.

At the end, provide a concise SUMMARY of your recommendation that includes:
- The main action (BUY/SELL/HOLD/WAIT)
- Confidence level
- Key entry and exit points
- The most critical technical indicator supporting this view
- Primary risk factor to watch

Format your entire analysis with clear headings, bullet points, and short paragraphs for readability.`;
  };

  // Function to share the analysis data with other components
  // This could be implemented using Context API, Redux, or other state management in a real app
  const shareAnalysisData = (analysisData) => {
    // In a real implementation, this would update global state or call an API
    console.log("Analysis data ready for sharing:", analysisData);
    
    // Example using localStorage (just for demonstration, not recommended for production)
    // localStorage.setItem("latestAnalysis", JSON.stringify(analysisData));
    
    // Example using an API call to store in database
    // saveAnalysisToDatabase(analysisData);
  };

  // Fetch signal performance
  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/trading/signals/performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPerformance(data.data);
      }
    } catch (err) {
      console.error('Error fetching performance:', err);
    }
  };

  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/trading/signals/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWatchlist(data.data);
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    }
  };

  // Set up real-time updates
  const setupRealTimeUpdates = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const symbols = symbol || 'ES,NQ,CL,GC'; // Default symbols if none selected
    eventSourceRef.current = new EventSource(`/api/trading/signals/realtime/${symbols}`);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        // Update analysis for the current symbol
        data.data.forEach(signal => {
          if (!signal.error && signal.symbol === symbol) {
            setAnalysisResult(JSON.stringify(signal, null, 2));
            // Update parsed analysis if available
            if (signal.recommendation) {
              setParsedAnalysis(signal.recommendation);
            }
          }
        });
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('EventSource error:', error);
      setRealTimeMode(false);
    };
  };

  // Add to watchlist
  const addToWatchlist = async (symbolToAdd, alertPrice) => {
    try {
      const response = await fetch(`/api/trading/signals/${symbolToAdd}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ alertPrice })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchWatchlist();
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };
  
  // Initialize data on component mount
  useEffect(() => {
    fetchPerformance();
    fetchWatchlist();
  }, []);

  // Handle real-time mode changes
  useEffect(() => {
    if (realTimeMode) {
      setupRealTimeUpdates();
    } else if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [realTimeMode, symbol]);

  // Run the analysis
  const analyzeSymbol = async () => {
    if (!symbol) {
      alert('Please enter a symbol to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setParsedAnalysis(null);

    try {
      const prompt = generateAnalysisPrompt(symbol, exchange, timeframe);

      // Create a messages array with the user message
      const messages = [
        { role: 'user', content: prompt }
      ];

      // Call the AI service
      const response = await callChatAPIWithProviders(messages, selectedModel, selectedProvider);

      setAnalysisResult(response);

      // Try to parse the recommendation for display
      try {
        const recommendation = {
          action: 'Unknown',
          confidence: 'Medium',
          trend: 'Neutral',
          technicalAnalysis: {
            trend: 'Neutral',
            rsi: 'N/A',
            macd: 'N/A',
            volume: 'N/A'
          },
          signalDetails: {
            entryPoint: 'N/A',
            target: 'N/A'
          },
          riskManagement: {
            stopLoss: 'N/A',
            riskReward: 'N/A',
            positionSize: 'N/A',
            maxRisk: 'N/A'
          }
        };

        // Extract action and trend
        if (response.match(/buy/i) && !response.match(/do not buy|don't buy|avoid buying/i)) {
          recommendation.action = 'Buy';
          recommendation.trend = 'Bullish';
          recommendation.technicalAnalysis.trend = 'Bullish';
        } else if (response.match(/sell/i) && !response.match(/do not sell|don't sell|avoid selling/i)) {
          recommendation.action = 'Sell';
          recommendation.trend = 'Bearish';
          recommendation.technicalAnalysis.trend = 'Bearish';
        } else if (response.match(/hold/i)) {
          recommendation.action = 'Hold';
        } else if (response.match(/wait/i)) {
          recommendation.action = 'Wait';
        }
        
        // Extract confidence level
        if (response.match(/high confidence|strong confidence|very confident/i)) {
          recommendation.confidence = 'High';
        } else if (response.match(/low confidence|not confident|uncertain/i)) {
          recommendation.confidence = 'Low';
        }
        
        // Extract RSI if mentioned
        const rsiMatch = response.match(/RSI[:\s]+(\d+\.?\d*)|RSI[:\s]+is[\s]+(\d+\.?\d*)|RSI[\s]+of[\s]+(\d+\.?\d*)/i);
        if (rsiMatch) {
          const rsiValue = rsiMatch[1] || rsiMatch[2] || rsiMatch[3];
          let rsiStatus = '';
          if (parseFloat(rsiValue) > 70) {
            rsiStatus = '(Overbought)';
          } else if (parseFloat(rsiValue) < 30) {
            rsiStatus = '(Oversold)';
          } else {
            rsiStatus = '(Neutral)';
          }
          recommendation.technicalAnalysis.rsi = `${rsiValue} ${rsiStatus}`;
        }
        
        // Extract MACD status
        if (response.match(/MACD[\s\S]*?bullish crossover|bullish MACD|MACD[\s\S]*?turned bullish/i)) {
          recommendation.technicalAnalysis.macd = 'Bullish Crossover';
        } else if (response.match(/MACD[\s\S]*?bearish crossover|bearish MACD|MACD[\s\S]*?turned bearish/i)) {
          recommendation.technicalAnalysis.macd = 'Bearish Crossover';
        }
        
        // Extract volume information
        if (response.match(/volume[\s\S]*?above average|increasing volume|high volume/i)) {
          recommendation.technicalAnalysis.volume = 'Above Average';
        } else if (response.match(/volume[\s\S]*?below average|decreasing volume|low volume/i)) {
          recommendation.technicalAnalysis.volume = 'Below Average';
        } else if (response.match(/average volume|normal volume|steady volume/i)) {
          recommendation.technicalAnalysis.volume = 'Average';
        }
        
        // Extract entry point
        const entryMatch = response.match(/entry[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?(\d+[\.\,]?\d*)|price[\s\S]*?(\d+[\.\,]?\d*)/i);
        if (entryMatch) {
          if (entryMatch[1] && entryMatch[2]) {
            recommendation.signalDetails.entryPoint = `${entryMatch[1]} - ${entryMatch[2]}`;
          } else if (entryMatch[3]) {
            recommendation.signalDetails.entryPoint = entryMatch[3];
          }
        }
        
        // Extract target
        const targetMatch = response.match(/target[\s\S]*?(\d+[\.\,]?\d*)|price target[\s\S]*?(\d+[\.\,]?\d*)|take profit[\s\S]*?(\d+[\.\,]?\d*)/i);
        if (targetMatch) {
          recommendation.signalDetails.target = targetMatch[1] || targetMatch[2] || targetMatch[3];
        }
        
        // Extract stop loss
        const stopLossMatch = response.match(/stop[\-\s]?loss[\s\S]*?(\d+[\.\,]?\d*)|stop[\s\S]*?(\d+[\.\,]?\d*)/i);
        if (stopLossMatch) {
          recommendation.riskManagement.stopLoss = stopLossMatch[1] || stopLossMatch[2];
        }
        
        // Extract risk/reward
        const riskRewardMatch = response.match(/risk[\s\/]reward[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?(\d+[\.\,]?\d*)|R\/R[\s\S]*?(\d+[\.\,]?\d*)/i);
        if (riskRewardMatch) {
          if (riskRewardMatch[1] && riskRewardMatch[2]) {
            recommendation.riskManagement.riskReward = `${riskRewardMatch[1]}:${riskRewardMatch[2]}`;
          } else if (riskRewardMatch[3]) {
            recommendation.riskManagement.riskReward = riskRewardMatch[3];
          }
        }
        
        // Extract position size
        const positionMatch = response.match(/position size[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?%|position[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?%/i);
        if (positionMatch) {
          const posSize = positionMatch[1] || positionMatch[2];
          recommendation.riskManagement.positionSize = `${posSize}% of Capital`;
        }
        
        // Extract max risk
        const maxRiskMatch = response.match(/max[\s\S]*?risk[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?%|risk[\s\S]*?(\d+[\.\,]?\d*)[\s\S]*?%/i);
        if (maxRiskMatch) {
          const risk = maxRiskMatch[1] || maxRiskMatch[2];
          recommendation.riskManagement.maxRisk = `${risk}% per Trade`;
        }

        setParsedAnalysis(recommendation);
        
        // Share the analysis data with other components
        shareAnalysisData(recommendation);
      } catch (parseError) {
        console.error('Error parsing recommendation:', parseError);
      }
    } catch (error) {
      console.error('Error analyzing symbol:', error);
      setAnalysisResult('Error analyzing symbol. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to render the recommendation badge
  const renderRecommendationBadge = (recommendation) => {
    if (!recommendation) return null;

    switch (recommendation.action) {
      case 'Buy':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--success)]/20 text-[var(--success)]">
            <ArrowUp className="w-4 h-4 mr-1" /> Buy
          </div>
        );
      case 'Sell':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--error)]/20 text-[var(--error)]">
            <ArrowDown className="w-4 h-4 mr-1" /> Sell
          </div>
        );
      case 'Hold':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--warning)]/20 text-[var(--warning)]">
            <AlertCircle className="w-4 h-4 mr-1" /> Hold
          </div>
        );
      case 'Wait':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--info)]/20 text-[var(--info)]">
            <AlertCircle className="w-4 h-4 mr-1" /> Wait
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--bg-quaternary)] text-[var(--text-muted)]">
            <AlertCircle className="w-4 h-4 mr-1" /> Unknown
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="text-subheading">Futures Symbol Analysis</h3>
        </div>
        
        {/* Real-time Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              realTimeMode 
                ? 'bg-[var(--success)]/20 text-[var(--success)]' 
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-muted)]'}`}></div>
            <span>{realTimeMode ? 'Live' : 'Static'}</span>
          </button>
          
          {realTimeMode && (
            <div className="flex items-center space-x-1 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              <span>Auto-updating</span>
            </div>
          )}
        </div>
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
        <div className="mt-6 space-y-6">
          {/* Summary Card */}
          {parsedAnalysis && (
            <div className="professional-card fade-in">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div className="flex items-center mb-3 md:mb-0">
                  <h3 className="text-subheading mr-3">Analysis Summary</h3>
                  {renderRecommendationBadge(parsedAnalysis)}
                </div>
                <div className="text-sm text-[var(--text-muted)] flex items-center">
                  <span>Generated by {selectedProvider}</span>
                  <div className="w-2 h-2 ml-2 bg-[var(--success)] rounded-full"></div>
                </div>
              </div>

              <div className="p-4 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent-primary)] mb-2">
                    {parsedAnalysis.trend} Trend
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mb-4">
                    AI recommends to {parsedAnalysis.action} with {parsedAnalysis.confidence} confidence
                  </div>
                  <div className="mt-4 border-t border-[var(--border-primary)] pt-4">
                    <span className="text-sm text-[var(--text-muted)]">
                      See detailed analysis below for entry/exit levels and reasoning
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          <div className="professional-card fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subheading">Detailed Analysis</h3>
            </div>

            <div className="prose prose-invert max-w-none">
              {/* Use white-space: pre-wrap to preserve formatting */}
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>
            </div>
          </div>

          {/* Performance Cards */}
          {performance && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="professional-card fade-in">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--success)] mb-1">
                    {performance.winRate || 'N/A'}%
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Win Rate</div>
                </div>
              </div>
              <div className="professional-card fade-in">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent-primary)] mb-1">
                    {performance.accuracy || 'N/A'}%
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Accuracy</div>
                </div>
              </div>
              <div className="professional-card fade-in">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--info)] mb-1">
                    {performance.totalSignals || 'N/A'}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Total Signals</div>
                </div>
              </div>
              <div className="professional-card fade-in">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--warning)] mb-1">
                    {performance.avgReturn || 'N/A'}%
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">Avg Return</div>
                </div>
              </div>
            </div>
          )}

          {/* Watchlist Section */}
          {watchlist.length > 0 && (
            <div className="professional-card fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-subheading">Watchlist</h3>
                <Bell className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {watchlist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-sm text-[var(--text-muted)]">Alert: ${item.alertPrice}</div>
                    </div>
                    <button
                      onClick={() => addToWatchlist(item.symbol, null)} // Remove from watchlist
                      className="text-[var(--error)] hover:text-[var(--error)]/80"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSymbolAnalysis;