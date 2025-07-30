// Export all ML model components
export { default as CNN1D } from './CNN1D';
export { default as LSTM } from './LSTM';
export { default as Transformer } from './Transformer';
export { default as CatBoost } from './CatBoost';

// Create remaining models using template
import React from 'react';
import { Zap, Database, Network, Grid3x3, TrendingUp, AlertTriangle, Layers, Shuffle, Lock, Calculator } from 'lucide-react';
import MLModelTemplate from './MLModelTemplate';

export const LightGBM = () => (
  <MLModelTemplate
    modelName="LightGBM"
    icon={Zap}
    accuracy="92.8%"
    precision="90.5%"
    recall="91.3%"
    f1Score="90.9%"
    description="Fast gradient boosting framework optimized for speed and memory efficiency. Excellent for large-scale financial datasets."
    features={["• Lightning-fast training", "• Memory efficient", "• High accuracy", "• Parallel learning support"]}
    currentSignal="Hold Signal"
    confidence="82%"
    target="$4,150 (+0.1%)"
  />
);

export const XGBoost = () => (
  <MLModelTemplate
    modelName="XGBoost"
    icon={Database}
    accuracy="93.1%"
    precision="91.2%"
    recall="92.0%"
    f1Score="91.6%"
    description="Extreme gradient boosting algorithm known for winning machine learning competitions. Highly effective for structured financial data."
    features={["• Regularization to prevent overfitting", "• Cross-validation built-in", "• Feature importance ranking", "• Handles missing values"]}
    currentSignal="Weak Buy"
    confidence="78%"
    target="$4,200 (+1.3%)"
  />
);

export const TabNet = () => (
  <MLModelTemplate
    modelName="TabNet"
    icon={Grid3x3}
    accuracy="91.7%"
    precision="89.8%"
    recall="90.5%"
    f1Score="90.1%"
    description="Deep learning architecture specifically designed for tabular data. Uses attention mechanisms for feature selection."
    features={["• Attention-based feature selection", "• Interpretable predictions", "• End-to-end learning", "• Sequential decision making"]}
    currentSignal="Neutral"
    confidence="74%"
    target="$4,140 (-0.1%)"
  />
);

export const VolatilityHybrid = () => (
  <MLModelTemplate
    modelName="Volatility Hybrid"
    icon={TrendingUp}
    accuracy="89.3%"
    precision="87.1%"
    recall="88.7%"
    f1Score="87.9%"
    description="Hybrid model combining multiple volatility forecasting techniques for comprehensive market risk assessment."
    features={["• Multi-model ensemble", "• Volatility clustering detection", "• Risk-adjusted predictions", "• Real-time volatility tracking"]}
    currentSignal="High Volatility"
    confidence="91%"
    target="Risk: High"
  />
);

export const Uncertainty = () => (
  <MLModelTemplate
    modelName="Uncertainty"
    icon={AlertTriangle}
    accuracy="88.5%"
    precision="86.2%"
    recall="87.8%"
    f1Score="87.0%"
    description="Bayesian neural network that quantifies prediction uncertainty, providing confidence intervals for all forecasts."
    features={["• Uncertainty quantification", "• Confidence intervals", "• Bayesian inference", "• Risk-aware predictions"]}
    currentSignal="Uncertain"
    confidence="65%"
    target="Range: $4,100-$4,300"
  />
);

export const RegimeDetector = () => (
  <MLModelTemplate
    modelName="Regime Detector"
    icon={Layers}
    accuracy="90.2%"
    precision="88.7%"
    recall="89.4%"
    f1Score="89.0%"
    description="Hidden Markov Model that identifies different market regimes (bull, bear, sideways) for adaptive trading strategies."
    features={["• Market regime identification", "• Regime transition detection", "• Adaptive strategy selection", "• Historical regime analysis"]}
    currentSignal="Bull Regime"
    confidence="87%"
    target="Regime: Bullish"
  />
);

export const EnsembleMeta = () => (
  <MLModelTemplate
    modelName="Ensemble Meta"
    icon={Shuffle}
    accuracy="95.1%"
    precision="93.8%"
    recall="94.2%"
    f1Score="94.0%"
    description="Meta-learning ensemble that combines predictions from multiple models using advanced stacking techniques."
    features={["• Multi-model ensemble", "• Meta-learning optimization", "• Adaptive weight assignment", "• Superior generalization"]}
    currentSignal="Strong Buy"
    confidence="96%"
    target="$4,380 (+5.6%)"
  />
);

export const Autoencoder = () => (
  <MLModelTemplate
    modelName="Autoencoder"
    icon={Lock}
    accuracy="87.9%"
    precision="85.3%"
    recall="86.8%"
    f1Score="86.0%"
    description="Deep autoencoder for anomaly detection and feature extraction in financial time series data."
    features={["• Anomaly detection", "• Feature compression", "• Noise reduction", "• Pattern reconstruction"]}
    currentSignal="Anomaly Detected"
    confidence="83%"
    target="Alert: Unusual Activity"
  />
);

export const BayesianRisk = () => (
  <MLModelTemplate
    modelName="Bayesian Risk"
    icon={Calculator}
    accuracy="89.7%"
    precision="87.5%"
    recall="88.9%"
    f1Score="88.2%"
    description="Bayesian approach to risk modeling that incorporates prior knowledge and updates beliefs with new market data."
    features={["• Bayesian inference", "• Prior knowledge integration", "• Probabilistic risk assessment", "• Adaptive learning"]}
    currentSignal="Medium Risk"
    confidence="79%"
    target="VaR: -2.3%"
  />
);
