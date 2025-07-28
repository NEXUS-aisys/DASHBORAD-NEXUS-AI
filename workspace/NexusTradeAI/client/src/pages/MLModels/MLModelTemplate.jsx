import React from 'react';
import { Brain, TrendingUp, BarChart3, Activity } from 'lucide-react';

const MLModelTemplate = ({ 
  modelName, 
  icon: IconComponent = Brain, 
  accuracy = "90.0%", 
  precision = "88.5%", 
  recall = "89.2%", 
  f1Score = "88.8%",
  description = "Advanced machine learning model for financial market analysis and prediction.",
  features = [
    "• Advanced pattern recognition",
    "• Real-time prediction capabilities", 
    "• Robust performance metrics",
    "• Optimized for financial data"
  ],
  currentSignal = "Analyzing",
  confidence = "85%",
  target = "TBD"
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconComponent className="w-8 h-8 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{modelName} Model</h1>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
            Train Model
          </button>
        </div>
      </div>

      {/* Model Overview */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Model Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-[var(--text-secondary)]">Accuracy</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{accuracy}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Precision</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{precision}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-[var(--text-secondary)]">Recall</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{recall}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-[var(--text-secondary)]">F1-Score</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{f1Score}</p>
          </div>
        </div>
      </div>

      {/* Model Analysis */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{modelName} Analysis</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Model Description</h3>
            <p className="text-[var(--text-secondary)]">{description}</p>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Key Features</h3>
            <ul className="text-[var(--text-secondary)] space-y-1">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Current Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
                <p className="text-blue-500 font-medium">{currentSignal}</p>
                <p className="text-sm text-[var(--text-secondary)]">Confidence: {confidence}</p>
              </div>
              <div className="p-3 bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-20 rounded-lg">
                <p className="text-purple-500 font-medium">Target</p>
                <p className="text-sm text-[var(--text-secondary)]">{target}</p>
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
            <IconComponent className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">{modelName} model performance metrics and analysis charts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModelTemplate;
