import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BarChart3, Activity, Repeat, AlertTriangle, RefreshCw } from 'lucide-react';
import mlBotService from '../../services/mlBotService';

const LSTM = () => {
  const [modelData, setModelData] = useState({
    accuracy: 'Loading...',
    precision: 'Loading...',
    recall: 'Loading...',
    f1Score: 'Loading...',
    currentSignal: 'Loading...',
    confidence: 'Loading...',
    target: 'Loading...',
    status: 'Connecting...'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [availableSymbols, setAvailableSymbols] = useState([]);

  // Load model data from Local Bot
  const loadModelData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check bot connection
      const botStatus = await mlBotService.checkBotStatus();
      setIsConnected(botStatus);
      
      if (!botStatus) {
        setError('Local Bot is not available. Please ensure the bot is running.');
        setIsLoading(false);
        return;
      }

      // Get model metrics
      const metrics = await mlBotService.getModelMetrics('lstm');
      if (metrics) {
        setModelData(prev => ({
          ...prev,
          accuracy: `${metrics.accuracy || 0}%`,
          precision: `${metrics.precision || 0}%`,
          recall: `${metrics.recall || 0}%`,
          f1Score: `${metrics.f1_score || 0}%`,
          status: metrics.status || 'Active'
        }));
      }

      // Get current prediction
      const prediction = await mlBotService.getModelPrediction('lstm', selectedSymbol);
      if (prediction) {
        setModelData(prev => ({
          ...prev,
          currentSignal: prediction.signal || 'No Signal',
          confidence: `${prediction.confidence || 0}%`,
          target: prediction.target || 'No Target'
        }));
      }

      // Get available symbols
      const symbols = await mlBotService.getAvailableSymbols();
      setAvailableSymbols(symbols);

    } catch (error) {
      console.error('Error loading LSTM data:', error);
      setError('Failed to load model data from Local Bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadModelData();
  }, []);

  // Listen for real-time updates from Local Bot
  useEffect(() => {
    const handlePrediction = (data) => {
      if (data.model === 'lstm') {
        setModelData(prev => ({
          ...prev,
          currentSignal: data.signal || prev.currentSignal,
          confidence: `${data.confidence || 0}%`,
          target: data.target || prev.target
        }));
      }
    };

    const handleMetrics = (data) => {
      if (data.model === 'lstm') {
        setModelData(prev => ({
          ...prev,
          accuracy: `${data.accuracy || 0}%`,
          precision: `${data.precision || 0}%`,
          recall: `${data.recall || 0}%`,
          f1Score: `${data.f1_score || 0}%`
        }));
      }
    };

    const handleStatus = (data) => {
      if (data.model === 'lstm') {
        setModelData(prev => ({
          ...prev,
          status: data.status || prev.status
        }));
      }
    };

    // Register event listeners
    mlBotService.on('prediction', handlePrediction);
    mlBotService.on('metrics', handleMetrics);
    mlBotService.on('status', handleStatus);

    // Cleanup
    return () => {
      // Note: mlBotService maintains global listeners, so we don't remove them
    };
  }, []);

  // Handle symbol change
  const handleSymbolChange = async (symbol) => {
    setSelectedSymbol(symbol);
    const prediction = await mlBotService.getModelPrediction('lstm', symbol);
    if (prediction) {
      setModelData(prev => ({
        ...prev,
        currentSignal: prediction.signal || 'No Signal',
        confidence: `${prediction.confidence || 0}%`,
        target: prediction.target || 'No Target'
      }));
    }
  };

  // Train model
  const handleTrainModel = async () => {
    try {
      setIsLoading(true);
      const result = await mlBotService.trainModel('lstm', {
        epochs: 100,
        batch_size: 32,
        learning_rate: 0.001,
        units: 128
      });
      
      if (result) {
        console.log('Model training started:', result);
        // Reload data after training
        setTimeout(loadModelData, 2000);
      }
    } catch (error) {
      console.error('Error training model:', error);
      setError('Failed to start model training');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Repeat className="w-8 h-8 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">LSTM Model</h1>
          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-sm ${
            isConnected 
              ? 'bg-green-500 bg-opacity-10 text-green-500 border border-green-500 border-opacity-20' 
              : 'bg-red-500 bg-opacity-10 text-red-500 border border-red-500 border-opacity-20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedSymbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            disabled={!isConnected}
          >
            {availableSymbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <button
            onClick={loadModelData}
            disabled={isLoading}
            className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleTrainModel}
            disabled={!isConnected || isLoading}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Training...' : 'Train Model'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-600">{error}</span>
        </div>
      )}

      {/* Model Overview */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Model Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-[var(--text-secondary)]">Accuracy</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{modelData.accuracy}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Precision</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{modelData.precision}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-[var(--text-secondary)]">Recall</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{modelData.recall}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-[var(--text-secondary)]">F1-Score</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{modelData.f1Score}</p>
          </div>
        </div>
      </div>

      {/* Model Analysis */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">LSTM Analysis</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Model Architecture</h3>
            <p className="text-[var(--text-secondary)]">
              Long Short-Term Memory network designed for sequential data analysis. Excels at capturing long-term dependencies 
              in financial time series and remembering important patterns over extended periods.
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Key Features</h3>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• Long-term memory retention</li>
              <li>• Sequential pattern recognition</li>
              <li>• Handles vanishing gradient problem</li>
              <li>• Excellent for trend prediction</li>
            </ul>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Current Predictions for {selectedSymbol}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg">
                <p className="text-yellow-500 font-medium">{modelData.currentSignal}</p>
                <p className="text-sm text-[var(--text-secondary)]">Confidence: {modelData.confidence}</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
                <p className="text-blue-500 font-medium">Next Target</p>
                <p className="text-sm text-[var(--text-secondary)]">{modelData.target}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Model Performance</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-lg">
          <div className="text-center">
            <Repeat className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">
              {isConnected 
                ? 'Real-time LSTM performance data from Local Bot' 
                : 'Connect to Local Bot to view LSTM performance data'
              }
            </p>
            {!isConnected && (
              <p className="text-sm text-red-500 mt-2">
                Local Bot connection required for live data
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LSTM;
