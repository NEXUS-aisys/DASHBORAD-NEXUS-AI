import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, BarChart3, Activity, Zap, TreePine, Database, 
  Grid3x3, AlertTriangle, Layers, Shuffle, Lock, Calculator, Repeat, RefreshCw
} from 'lucide-react';
import mlBotService from '../services/mlBotService';

const MLModels = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelsData, setModelsData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Add performance history tracking
  const addPerformanceSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      analytics: getPerformanceAnalytics()
    };
    setPerformanceHistory(prev => {
      const newHistory = [...prev, snapshot];
      // Keep only last 20 snapshots
      return newHistory.slice(-20);
    });
  };

  // Update performance history when data changes
  useEffect(() => {
    if (Object.keys(modelsData).length > 0 && isConnected) {
      addPerformanceSnapshot();
    }
  }, [modelsData, isConnected]);

  // Performance Analytics Calculations
  const getPerformanceAnalytics = () => {
    const activeModels = Object.values(modelsData).filter(model => model.status === 'Active');
    
    if (activeModels.length === 0) {
      return {
        bestAccuracy: { model: 'N/A', value: 0 },
        avgF1Score: 0,
        topPerformer: { model: 'N/A', score: 0 },
        collectivePerformance: {
          avgAccuracy: 0,
          avgPrecision: 0,
          avgRecall: 0,
          totalModels: 0,
          activeModels: 0
        },
        performanceChart: [],
        accuracyComparison: [],
        modelRankings: []
      };
    }

    // Parse numeric values from percentage strings
    const parsePercentage = (str) => {
      const num = parseFloat(str.replace('%', ''));
      return isNaN(num) ? 0 : num;
    };

    // Calculate best accuracy
    const bestAccuracy = activeModels.reduce((best, model, index) => {
      const accuracy = parsePercentage(model.accuracy);
      return accuracy > best.value ? { model: Object.keys(modelsData)[index], value: accuracy } : best;
    }, { model: 'N/A', value: 0 });

    // Calculate average F1-Score
    const avgF1Score = activeModels.reduce((sum, model) => {
      return sum + parsePercentage(model.f1Score);
    }, 0) / activeModels.length;

    // Calculate top performer (based on F1-Score)
    const topPerformer = activeModels.reduce((top, model, index) => {
      const f1Score = parsePercentage(model.f1Score);
      return f1Score > top.score ? { model: Object.keys(modelsData)[index], score: f1Score } : top;
    }, { model: 'N/A', score: 0 });

    // Collective performance metrics
    const collectivePerformance = {
      avgAccuracy: activeModels.reduce((sum, model) => sum + parsePercentage(model.accuracy), 0) / activeModels.length,
      avgPrecision: activeModels.reduce((sum, model) => sum + parsePercentage(model.precision), 0) / activeModels.length,
      avgRecall: activeModels.reduce((sum, model) => sum + parsePercentage(model.recall), 0) / activeModels.length,
      totalModels: Object.keys(modelsData).length,
      activeModels: activeModels.length
    };

    // Performance chart data (for visualization)
    const performanceChart = Object.entries(modelsData).map(([modelName, model]) => ({
      model: modelName.toUpperCase(),
      accuracy: parsePercentage(model.accuracy),
      precision: parsePercentage(model.precision),
      recall: parsePercentage(model.recall),
      f1Score: parsePercentage(model.f1Score),
      status: model.status
    }));

    // Accuracy comparison data
    const accuracyComparison = Object.entries(modelsData).map(([modelName, model]) => ({
      model: modelName.toUpperCase(),
      accuracy: parsePercentage(model.accuracy),
      color: model.status === 'Active' ? '#10B981' : '#6B7280'
    }));

    // Model rankings (sorted by F1-Score)
    const modelRankings = Object.entries(modelsData)
      .map(([modelName, model]) => ({
        model: modelName.toUpperCase(),
        f1Score: parsePercentage(model.f1Score),
        accuracy: parsePercentage(model.accuracy),
        status: model.status
      }))
      .sort((a, b) => b.f1Score - a.f1Score);

    return {
      bestAccuracy,
      avgF1Score,
      topPerformer,
      collectivePerformance,
      performanceChart,
      accuracyComparison,
      modelRankings
    };
  };

  const analytics = getPerformanceAnalytics();

  // Load all models data from Local Bot
  const loadModelsData = async () => {
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

      // Load data for all models
      const modelIds = ['cnn1d', 'lstm', 'transformer', 'catboost', 'lightgbm', 'xgboost'];
      const newModelsData = {};

      for (const modelId of modelIds) {
        try {
          // Get model metrics
          const metrics = await mlBotService.getModelMetrics(modelId);
          if (metrics) {
            newModelsData[modelId] = {
              accuracy: `${metrics.accuracy || 0}%`,
              precision: `${metrics.precision || 0}%`,
              recall: `${metrics.recall || 0}%`,
              f1Score: `${metrics.f1_score || 0}%`,
              status: metrics.status || 'Active'
            };
          }

          // Get current prediction (using BTC as default symbol)
          const prediction = await mlBotService.getModelPrediction(modelId, 'BTC');
          if (prediction) {
            newModelsData[modelId] = {
              ...newModelsData[modelId],
              currentSignal: prediction.signal || 'No Signal',
              confidence: `${prediction.confidence || 0}%`,
              target: prediction.target || 'No Target'
            };
          }
        } catch (error) {
          console.error(`Error loading data for ${modelId}:`, error);
        }
      }

      setModelsData(newModelsData);

    } catch (error) {
      console.error('Error loading models data:', error);
      setError('Failed to load models data from Local Bot');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadModelsData();
  }, []);

  // Listen for real-time updates from Local Bot
  useEffect(() => {
    const handlePrediction = (data) => {
      setModelsData(prev => ({
        ...prev,
        [data.model]: {
          ...prev[data.model],
          currentSignal: data.signal || 'No Signal',
          confidence: `${data.confidence || 0}%`,
          target: data.target || 'No Target'
        }
      }));
    };

    const handleMetrics = (data) => {
      setModelsData(prev => ({
        ...prev,
        [data.model]: {
          ...prev[data.model],
          accuracy: `${data.accuracy || 0}%`,
          precision: `${data.precision || 0}%`,
          recall: `${data.recall || 0}%`,
          f1Score: `${data.f1_score || 0}%`
        }
      }));
    };

    const handleStatus = (data) => {
      setModelsData(prev => ({
        ...prev,
        [data.model]: {
          ...prev[data.model],
          status: data.status || 'Active'
        }
      }));
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

  const models = [
    {
      id: 'cnn1d',
      name: 'CNN1D',
      icon: Zap,
      accuracy: modelsData.cnn1d?.accuracy || 'Loading...',
      precision: modelsData.cnn1d?.precision || 'Loading...',
      recall: modelsData.cnn1d?.recall || 'Loading...',
      f1Score: modelsData.cnn1d?.f1Score || 'Loading...',
      description: '1D Convolutional Neural Network optimized for time series pattern recognition in financial data.',
      features: ['Temporal pattern recognition', 'Multi-scale feature extraction', 'Real-time prediction', 'Robust to market noise'],
      currentSignal: modelsData.cnn1d?.currentSignal || 'Loading...',
      confidence: modelsData.cnn1d?.confidence || 'Loading...',
      target: modelsData.cnn1d?.target || 'Loading...',
      status: modelsData.cnn1d?.status || 'Connecting...'
    },
    {
      id: 'lstm',
      name: 'LSTM',
      icon: Repeat,
      accuracy: modelsData.lstm?.accuracy || 'Loading...',
      precision: modelsData.lstm?.precision || 'Loading...',
      recall: modelsData.lstm?.recall || 'Loading...',
      f1Score: modelsData.lstm?.f1Score || 'Loading...',
      description: 'Long Short-Term Memory network designed for sequential data analysis and long-term dependencies.',
      features: ['Long-term memory retention', 'Sequential pattern recognition', 'Handles vanishing gradient', 'Excellent for trends'],
      currentSignal: modelsData.lstm?.currentSignal || 'Loading...',
      confidence: modelsData.lstm?.confidence || 'Loading...',
      target: modelsData.lstm?.target || 'Loading...',
      status: modelsData.lstm?.status || 'Connecting...'
    },
    {
      id: 'transformer',
      name: 'Transformer',
      icon: Layers,
      accuracy: modelsData.transformer?.accuracy || 'Loading...',
      precision: modelsData.transformer?.precision || 'Loading...',
      recall: modelsData.transformer?.recall || 'Loading...',
      f1Score: modelsData.transformer?.f1Score || 'Loading...',
      description: 'State-of-the-art attention-based model using self-attention mechanisms for complex pattern recognition.',
      features: ['Self-attention mechanism', 'Parallel processing', 'Multi-head attention', 'Superior pattern recognition'],
      currentSignal: modelsData.transformer?.currentSignal || 'Loading...',
      confidence: modelsData.transformer?.confidence || 'Loading...',
      target: modelsData.transformer?.target || 'Loading...',
      status: modelsData.transformer?.status || 'Connecting...'
    },
    {
      id: 'catboost',
      name: 'CatBoost',
      icon: TreePine,
      accuracy: modelsData.catboost?.accuracy || 'Loading...',
      precision: modelsData.catboost?.precision || 'Loading...',
      recall: modelsData.catboost?.recall || 'Loading...',
      f1Score: modelsData.catboost?.f1Score || 'Loading...',
      description: 'Gradient boosting algorithm that handles categorical features automatically without preprocessing.',
      features: ['Automatic categorical handling', 'Robust to overfitting', 'Fast training', 'Built-in feature importance'],
      currentSignal: modelsData.catboost?.currentSignal || 'Loading...',
      confidence: modelsData.catboost?.confidence || 'Loading...',
      target: modelsData.catboost?.target || 'Loading...',
      status: modelsData.catboost?.status || 'Connecting...'
    },
    {
      id: 'lightgbm',
      name: 'LightGBM',
      icon: Zap,
      accuracy: modelsData.lightgbm?.accuracy || 'Loading...',
      precision: modelsData.lightgbm?.precision || 'Loading...',
      recall: modelsData.lightgbm?.recall || 'Loading...',
      f1Score: modelsData.lightgbm?.f1Score || 'Loading...',
      description: 'Fast gradient boosting framework optimized for speed and memory efficiency.',
      features: ['Lightning-fast training', 'Memory efficient', 'High accuracy', 'Parallel learning support'],
      currentSignal: modelsData.lightgbm?.currentSignal || 'Loading...',
      confidence: modelsData.lightgbm?.confidence || 'Loading...',
      target: modelsData.lightgbm?.target || 'Loading...',
      status: modelsData.lightgbm?.status || 'Connecting...'
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      icon: Database,
      accuracy: modelsData.xgboost?.accuracy || 'Loading...',
      precision: modelsData.xgboost?.precision || 'Loading...',
      recall: modelsData.xgboost?.recall || 'Loading...',
      f1Score: modelsData.xgboost?.f1Score || 'Loading...',
      description: 'Extreme gradient boosting algorithm known for winning machine learning competitions.',
      features: ['Regularization built-in', 'Cross-validation support', 'Feature importance ranking', 'Handles missing values'],
      currentSignal: modelsData.xgboost?.currentSignal || 'Loading...',
      confidence: modelsData.xgboost?.confidence || 'Loading...',
      target: modelsData.xgboost?.target || 'Loading...',
      status: modelsData.xgboost?.status || 'Connecting...'
    },
    {
      id: 'tabnet',
      name: 'TabNet',
      icon: Grid3x3,
      accuracy: modelsData.tabnet?.accuracy || 'Loading...',
      precision: modelsData.tabnet?.precision || 'Loading...',
      recall: modelsData.tabnet?.recall || 'Loading...',
      f1Score: modelsData.tabnet?.f1Score || 'Loading...',
      description: 'Deep learning architecture specifically designed for tabular data with attention mechanisms.',
      features: ['Attention-based selection', 'Interpretable predictions', 'End-to-end learning', 'Sequential decision making'],
      currentSignal: modelsData.tabnet?.currentSignal || 'Loading...',
      confidence: modelsData.tabnet?.confidence || 'Loading...',
      target: modelsData.tabnet?.target || 'Loading...',
      status: modelsData.tabnet?.status || 'Connecting...'
    },
    {
      id: 'volatility-hybrid',
      name: 'Volatility Hybrid',
      icon: TrendingUp,
      accuracy: modelsData['volatility-hybrid']?.accuracy || 'Loading...',
      precision: modelsData['volatility-hybrid']?.precision || 'Loading...',
      recall: modelsData['volatility-hybrid']?.recall || 'Loading...',
      f1Score: modelsData['volatility-hybrid']?.f1Score || 'Loading...',
      description: 'Hybrid model combining multiple volatility forecasting techniques for risk assessment.',
      features: ['Multi-model ensemble', 'Volatility clustering', 'Risk-adjusted predictions', 'Real-time tracking'],
      currentSignal: modelsData['volatility-hybrid']?.currentSignal || 'Loading...',
      confidence: modelsData['volatility-hybrid']?.confidence || 'Loading...',
      target: modelsData['volatility-hybrid']?.target || 'Loading...',
      status: modelsData['volatility-hybrid']?.status || 'Connecting...'
    },
    {
      id: 'uncertainty',
      name: 'Uncertainty',
      icon: AlertTriangle,
      accuracy: modelsData.uncertainty?.accuracy || 'Loading...',
      precision: modelsData.uncertainty?.precision || 'Loading...',
      recall: modelsData.uncertainty?.recall || 'Loading...',
      f1Score: modelsData.uncertainty?.f1Score || 'Loading...',
      description: 'Bayesian neural network that quantifies prediction uncertainty with confidence intervals.',
      features: ['Uncertainty quantification', 'Confidence intervals', 'Bayesian inference', 'Risk-aware predictions'],
      currentSignal: modelsData.uncertainty?.currentSignal || 'Loading...',
      confidence: modelsData.uncertainty?.confidence || 'Loading...',
      target: modelsData.uncertainty?.target || 'Loading...',
      status: modelsData.uncertainty?.status || 'Connecting...'
    },
    {
      id: 'regime-detector',
      name: 'Regime Detector',
      icon: Layers,
      accuracy: modelsData['regime-detector']?.accuracy || 'Loading...',
      precision: modelsData['regime-detector']?.precision || 'Loading...',
      recall: modelsData['regime-detector']?.recall || 'Loading...',
      f1Score: modelsData['regime-detector']?.f1Score || 'Loading...',
      description: 'Hidden Markov Model that identifies different market regimes for adaptive strategies.',
      features: ['Market regime identification', 'Regime transition detection', 'Adaptive strategy selection', 'Historical analysis'],
      currentSignal: modelsData['regime-detector']?.currentSignal || 'Loading...',
      confidence: modelsData['regime-detector']?.confidence || 'Loading...',
      target: modelsData['regime-detector']?.target || 'Loading...',
      status: modelsData['regime-detector']?.status || 'Connecting...'
    },
    {
      id: 'ensemble-meta',
      name: 'Ensemble Meta',
      icon: Shuffle,
      accuracy: modelsData['ensemble-meta']?.accuracy || 'Loading...',
      precision: modelsData['ensemble-meta']?.precision || 'Loading...',
      recall: modelsData['ensemble-meta']?.recall || 'Loading...',
      f1Score: modelsData['ensemble-meta']?.f1Score || 'Loading...',
      description: 'Meta-learning ensemble that combines predictions from multiple models using stacking.',
      features: ['Multi-model ensemble', 'Meta-learning optimization', 'Adaptive weight assignment', 'Superior generalization'],
      currentSignal: modelsData['ensemble-meta']?.currentSignal || 'Loading...',
      confidence: modelsData['ensemble-meta']?.confidence || 'Loading...',
      target: modelsData['ensemble-meta']?.target || 'Loading...',
      status: modelsData['ensemble-meta']?.status || 'Connecting...'
    },
    {
      id: 'autoencoder',
      name: 'Autoencoder',
      icon: Lock,
      accuracy: modelsData.autoencoder?.accuracy || 'Loading...',
      precision: modelsData.autoencoder?.precision || 'Loading...',
      recall: modelsData.autoencoder?.recall || 'Loading...',
      f1Score: modelsData.autoencoder?.f1Score || 'Loading...',
      description: 'Deep autoencoder for anomaly detection and feature extraction in financial time series.',
      features: ['Anomaly detection', 'Feature compression', 'Noise reduction', 'Pattern reconstruction'],
      currentSignal: modelsData.autoencoder?.currentSignal || 'Loading...',
      confidence: modelsData.autoencoder?.confidence || 'Loading...',
      target: modelsData.autoencoder?.target || 'Loading...',
      status: modelsData.autoencoder?.status || 'Connecting...'
    },
    {
      id: 'bayesian-risk',
      name: 'Bayesian Risk',
      icon: Calculator,
      accuracy: modelsData['bayesian-risk']?.accuracy || 'Loading...',
      precision: modelsData['bayesian-risk']?.precision || 'Loading...',
      recall: modelsData['bayesian-risk']?.recall || 'Loading...',
      f1Score: modelsData['bayesian-risk']?.f1Score || 'Loading...',
      description: 'Bayesian approach to risk modeling that incorporates prior knowledge and updates beliefs.',
      features: ['Bayesian inference', 'Prior knowledge integration', 'Probabilistic risk assessment', 'Adaptive learning'],
      currentSignal: modelsData['bayesian-risk']?.currentSignal || 'Loading...',
      confidence: modelsData['bayesian-risk']?.confidence || 'Loading...',
      target: modelsData['bayesian-risk']?.target || 'Loading...',
      status: modelsData['bayesian-risk']?.status || 'Connecting...'
    }
  ];

  const getSignalColor = (signal) => {
    if (signal.includes('Buy') || signal.includes('Bullish') || signal.includes('Bull')) return 'text-green-500 bg-green-500';
    if (signal.includes('Sell') || signal.includes('Bearish') || signal.includes('Bear')) return 'text-red-500 bg-red-500';
    if (signal.includes('Hold') || signal.includes('Neutral') || signal.includes('Sideways')) return 'text-yellow-500 bg-yellow-500';
    if (signal.includes('Risk') || signal.includes('Volatility') || signal.includes('Uncertain')) return 'text-orange-500 bg-orange-500';
    if (signal.includes('Anomaly') || signal.includes('Alert')) return 'text-red-500 bg-red-500';
    return 'text-blue-500 bg-blue-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between fade-in">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">ML Models</h1>
          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-sm ${
            isConnected 
              ? 'bg-green-500/5 text-green-600 border border-green-500/20' 
              : 'bg-red-500/5 text-red-600 border border-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected to Local Bot' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadModelsData}
            disabled={isLoading}
            className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
          <span className="ml-2 text-[var(--text-primary)]">Loading models data from Local Bot...</span>
        </div>
      )}

      {/* Individual Model Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, index) => {
            const Icon = model.icon;
            const isActive = model.status === 'Active';
            
            return (
              <div
                key={model.id}
                className={`professional-card fade-in ${isActive ? 'border-[var(--success)]/30' : 'border-[var(--border-primary)]/50'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-[var(--success)]/10' : 'bg-[var(--text-muted)]/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{model.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? 'bg-[var(--success)]/20 text-[var(--success)]' 
                          : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {model.accuracy === 'Loading...' ? '--' : parseFloat(model.accuracy.replace('%', '')).toFixed(1) + '%'}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {model.confidence === 'Loading...' ? '--' : model.confidence}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Confidence</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-4">{model.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Signal */}
                <div className="border-t border-[var(--border-primary)]/50 pt-4">
                  <div className="text-sm">
                    <span className="text-[var(--text-secondary)]">Current Signal:</span>
                    <span className="text-[var(--text-primary)] ml-2">
                      {model.currentSignal === 'Loading...' ? 'Waiting for data...' : model.currentSignal}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[var(--text-secondary)]">Target:</span>
                    <span className="text-[var(--success)] ml-2">
                      {model.target === 'Loading...' ? 'Waiting for data...' : model.target}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics Dashboard */}
      {!isLoading && isConnected && (
        <div className="space-y-6 mt-8">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Best Accuracy</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {analytics.bestAccuracy.value.toFixed(1)}%
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{analytics.bestAccuracy.model}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Active Models</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {analytics.collectivePerformance.activeModels}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    of {analytics.collectivePerformance.totalModels} total
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Avg F1-Score</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {analytics.avgF1Score.toFixed(1)}%
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">Collective Performance</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Top Performer</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {analytics.topPerformer.score.toFixed(1)}%
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{analytics.topPerformer.model}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Comparison Chart */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Accuracy Comparison</h3>
              <div className="h-64">
                {analytics.accuracyComparison.length > 0 ? (
                  <div className="h-full flex items-end justify-between space-x-2">
                    {analytics.accuracyComparison.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                          style={{
                            height: `${(item.accuracy / 100) * 200}px`,
                            backgroundColor: item.color,
                            minHeight: '20px'
                          }}
                        />
                        <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                          {item.model}
                        </div>
                        <div className="text-xs font-medium text-[var(--text-primary)]">
                          {item.accuracy.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
                      <p className="text-[var(--text-secondary)]">No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Model Rankings */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Model Rankings</h3>
              <div className="space-y-3">
                {analytics.modelRankings.slice(0, 6).map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                        index === 1 ? 'bg-gray-500/20 text-gray-600' :
                        index === 2 ? 'bg-orange-500/20 text-orange-600' :
                        'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{model.model}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Accuracy: {model.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">{model.f1Score.toFixed(1)}%</p>
                      <p className="text-xs text-[var(--text-secondary)]">F1-Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Collective Performance Metrics */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Collective Model Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border-primary)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={`${analytics.collectivePerformance.avgAccuracy}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {analytics.collectivePerformance.avgAccuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Average Accuracy</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border-primary)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray={`${analytics.collectivePerformance.avgPrecision}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {analytics.collectivePerformance.avgPrecision.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Average Precision</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border-primary)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeDasharray={`${analytics.collectivePerformance.avgRecall}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {analytics.collectivePerformance.avgRecall.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Average Recall</p>
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Performance Trend</h3>
            <div className="h-64">
              {performanceHistory.length > 1 ? (
                <div className="h-full relative">
                  <svg width="100%" height="100%" className="text-[var(--text-primary)]">
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                    <g>
                      {/* Y-axis */}
                      <line x1="40" y1="20" x2="40" y2="220" stroke="var(--border-primary)" strokeWidth="1"/>
                      {/* X-axis */}
                      <line x1="40" y1="220" x2="580" y2="220" stroke="var(--border-primary)" strokeWidth="1"/>
                      
                      {/* Trend line */}
                      {performanceHistory.map((snapshot, index) => {
                        if (index === 0) return null;
                        const prevSnapshot = performanceHistory[index - 1];
                        const x1 = 40 + (index - 1) * (540 / (performanceHistory.length - 1));
                        const y1 = 220 - (prevSnapshot.analytics.avgF1Score / 100) * 180;
                        const x2 = 40 + index * (540 / (performanceHistory.length - 1));
                        const y2 = 220 - (snapshot.analytics.avgF1Score / 100) * 180;
                        
                        return (
                          <line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#8B5CF6"
                            strokeWidth="2"
                          />
                        );
                      })}
                      
                      {/* Fill area */}
                      <path
                        d={`M 40 220 ${performanceHistory.map((snapshot, index) => {
                          const x = 40 + index * (540 / (performanceHistory.length - 1));
                          const y = 220 - (snapshot.analytics.avgF1Score / 100) * 180;
                          return `L ${x} ${y}`;
                        }).join(' ')} L 580 220 Z`}
                        fill="url(#trendGradient)"
                      />
                      
                      {/* Data points */}
                      {performanceHistory.map((snapshot, index) => {
                        const x = 40 + index * (540 / (performanceHistory.length - 1));
                        const y = 220 - (snapshot.analytics.avgF1Score / 100) * 180;
                        
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#8B5CF6"
                            className="hover:r-4 transition-all duration-200"
                          />
                        );
                      })}
                    </g>
                  </svg>
                  <div className="absolute top-2 right-2 text-xs text-[var(--text-secondary)]">
                    Avg F1-Score over time
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
                    <p className="text-[var(--text-secondary)]">Collecting performance data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLModels;
