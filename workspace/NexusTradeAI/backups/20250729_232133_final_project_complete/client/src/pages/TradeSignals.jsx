import React from 'react';
import { Activity, Signal } from 'lucide-react';
import EnhancedSymbolAnalysis from '../components/trading/EnhancedSymbolAnalysis';

const TradeSignals = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading">AI Trade Signals</h1>
          <p className="text-body">Get AI-powered analysis and trading signals for futures contracts</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]">
          <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
          <span>Live Data • Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="professional-card fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <Signal className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="text-subheading">Futures Contract Analysis</h3>
        </div>
        <p className="text-body mb-6">
          Enter a futures contract symbol to get detailed AI analysis including market trends, support/resistance levels, 
          technical indicators, and clear trading recommendations.
        </p>
        <EnhancedSymbolAnalysis />
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="professional-card fade-in" style={{ animationDelay: '300ms' }}>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <h4 className="text-lg font-medium mb-2">Technical Analysis</h4>
            <p className="text-[var(--text-muted)] text-sm">
              Get comprehensive technical analysis including trend direction, momentum indicators, and volume analysis
            </p>
          </div>
        </div>
        <div className="professional-card fade-in" style={{ animationDelay: '400ms' }}>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-3">
              <Signal className="w-6 h-6 text-[var(--success)]" />
            </div>
            <h4 className="text-lg font-medium mb-2">Clear Recommendations</h4>
            <p className="text-[var(--text-muted)] text-sm">
              Receive explicit buy, sell, or hold signals with confidence levels and risk assessment
            </p>
          </div>
        </div>
        <div className="professional-card fade-in" style={{ animationDelay: '500ms' }}>
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--warning)]/10 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-[var(--warning)]" />
            </div>
            <h4 className="text-lg font-medium mb-2">Risk Management</h4>
            <p className="text-[var(--text-muted)] text-sm">
              Get suggested stop-loss levels, take-profit targets, and position sizing recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSignals;