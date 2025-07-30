import React from 'react';
import { Brain, TrendingUp, BarChart3, Activity, Layers } from 'lucide-react';

const Transformer = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Layers className="w-8 h-8 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transformer Model</h1>
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
            <p className="text-xl font-bold text-[var(--text-primary)]">96.1%</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">Precision</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">94.7%</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-[var(--text-secondary)]">Recall</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">93.2%</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-[var(--text-secondary)]">F1-Score</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)]">93.9%</p>
          </div>
        </div>
      </div>

      {/* Model Analysis */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Transformer Analysis</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Model Architecture</h3>
            <p className="text-[var(--text-secondary)]">
              State-of-the-art attention-based model that processes entire sequences simultaneously. 
              Uses self-attention mechanisms to capture complex relationships in financial data.
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Key Features</h3>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• Self-attention mechanism</li>
              <li>• Parallel processing capability</li>
              <li>• Multi-head attention</li>
              <li>• Superior pattern recognition</li>
            </ul>
          </div>
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="font-medium text-[var(--text-primary)] mb-2">Current Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 rounded-lg">
                <p className="text-green-500 font-medium">Strong Buy</p>
                <p className="text-sm text-[var(--text-secondary)]">Confidence: 94%</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
                <p className="text-blue-500 font-medium">Price Target</p>
                <p className="text-sm text-[var(--text-secondary)]">$4,450 (+7.2%)</p>
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
            <Layers className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">Transformer attention-based analysis and prediction metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transformer;
