import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Bot, 
  PenTool, 
  FileText, 
  Calendar, 
  Filter, 
  Download, 
  Mail, 
  BarChart3, 
  TrendingUp,
  Plus,
  Search,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2,
  Image,
  Mic,
  Link,
  Smile,
  Clock,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useAppStatus } from '../contexts/AppStatusContext';

const TradingJournal = () => {
  const [activeTab, setActiveTab] = useState('bot-trades');
  const [botTrades, setBotTrades] = useState([]);
  const [manualTrades, setManualTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [tradeFilter, setTradeFilter] = useState('all');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isConnected } = useAppStatus();

  // Load trades from localStorage on component mount
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = () => {
    try {
      const savedBotTrades = localStorage.getItem('nexus_bot_trades');
      const savedManualTrades = localStorage.getItem('nexus_manual_trades');
      
      if (savedBotTrades) {
        setBotTrades(JSON.parse(savedBotTrades));
      }
      if (savedManualTrades) {
        setManualTrades(JSON.parse(savedManualTrades));
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const saveTrades = (type, trades) => {
    try {
      localStorage.setItem(`nexus_${type}_trades`, JSON.stringify(trades));
    } catch (error) {
      console.error('Error saving trades:', error);
    }
  };

  // Mock function to simulate bot trade sync
  const syncBotTrades = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock bot trade data
      const mockBotTrade = {
        id: Date.now(),
        type: 'bot',
        symbol: 'AAPL',
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entryPrice: (Math.random() * 200 + 100).toFixed(2),
        exitPrice: (Math.random() * 200 + 100).toFixed(2),
        contracts: Math.floor(Math.random() * 10) + 1,
        takeProfit: (Math.random() * 20 + 10).toFixed(2),
        stopLoss: (Math.random() * 10 + 5).toFixed(2),
        openTime: new Date().toISOString(),
        closeTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
        pnl: (Math.random() * 1000 - 500).toFixed(2),
        status: Math.random() > 0.3 ? 'closed' : 'open',
        strategy: ['Momentum', 'Mean Reversion', 'Breakout'][Math.floor(Math.random() * 3)]
      };

      const updatedTrades = [mockBotTrade, ...botTrades];
      setBotTrades(updatedTrades);
      saveTrades('bot_trades', updatedTrades);
    } catch (error) {
      console.error('Error syncing bot trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const addManualTrade = () => {
    const newTrade = {
      id: Date.now(),
      type: 'manual',
      symbol: '',
      action: 'BUY',
      entryPrice: '',
      exitPrice: '',
      contracts: 1,
      takeProfit: '',
      stopLoss: '',
      openTime: new Date().toISOString(),
      closeTime: '',
      pnl: '',
      status: 'open',
      notes: '',
      psychology: {
        emotion: 'neutral',
        confidence: 5,
        stress: 3,
        notes: ''
      },
      attachments: [],
      isEditing: true
    };

    setManualTrades([newTrade, ...manualTrades]);
    saveTrades('manual_trades', [newTrade, ...manualTrades]);
  };

  const updateTrade = (type, tradeId, updates) => {
    const trades = type === 'bot' ? botTrades : manualTrades;
    const setTrades = type === 'bot' ? setBotTrades : setManualTrades;
    
    const updatedTrades = trades.map(trade => 
      trade.id === tradeId ? { ...trade, ...updates } : trade
    );
    
    setTrades(updatedTrades);
    saveTrades(`${type}_trades`, updatedTrades);
  };

  const deleteTrade = (type, tradeId) => {
    const trades = type === 'bot' ? botTrades : manualTrades;
    const setTrades = type === 'bot' ? setBotTrades : setManualTrades;
    
    const updatedTrades = trades.filter(trade => trade.id !== tradeId);
    setTrades(updatedTrades);
    saveTrades(`${type}_trades`, updatedTrades);
  };

  const calculatePnl = (entryPrice, exitPrice, contracts, action) => {
    if (!entryPrice || !exitPrice || !contracts) return 0;
    const priceDiff = action === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
    return (priceDiff * contracts).toFixed(2);
  };

  const getFilteredTrades = () => {
    let trades = [];
    
    if (tradeFilter === 'all' || tradeFilter === 'bot') {
      trades = [...trades, ...botTrades];
    }
    if (tradeFilter === 'all' || tradeFilter === 'manual') {
      trades = [...trades, ...manualTrades];
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      trades = trades.filter(trade => {
        const tradeDate = new Date(trade.openTime);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        return tradeDate >= fromDate && tradeDate <= toDate;
      });
    }

    // Filter by symbol
    if (symbolFilter) {
      trades = trades.filter(trade => 
        trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
      );
    }

    // Filter by strategy (for bot trades)
    if (strategyFilter) {
      trades = trades.filter(trade => 
        trade.strategy && trade.strategy.toLowerCase().includes(strategyFilter.toLowerCase())
      );
    }

    // Filter by action (BUY/SELL)
    if (actionFilter !== 'all') {
      trades = trades.filter(trade => trade.action === actionFilter);
    }

    // Filter by status (open/closed)
    if (statusFilter !== 'all') {
      trades = trades.filter(trade => trade.status === statusFilter);
    }

    return trades.sort((a, b) => new Date(b.openTime) - new Date(a.openTime));
  };

  // Get unique symbols for filter dropdown
  const getUniqueSymbols = () => {
    const allTrades = [...botTrades, ...manualTrades];
    const symbols = [...new Set(allTrades.map(trade => trade.symbol))];
    return symbols.sort();
  };

  // Get unique strategies for filter dropdown
  const getUniqueStrategies = () => {
    const strategies = [...new Set(botTrades.map(trade => trade.strategy).filter(Boolean))];
    return strategies.sort();
  };

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
    
    const allSymbols = [...new Set([...popularSymbols, ...getUniqueSymbols()])];
    return allSymbols
      .filter(symbol => symbol.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 10);
  };

  const generateReport = (format) => {
    const trades = getFilteredTrades();
    const reportData = {
      title: 'NEXUS AI Trading System - Trade Report',
      generatedAt: new Date().toISOString(),
      dateRange: dateRange,
      tradeFilter: tradeFilter,
      totalTrades: trades.length,
      totalPnl: trades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0),
      winRate: trades.filter(t => parseFloat(t.pnl || 0) > 0).length / trades.length * 100,
      trades: trades
    };

    if (format === 'pdf') {
      generatePDFReport(reportData);
    } else if (format === 'html') {
      generateHTMLReport(reportData);
    } else if (format === 'md') {
      generateMarkdownReport(reportData);
    }
  };

  const generatePDFReport = (reportData) => {
    // Create a comprehensive PDF report
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
          .subtitle { color: #6b7280; margin-top: 5px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          .trades-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .trades-table th, .trades-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .trades-table th { background: #f3f4f6; font-weight: bold; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NEXUS AI Trading System</div>
          <div class="subtitle">Professional Trade Report</div>
          <div style="margin-top: 10px;">Generated: ${new Date(reportData.generatedAt).toLocaleString()}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.totalTrades}</div>
            <div class="stat-label">Total Trades</div>
          </div>
          <div class="stat-card">
            <div class="stat-value ${reportData.totalPnl >= 0 ? 'positive' : 'negative'}">$${reportData.totalPnl.toFixed(2)}</div>
            <div class="stat-label">Total P&L</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.winRate.toFixed(1)}%</div>
            <div class="stat-label">Win Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.tradeFilter}</div>
            <div class="stat-label">Trade Type</div>
          </div>
        </div>

        <h2>Trade Details</h2>
        <table class="trades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Action</th>
              <th>Entry Price</th>
              <th>Exit Price</th>
              <th>Contracts</th>
              <th>P&L</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.trades.map(trade => `
              <tr>
                <td>${new Date(trade.openTime).toLocaleDateString()}</td>
                <td>${trade.symbol}</td>
                <td>${trade.action}</td>
                <td>$${trade.entryPrice}</td>
                <td>$${trade.exitPrice || 'N/A'}</td>
                <td>${trade.contracts}</td>
                <td class="${parseFloat(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">$${trade.pnl || 'N/A'}</td>
                <td>${trade.type}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

                 <div class="footer">
           <p>This report was generated by NEXUS AI Trading System</p>
           <p>For support, contact: support@nexus-ai.cc</p>
         </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-trade-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    showNotification('PDF report generated and downloaded successfully!', 'success');
  };

  const generateHTMLReport = (reportData) => {
    // Similar to PDF but with enhanced styling
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportData.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
          .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 40px; text-align: center; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-value { font-size: 28px; font-weight: bold; color: #1f2937; }
          .stat-label { color: #6b7280; margin-top: 8px; font-size: 14px; }
          .trades-table { width: 100%; border-collapse: collapse; margin: 30px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .trades-table th, .trades-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .trades-table th { background: #f3f4f6; font-weight: 600; color: #374151; }
          .trades-table tr:hover { background: #f9fafb; }
          .positive { color: #059669; font-weight: 600; }
          .negative { color: #dc2626; font-weight: 600; }
          .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NEXUS AI Trading System</div>
            <div class="subtitle">Professional Trade Report</div>
            <div style="margin-top: 15px; opacity: 0.8;">Generated: ${new Date(reportData.generatedAt).toLocaleString()}</div>
          </div>

          <div class="content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${reportData.totalTrades}</div>
                <div class="stat-label">Total Trades</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${reportData.totalPnl >= 0 ? 'positive' : 'negative'}">$${reportData.totalPnl.toFixed(2)}</div>
                <div class="stat-label">Total P&L</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${reportData.winRate.toFixed(1)}%</div>
                <div class="stat-label">Win Rate</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${reportData.tradeFilter}</div>
                <div class="stat-label">Trade Type</div>
              </div>
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Trade Details</h2>
            <table class="trades-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symbol</th>
                  <th>Action</th>
                  <th>Entry Price</th>
                  <th>Exit Price</th>
                  <th>Contracts</th>
                  <th>P&L</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.trades.map(trade => `
                  <tr>
                    <td>${new Date(trade.openTime).toLocaleDateString()}</td>
                    <td><strong>${trade.symbol}</strong></td>
                    <td><span style="color: ${trade.action === 'BUY' ? '#059669' : '#dc2626'}; font-weight: 600;">${trade.action}</span></td>
                    <td>$${trade.entryPrice}</td>
                    <td>$${trade.exitPrice || 'N/A'}</td>
                    <td>${trade.contracts}</td>
                    <td class="${parseFloat(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">$${trade.pnl || 'N/A'}</td>
                    <td>${trade.type}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

                     <div class="footer">
             <p style="margin: 0 0 10px 0;">This report was generated by NEXUS AI Trading System</p>
             <p style="margin: 0; font-size: 12px;">For support, contact: support@nexus-ai.cc</p>
           </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-trade-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showNotification('HTML report generated and downloaded successfully!', 'success');
  };

  const generateMarkdownReport = (reportData) => {
    const reportContent = `# NEXUS AI Trading System - Trade Report

**Generated:** ${new Date(reportData.generatedAt).toLocaleString()}
**Date Range:** ${reportData.dateRange.from || 'All'} to ${reportData.dateRange.to || 'All'}
**Trade Filter:** ${reportData.tradeFilter}

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Trades | ${reportData.totalTrades} |
| Total P&L | $${reportData.totalPnl.toFixed(2)} |
| Win Rate | ${reportData.winRate.toFixed(1)}% |
| Trade Type | ${reportData.tradeFilter} |

## Trade Details

| Date | Symbol | Action | Entry Price | Exit Price | Contracts | P&L | Type |
|------|--------|--------|-------------|------------|-----------|-----|------|
${reportData.trades.map(trade => `| ${new Date(trade.openTime).toLocaleDateString()} | ${trade.symbol} | ${trade.action} | $${trade.entryPrice} | $${trade.exitPrice || 'N/A'} | ${trade.contracts} | $${trade.pnl || 'N/A'} | ${trade.type} |`).join('\n')}

---
*This report was generated by NEXUS AI Trading System*
*For support, contact: support@nexus-ai.cc*
`;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-trade-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showNotification('Markdown report generated and downloaded successfully!', 'success');
  };

  const sendReportByEmail = () => {
    const trades = getFilteredTrades();
    if (trades.length === 0) {
      showNotification('No trades to send in report!', 'error');
      return;
    }

    // Show email modal
    setShowEmailModal(true);
  };

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: 'NEXUS AI Trading System - Trade Report',
    message: ''
  });

  const handleEmailSend = async () => {
    if (!emailData.recipient) {
      showNotification('Please enter recipient email!', 'error');
      return;
    }

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const trades = getFilteredTrades();
      const reportData = {
        recipient: emailData.recipient,
        subject: emailData.subject,
        message: emailData.message,
        totalTrades: trades.length,
        totalPnl: trades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0),
        winRate: trades.filter(t => parseFloat(t.pnl || 0) > 0).length / trades.length * 100
      };

      console.log('Sending email report:', reportData);
      
      setShowEmailModal(false);
      setEmailData({ recipient: '', subject: 'NEXUS AI Trading System - Trade Report', message: '' });
      showNotification('Report sent successfully!', 'success');
    } catch (error) {
      showNotification('Failed to send report. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const renderBotTrades = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bot Trade Records</h3>
        <button
          onClick={syncBotTrades}
          disabled={loading || !isConnected}
          className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Syncing...' : 'Sync Bot Trades'}</span>
        </button>
      </div>

      <div className="grid gap-4">
        {botTrades.map(trade => (
          <div key={trade.id} className="professional-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-[var(--accent-primary)]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">{trade.symbol}</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{trade.strategy}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {trade.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Action</label>
                <p className={`font-semibold ${trade.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.action}
                </p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Contracts</label>
                <p className="font-semibold text-[var(--text-primary)]">{trade.contracts}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Entry Price</label>
                <p className="font-semibold text-[var(--text-primary)]">${trade.entryPrice}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Exit Price</label>
                <p className="font-semibold text-[var(--text-primary)]">${trade.exitPrice || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Take Profit</label>
                <p className="font-semibold text-green-600">${trade.takeProfit}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Stop Loss</label>
                <p className="font-semibold text-red-600">${trade.stopLoss}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">P&L</label>
                <p className={`font-semibold ${parseFloat(trade.pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${trade.pnl}
                </p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Duration</label>
                <p className="font-semibold text-[var(--text-primary)]">
                  {trade.closeTime ? 
                    Math.round((new Date(trade.closeTime) - new Date(trade.openTime)) / (1000 * 60 * 60)) + 'h' : 
                    'Open'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
              <span>Opened: {new Date(trade.openTime).toLocaleString()}</span>
              {trade.closeTime && <span>Closed: {new Date(trade.closeTime).toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {botTrades.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No bot trades recorded yet</p>
          <p className="text-sm text-[var(--text-secondary)]">Click "Sync Bot Trades" to load recent trades</p>
        </div>
      )}
    </div>
  );

  const renderManualTrades = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Manual Trade Journal</h3>
        <button
          onClick={addManualTrade}
          className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>
      </div>

      <div className="grid gap-6">
        {manualTrades.map(trade => (
          <div key={trade.id} className="professional-card">
            {trade.isEditing ? (
              <ManualTradeEditor 
                trade={trade} 
                onSave={(updates) => {
                  updateTrade('manual', trade.id, { ...updates, isEditing: false });
                }}
                onCancel={() => {
                  if (trade.symbol === '') {
                    deleteTrade('manual', trade.id);
                  } else {
                    updateTrade('manual', trade.id, { isEditing: false });
                  }
                }}
              />
            ) : (
              <ManualTradeViewer 
                trade={trade}
                onEdit={() => updateTrade('manual', trade.id, { isEditing: true })}
                onDelete={() => deleteTrade('manual', trade.id)}
              />
            )}
          </div>
        ))}
      </div>

      {manualTrades.length === 0 && (
        <div className="text-center py-12">
          <PenTool className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No manual trades recorded yet</p>
          <p className="text-sm text-[var(--text-secondary)]">Click "Add Trade" to start your journal</p>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Trade Reports</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => generateReport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => generateReport('html')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>HTML</span>
          </button>
          <button
            onClick={() => generateReport('md')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>MD</span>
          </button>
          <button
            onClick={sendReportByEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        </div>
      </div>

             <div className="flex justify-between items-center mb-4">
         <h4 className="text-lg font-semibold text-[var(--text-primary)]">Report Filters</h4>
         <button
           onClick={() => {
             setDateRange({ from: '', to: '' });
             setTradeFilter('all');
             setSymbolFilter('');
             setStrategyFilter('');
             setActionFilter('all');
             setStatusFilter('all');
           }}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
         >
           <RefreshCw className="w-4 h-4" />
           <span>Clear Filters</span>
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         <div className="professional-card">
           <div className="flex items-center space-x-3 mb-4">
             <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
             <h4 className="font-semibold text-[var(--text-primary)]">Date Range</h4>
           </div>
           <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">From</label>
               <input
                 type="date"
                 value={dateRange.from}
                 onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">To</label>
               <input
                 type="date"
                 value={dateRange.to}
                 onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               />
             </div>
           </div>
         </div>

         <div className="professional-card">
           <div className="flex items-center space-x-3 mb-4">
             <Filter className="w-5 h-5 text-[var(--accent-primary)]" />
             <h4 className="font-semibold text-[var(--text-primary)]">Trade Filters</h4>
           </div>
           <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Trade Type</label>
               <select
                 value={tradeFilter}
                 onChange={(e) => setTradeFilter(e.target.value)}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               >
                 <option value="all">All Trades</option>
                 <option value="bot">Bot Trades Only</option>
                 <option value="manual">Manual Trades Only</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Action</label>
               <select
                 value={actionFilter}
                 onChange={(e) => setActionFilter(e.target.value)}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               >
                 <option value="all">All Actions</option>
                 <option value="BUY">BUY Only</option>
                 <option value="SELL">SELL Only</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Status</label>
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               >
                 <option value="all">All Status</option>
                 <option value="open">Open Only</option>
                 <option value="closed">Closed Only</option>
               </select>
             </div>
           </div>
         </div>

         <div className="professional-card">
           <div className="flex items-center space-x-3 mb-4">
             <Search className="w-5 h-5 text-[var(--accent-primary)]" />
             <h4 className="font-semibold text-[var(--text-primary)]">Symbol & Strategy</h4>
           </div>
           <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Symbol</label>
               <select
                 value={symbolFilter}
                 onChange={(e) => setSymbolFilter(e.target.value)}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               >
                 <option value="">All Symbols</option>
                 {getUniqueSymbols().map(symbol => (
                   <option key={symbol} value={symbol}>{symbol}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Strategy</label>
               <select
                 value={strategyFilter}
                 onChange={(e) => setStrategyFilter(e.target.value)}
                 className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
               >
                 <option value="">All Strategies</option>
                 {getUniqueStrategies().map(strategy => (
                   <option key={strategy} value={strategy}>{strategy}</option>
                 ))}
               </select>
             </div>
           </div>
         </div>

         <div className="professional-card">
           <div className="flex items-center space-x-3 mb-4">
             <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
             <h4 className="font-semibold text-[var(--text-primary)]">Quick Stats</h4>
           </div>
           <div className="space-y-3">
             <div className="flex justify-between">
               <span className="text-sm text-[var(--text-secondary)]">Total Trades:</span>
               <span className="font-semibold text-[var(--text-primary)]">{getFilteredTrades().length}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-sm text-[var(--text-secondary)]">Total P&L:</span>
               <span className={`font-semibold ${getFilteredTrades().reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 ${getFilteredTrades().reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0).toFixed(2)}
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-sm text-[var(--text-secondary)]">Win Rate:</span>
               <span className="font-semibold text-[var(--text-primary)]">
                 {getFilteredTrades().length > 0 ? 
                   (getFilteredTrades().filter(t => parseFloat(t.pnl || 0) > 0).length / getFilteredTrades().length * 100).toFixed(1) : 
                   0}%
               </span>
             </div>
             <div className="flex justify-between">
               <span className="text-sm text-[var(--text-secondary)]">Avg P&L:</span>
               <span className={`font-semibold ${getFilteredTrades().length > 0 ? (getFilteredTrades().reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / getFilteredTrades().length) >= 0 ? 'text-green-600' : 'text-red-600' : 'text-[var(--text-secondary)]'}`}>
                 {getFilteredTrades().length > 0 ? 
                   `$${(getFilteredTrades().reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0) / getFilteredTrades().length).toFixed(2)}` : 
                   'N/A'}
               </span>
             </div>
           </div>
         </div>
       </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Trading Journal</h1>
        <p className="text-[var(--text-secondary)]">Track and analyze your trading performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-[var(--bg-tertiary)] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('bot-trades')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'bot-trades' 
              ? 'bg-[var(--accent-primary)] text-white' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Bot Trades</span>
        </button>
        <button
          onClick={() => setActiveTab('manual-trades')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'manual-trades' 
              ? 'bg-[var(--accent-primary)] text-white' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Manual Trades</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'reports' 
              ? 'bg-[var(--accent-primary)] text-white' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'bot-trades' && renderBotTrades()}
        {activeTab === 'manual-trades' && renderManualTrades()}
        {activeTab === 'reports' && renderReports()}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Send Report by Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Recipient Email</label>
                <input
                  type="email"
                  value={emailData.recipient}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  placeholder="recipient@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Message (Optional)</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  rows="4"
                  placeholder="Add a personal message to your report..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEmailSend}
                  className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Send Report
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-90 transition-colors"
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

// Manual Trade Editor Component (Notion-style)
const ManualTradeEditor = ({ trade, onSave, onCancel }) => {
  const [formData, setFormData] = useState(trade);
  const [notes, setNotes] = useState(trade.notes || '');
  const [psychology, setPsychology] = useState(trade.psychology || {});
  const [attachments, setAttachments] = useState(trade.attachments || []);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  const [symbolSuggestions, setSymbolSuggestions] = useState([]);

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

  const handleSave = () => {
    const pnl = calculatePnl(formData.entryPrice, formData.exitPrice, formData.contracts, formData.action);
    onSave({
      ...formData,
      pnl,
      notes,
      psychology,
      attachments
    });
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAttachment = {
          id: Date.now(),
          type: 'image',
          name: file.name,
          data: e.target.result,
          size: file.size,
          timestamp: new Date().toISOString()
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const newAttachment = {
          id: Date.now(),
          type: 'audio',
          name: `Voice Note ${new Date().toLocaleString()}`,
          data: url,
          size: blob.size,
          timestamp: new Date().toISOString()
        };
        setAttachments(prev => [...prev, newAttachment]);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Handle link addition
  const handleAddLink = () => {
    const url = prompt('Enter URL:');
    if (url && url.trim()) {
      const newAttachment = {
        id: Date.now(),
        type: 'link',
        name: url,
        data: url,
        timestamp: new Date().toISOString()
      };
      setAttachments(prev => [...prev, newAttachment]);
    }
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // Handle symbol input with auto-suggest
  const handleSymbolInput = (value) => {
    setFormData(prev => ({ ...prev, symbol: value.toUpperCase() }));
    
    console.log('Symbol input:', value); // Debug log
    
    if (value.length > 0) {
      const suggestions = getFilteredSymbols(value);
      console.log('Suggestions:', suggestions); // Debug log
      setSymbolSuggestions(suggestions);
      setShowSymbolSuggestions(true);
    } else {
      // Show popular symbols when input is empty
      const suggestions = getFilteredSymbols('');
      console.log('Popular suggestions:', suggestions); // Debug log
      setSymbolSuggestions(suggestions);
      setShowSymbolSuggestions(true);
    }
  };

  // Select symbol from suggestions
  const selectSymbol = (symbol) => {
    setFormData(prev => ({ ...prev, symbol }));
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

  const calculatePnl = (entryPrice, exitPrice, contracts, action) => {
    if (!entryPrice || !exitPrice || !contracts) return 0;
    const priceDiff = action === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
    return (priceDiff * contracts).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-[var(--text-primary)]">New Trade Entry</h4>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Save Trade
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="symbol-input-container relative">
           <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Symbol</label>
           <input
             type="text"
             value={formData.symbol}
             onChange={(e) => handleSymbolInput(e.target.value)}
             onFocus={() => {
               console.log('Input focused'); // Debug log
               const suggestions = getFilteredSymbols(formData.symbol || '');
               console.log('Focus suggestions:', suggestions); // Debug log
               setSymbolSuggestions(suggestions);
               setShowSymbolSuggestions(true);
             }}
             className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
             placeholder="Start typing symbol (e.g., AAPL, TSLA, BTC)"
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
                     symbol === formData.symbol ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
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
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Action</label>
          <select
            value={formData.action}
            onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Contracts</label>
          <input
            type="number"
            value={formData.contracts}
            onChange={(e) => setFormData(prev => ({ ...prev, contracts: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Entry Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.entryPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="150.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Exit Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.exitPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="155.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Take Profit</label>
          <input
            type="number"
            step="0.01"
            value={formData.takeProfit}
            onChange={(e) => setFormData(prev => ({ ...prev, takeProfit: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="160.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Stop Loss</label>
          <input
            type="number"
            step="0.01"
            value={formData.stopLoss}
            onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="145.00"
          />
        </div>
      </div>

      {/* P&L Preview */}
      {formData.entryPrice && formData.exitPrice && (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Estimated P&L:</span>
            <span className={`font-semibold text-lg ${calculatePnl(formData.entryPrice, formData.exitPrice, formData.contracts, formData.action) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${calculatePnl(formData.entryPrice, formData.exitPrice, formData.contracts, formData.action)}
            </span>
          </div>
        </div>
      )}

      {/* Notion-style Notes Editor */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Trade Notes</label>
        <div className="border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-tertiary)]">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-[var(--text-primary)]"
            placeholder="Add your trade notes, analysis, market observations..."
          />
          <div className="flex space-x-2 mt-3 pt-3 border-t border-[var(--border-primary)]">
            <label className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors cursor-pointer">
              <Image className="w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={handleAddLink}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors"
            >
              <Link className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Attachments Display */}
        {attachments.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Attachments</label>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-center space-x-3">
                    {attachment.type === 'image' && (
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <img 
                          src={attachment.data} 
                          alt={attachment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {attachment.type === 'audio' && (
                      <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                        <Mic className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    {attachment.type === 'link' && (
                      <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                        <Link className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{attachment.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(attachment.timestamp).toLocaleString()}
                        {attachment.size && ` • ${(attachment.size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {attachment.type === 'audio' && (
                      <audio controls className="h-8">
                        <source src={attachment.data} type="audio/wav" />
                      </audio>
                    )}
                    {attachment.type === 'link' && (
                      <a 
                        href={attachment.data} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Open
                      </a>
                    )}
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

             {/* Psychology Section */}
       <div>
         <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Psychology & Emotions</label>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label className="block text-xs text-[var(--text-secondary)] mb-1">Emotional State</label>
             <select
               value={psychology.emotion || 'neutral'}
               onChange={(e) => setPsychology(prev => ({ ...prev, emotion: e.target.value }))}
               className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
             >
               <option value="confident">😤 Confident</option>
               <option value="nervous">😰 Nervous</option>
               <option value="greedy">😈 Greedy</option>
               <option value="fearful">😨 Fearful</option>
               <option value="neutral">😐 Neutral</option>
               <option value="excited">🤩 Excited</option>
               <option value="calm">😌 Calm</option>
               <option value="focused">🎯 Focused</option>
               <option value="anxious">😟 Anxious</option>
               <option value="optimistic">😊 Optimistic</option>
               <option value="pessimistic">😔 Pessimistic</option>
               <option value="determined">💪 Determined</option>
               <option value="hesitant">🤔 Hesitant</option>
               <option value="euphoric">🤪 Euphoric</option>
               <option value="depressed">😞 Depressed</option>
             </select>
           </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Confidence Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={psychology.confidence || 5}
              onChange={(e) => setPsychology(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-[var(--text-secondary)]">{psychology.confidence || 5}/10</div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Stress Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={psychology.stress || 3}
              onChange={(e) => setPsychology(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-[var(--text-secondary)]">{psychology.stress || 3}/10</div>
          </div>
        </div>
        <div className="mt-3">
          <textarea
            value={psychology.notes || ''}
            onChange={(e) => setPsychology(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="Additional psychology notes..."
            rows="3"
          />
        </div>
      </div>
    </div>
  );
};

// Manual Trade Viewer Component
const ManualTradeViewer = ({ trade, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <PenTool className="w-5 h-5 text-[var(--accent-primary)]" />
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">{trade.symbol}</h4>
            <p className="text-sm text-[var(--text-secondary)]">Manual Trade</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Action</label>
          <p className={`font-semibold ${trade.action === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
            {trade.action}
          </p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Contracts</label>
          <p className="font-semibold text-[var(--text-primary)]">{trade.contracts}</p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Entry Price</label>
          <p className="font-semibold text-[var(--text-primary)]">${trade.entryPrice}</p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Exit Price</label>
          <p className="font-semibold text-[var(--text-primary)]">${trade.exitPrice || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Take Profit</label>
          <p className="font-semibold text-green-600">${trade.takeProfit}</p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Stop Loss</label>
          <p className="font-semibold text-red-600">${trade.stopLoss}</p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">P&L</label>
          <p className={`font-semibold ${parseFloat(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${trade.pnl || 'N/A'}
          </p>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Status</label>
          <p className={`font-semibold ${trade.status === 'open' ? 'text-yellow-600' : 'text-green-600'}`}>
            {trade.status.toUpperCase()}
          </p>
        </div>
      </div>

             {trade.notes && (
         <div>
           <label className="text-xs text-[var(--text-secondary)]">Notes</label>
           <p className="text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 rounded-lg mt-1">
             {trade.notes}
           </p>
         </div>
       )}

       {trade.attachments && trade.attachments.length > 0 && (
         <div>
           <label className="text-xs text-[var(--text-secondary)]">Attachments</label>
           <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mt-1 space-y-2">
             {trade.attachments.map((attachment) => (
               <div key={attachment.id} className="flex items-center space-x-3">
                 {attachment.type === 'image' && (
                   <div className="w-10 h-10 rounded overflow-hidden">
                     <img 
                       src={attachment.data} 
                       alt={attachment.name}
                       className="w-full h-full object-cover"
                     />
                   </div>
                 )}
                 {attachment.type === 'audio' && (
                   <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                     <Mic className="w-5 h-5 text-blue-600" />
                   </div>
                 )}
                 {attachment.type === 'link' && (
                   <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                     <Link className="w-5 h-5 text-green-600" />
                   </div>
                 )}
                 <div className="flex-1">
                   <p className="text-sm text-[var(--text-primary)]">{attachment.name}</p>
                   <p className="text-xs text-[var(--text-secondary)]">
                     {new Date(attachment.timestamp).toLocaleString()}
                   </p>
                 </div>
                 {attachment.type === 'audio' && (
                   <audio controls className="h-6">
                     <source src={attachment.data} type="audio/wav" />
                   </audio>
                 )}
                 {attachment.type === 'link' && (
                   <a 
                     href={attachment.data} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                   >
                     Open
                   </a>
                 )}
               </div>
             ))}
           </div>
         </div>
       )}

             {trade.psychology && (
         <div>
           <label className="text-xs text-[var(--text-secondary)]">Psychology</label>
           <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mt-1">
             <div className="flex space-x-4 text-sm">
               <span>Emotion: <span className="font-semibold capitalize">
                 {trade.psychology.emotion === 'confident' && '😤 Confident'}
                 {trade.psychology.emotion === 'nervous' && '😰 Nervous'}
                 {trade.psychology.emotion === 'greedy' && '😈 Greedy'}
                 {trade.psychology.emotion === 'fearful' && '😨 Fearful'}
                 {trade.psychology.emotion === 'neutral' && '😐 Neutral'}
                 {trade.psychology.emotion === 'excited' && '🤩 Excited'}
                 {trade.psychology.emotion === 'calm' && '😌 Calm'}
                 {trade.psychology.emotion === 'focused' && '🎯 Focused'}
                 {trade.psychology.emotion === 'anxious' && '😟 Anxious'}
                 {trade.psychology.emotion === 'optimistic' && '😊 Optimistic'}
                 {trade.psychology.emotion === 'pessimistic' && '😔 Pessimistic'}
                 {trade.psychology.emotion === 'determined' && '💪 Determined'}
                 {trade.psychology.emotion === 'hesitant' && '🤔 Hesitant'}
                 {trade.psychology.emotion === 'euphoric' && '🤪 Euphoric'}
                 {trade.psychology.emotion === 'depressed' && '😞 Depressed'}
                 {!['confident', 'nervous', 'greedy', 'fearful', 'neutral', 'excited', 'calm', 'focused', 'anxious', 'optimistic', 'pessimistic', 'determined', 'hesitant', 'euphoric', 'depressed'].includes(trade.psychology.emotion) && trade.psychology.emotion}
               </span></span>
               <span>Confidence: <span className="font-semibold">{trade.psychology.confidence}/10</span></span>
               <span>Stress: <span className="font-semibold">{trade.psychology.stress}/10</span></span>
             </div>
             {trade.psychology.notes && (
               <p className="text-[var(--text-primary)] mt-2">{trade.psychology.notes}</p>
             )}
           </div>
         </div>
       )}

      <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
        <span>Opened: {new Date(trade.openTime).toLocaleString()}</span>
        {trade.closeTime && <span>Closed: {new Date(trade.closeTime).toLocaleString()}</span>}
      </div>
    </div>
  );
};

export default TradingJournal;
