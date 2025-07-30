import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  RefreshCw,
  DollarSign,
  Volume2
} from 'lucide-react';
import apiService from '../services/apiService';

const Analysis = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const symbol = state?.selectedSymbol;

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!symbol) return;
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getSymbolAnalysis(symbol);
        setAnalysisData(response.data);
      } catch (err) {
        setError(`Failed to fetch comprehensive analysis for ${symbol}`);
        console.error('Error fetching analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [symbol]);

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume) => {
    if (typeof volume !== 'number') return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'text-[var(--success)]';
      case 'SELL': return 'text-[var(--error)]';
      case 'HOLD': return 'text-[var(--warning)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-5 h-5" />;
      case 'SELL': return <TrendingDown className="w-5 h-5" />;
      case 'HOLD': return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-[var(--success)]';
      case 'MEDIUM': return 'text-[var(--warning)]';
      case 'HIGH': return 'text-[var(--error)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getTrendColor = (trend) => {
    if (trend?.includes('BULLISH')) return 'text-[var(--success)]';
    if (trend?.includes('BEARISH')) return 'text-[var(--error)]';
    return 'text-[var(--text-muted)]';
  };

  if (!symbol) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Symbol Selected</h3>
          <p className="text-[var(--text-muted)] mb-4">Please select a symbol from the Data Monitor to analyze.</p>
          <button 
            onClick={() => navigate('/data-monitor')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            Go to Data Monitor
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Analyzing {symbol}</h3>
          <p className="text-[var(--text-muted)]">Generating comprehensive market analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Analysis Failed</h3>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-[var(--warning)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Data Available</h3>
          <p className="text-[var(--text-muted)]">No analysis data available for {symbol}.</p>
        </div>
      </div>
    );
  }

  const { marketData, technicalAnalysis, signals, riskAssessment, priceTargets, insights } = analysisData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/data-monitor')}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">{symbol} Analysis</h1>
            <p className="text-[var(--text-muted)]">Comprehensive market analysis and trading insights</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          analysisData.dataQuality === 'primary' 
            ? 'bg-[var(--success)]/10 text-[var(--success)]' 
            : 'bg-[var(--warning)]/10 text-[var(--warning)]'
        }`}>
          {analysisData.provider === 'polygon' ? 'Polygon API' : 
           analysisData.provider === 'alpha_vantage' ? 'Alpha Vantage' :
           analysisData.provider === 'bybit' ? 'Bybit API' : 'Real Data'}
        </div>
      </div>

      {/* Current Price & Change */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Market Data
          </h2>
          <div className="text-sm text-[var(--text-muted)]">
            {new Date(analysisData.timestamp).toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {formatPrice(marketData.price)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Current Price</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-semibold mb-1 flex items-center justify-center gap-1 ${
              marketData.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
            }`}>
              {marketData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {marketData.change >= 0 ? '+' : ''}{marketData.change?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Change</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-semibold mb-1 ${
              marketData.changePercent >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
            }`}>
              {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent?.toFixed(2) || '0.00'}%
            </div>
            <div className="text-sm text-[var(--text-muted)]">Change %</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-semibold text-[var(--text-primary)] mb-1 flex items-center justify-center gap-1">
              <Volume2 className="w-5 h-5" />
              {formatVolume(marketData.volume)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Volume</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-primary)]">
          <div className="text-center">
            <div className="font-semibold text-[var(--text-primary)]">{formatPrice(marketData.high)}</div>
            <div className="text-sm text-[var(--text-muted)]">Day High</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[var(--text-primary)]">{formatPrice(marketData.low)}</div>
            <div className="text-sm text-[var(--text-muted)]">Day Low</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[var(--text-primary)]">{formatPrice(marketData.open)}</div>
            <div className="text-sm text-[var(--text-muted)]">Open</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[var(--text-primary)]">{formatPrice(marketData.previousClose)}</div>
            <div className="text-sm text-[var(--text-muted)]">Prev Close</div>
          </div>
        </div>
      </div>

      {/* Trading Signals */}
      <div className="professional-card">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Trading Signals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${
              getSignalColor(signals.overall)
            }`}>
              {getSignalIcon(signals.overall)}
              {signals.overall}
            </div>
            <div className="text-sm text-[var(--text-muted)] mb-1">Overall Signal</div>
            <div className="text-xs text-[var(--text-muted)]">{signals.confidence?.toFixed(0)}% confidence</div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className={`text-lg font-semibold mb-2 flex items-center justify-center gap-2 ${
              getSignalColor(signals.shortTerm)
            }`}>
              {getSignalIcon(signals.shortTerm)}
              {signals.shortTerm}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Short Term</div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className={`text-lg font-semibold mb-2 flex items-center justify-center gap-2 ${
              getSignalColor(signals.mediumTerm)
            }`}>
              {getSignalIcon(signals.mediumTerm)}
              {signals.mediumTerm}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Medium Term</div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div className={`text-lg font-semibold mb-2 flex items-center justify-center gap-2 ${
              getSignalColor(signals.longTerm)
            }`}>
              {getSignalIcon(signals.longTerm)}
              {signals.longTerm}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Long Term</div>
          </div>
        </div>
      </div>

      {/* Technical Analysis & Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Analysis */}
        <div className="professional-card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Technical Analysis
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Trend</span>
              <span className={`font-semibold ${getTrendColor(technicalAnalysis.trend)}`}>
                {technicalAnalysis.trend?.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Momentum</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {technicalAnalysis.momentum}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Volatility</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {technicalAnalysis.volatility?.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Support</span>
              <span className="font-semibold text-[var(--success)]">
                {formatPrice(technicalAnalysis.support)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Resistance</span>
              <span className="font-semibold text-[var(--error)]">
                {formatPrice(technicalAnalysis.resistance)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">RSI</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {technicalAnalysis.rsi?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="professional-card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Assessment
          </h2>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(riskAssessment.level)}`}>
                {riskAssessment.level} RISK
              </div>
              <div className="text-sm text-[var(--text-muted)]">Risk Level</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-[var(--text-primary)]">Risk Factors:</h4>
              {riskAssessment.factors?.map((factor, index) => (
                <div key={index} className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <div className="w-1 h-1 bg-[var(--accent-primary)] rounded-full"></div>
                  {factor}
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">Recommendation:</h4>
              <p className="text-sm text-[var(--text-muted)]">{riskAssessment.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Targets */}
      <div className="professional-card">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Price Targets
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Immediate</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Support:</span>
                <span className="font-semibold text-[var(--success)]">
                  {formatPrice(priceTargets.immediate.support)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Resistance:</span>
                <span className="font-semibold text-[var(--error)]">
                  {formatPrice(priceTargets.immediate.resistance)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Near Term</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Support:</span>
                <span className="font-semibold text-[var(--success)]">
                  {formatPrice(priceTargets.nearTerm.support)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Resistance:</span>
                <span className="font-semibold text-[var(--error)]">
                  {formatPrice(priceTargets.nearTerm.resistance)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Long Term</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Support:</span>
                <span className="font-semibold text-[var(--success)]">
                  {formatPrice(priceTargets.longTerm.support)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Resistance:</span>
                <span className="font-semibold text-[var(--error)]">
                  {formatPrice(priceTargets.longTerm.resistance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="professional-card">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Key Insights
        </h2>
        
        <div className="space-y-3">
          {insights?.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-[var(--text-primary)]">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analysis;

