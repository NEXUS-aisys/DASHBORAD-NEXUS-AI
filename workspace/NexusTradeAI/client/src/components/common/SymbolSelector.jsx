import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, X, Loader2, Filter, ChevronDown, Star, Wifi } from 'lucide-react';
import SymbolIcon from './SymbolIcon';

const SymbolSelector = ({ selectedSymbol, onSymbolChange, placeholder = "Search symbols..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSymbols, setRecentSymbols] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState(['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [userBrokers, setUserBrokers] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Available data providers
  const availableProviders = [
    { id: 'all', name: 'All Providers', icon: '🌐', color: 'text-gray-500' },
    { id: 'yahoo_finance', name: 'Yahoo Finance', icon: '📊', color: 'text-purple-500' },
    { id: 'bybit', name: 'Bybit', icon: '₿', color: 'text-orange-500' },
    { id: 'binance', name: 'Binance', icon: '🔶', color: 'text-yellow-500' },
    { id: 'coinbase', name: 'Coinbase', icon: '🔵', color: 'text-blue-500' },
    { id: 'rithmic', name: 'Rithmic Data', icon: '⚡', color: 'text-green-500' },
    { id: 'mt4', name: 'MetaTrader 4', icon: '📈', color: 'text-indigo-500' },
    { id: 'mt5', name: 'MetaTrader 5', icon: '📉', color: 'text-red-500' }
  ];

  // Popular symbols for quick selection (fallback)
  const popularSymbols = [
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'AAPL', name: 'Apple Inc.', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', provider: 'yahoo_finance', type: 'stock' },
    { symbol: 'BTC-USD', name: 'Bitcoin USD', provider: 'yahoo_finance', type: 'crypto' },
    { symbol: 'ETH-USD', name: 'Ethereum USD', provider: 'yahoo_finance', type: 'crypto' },
    { symbol: 'BTCUSDT', name: 'Bitcoin USDT', provider: 'bybit', type: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum USDT', provider: 'bybit', type: 'crypto' },
    { symbol: 'NQ=F', name: 'NASDAQ 100 Futures', provider: 'yahoo_finance', type: 'future' },
    { symbol: 'ES=F', name: 'S&P 500 Futures', provider: 'yahoo_finance', type: 'future' },
    { symbol: 'NQU25', name: 'NASDAQ Future Sep 25', provider: 'rithmic', type: 'future' },
    { symbol: 'ESZ24', name: 'S&P Future Dec 24', provider: 'rithmic', type: 'future' },
  ];

  // Load recent symbols and user brokers from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem('nexus_recent_symbols');
    if (savedRecent) {
      setRecentSymbols(JSON.parse(savedRecent));
    }

    // Load user's crypto APIs to determine active brokers
    const savedCryptoApis = localStorage.getItem('nexus_crypto_apis');
    if (savedCryptoApis) {
      const cryptoApis = JSON.parse(savedCryptoApis);
      const activeBrokers = cryptoApis
        .filter(api => api.active)
        .map(api => api.exchange);
      setUserBrokers(activeBrokers);
    }
  }, []);

  // Real-time symbol search using enhanced API
  const searchSymbols = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const providerFilter = selectedProviders.includes('all') ? '' : selectedProviders.join(',');
      const response = await fetch(`/api/symbols/search?q=${encodeURIComponent(query)}&limit=15&providers=${providerFilter}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const allResults = [];
        
        // Combine results from all providers
        Object.entries(data.data.providers).forEach(([providerId, providerData]) => {
          if (providerData.results) {
            providerData.results.forEach(item => {
              allResults.push({
                symbol: item.symbol,
                name: item.name,
                type: item.type || 'unknown',
                category: item.category || 'Other',
                exchange: item.exchange || '',
                provider: providerId,
                providerName: availableProviders.find(p => p.id === providerId)?.name || providerId,
                isUserBroker: userBrokers.includes(providerId)
              });
            });
          }
        });

        // Sort: User brokers first, then by relevance
        allResults.sort((a, b) => {
          if (a.isUserBroker && !b.isUserBroker) return -1;
          if (!a.isUserBroker && b.isUserBroker) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        setSearchResults(allResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm && searchTerm.length >= 2) {
      const timeout = setTimeout(() => {
        searchSymbols(searchTerm);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, selectedProviders]);

  // Filter popular symbols based on search term and selected providers
  const filteredPopularSymbols = popularSymbols.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProviders.includes('all') || selectedProviders.includes(item.provider);
    return matchesSearch && matchesProvider;
  }).map(item => ({
    ...item,
    providerName: availableProviders.find(p => p.id === item.provider)?.name || item.provider,
    isUserBroker: userBrokers.includes(item.provider)
  }));

  const handleSymbolSelect = (symbol) => {
    onSymbolChange(symbol);
    
    // Add to recent symbols
    const updated = [symbol, ...recentSymbols.filter(s => s !== symbol)].slice(0, 5);
    setRecentSymbols(updated);
    localStorage.setItem('nexus_recent_symbols', JSON.stringify(updated));
    
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleProviderToggle = (providerId) => {
    if (providerId === 'all') {
      setSelectedProviders(['all']);
    } else {
      const newSelection = selectedProviders.filter(id => id !== 'all');
      if (newSelection.includes(providerId)) {
        const updated = newSelection.filter(id => id !== providerId);
        setSelectedProviders(updated.length === 0 ? ['all'] : updated);
      } else {
        setSelectedProviders([...newSelection, providerId]);
      }
    }
  };

  const removeRecentSymbol = (symbol, e) => {
    e.stopPropagation();
    const updated = recentSymbols.filter(s => s !== symbol);
    setRecentSymbols(updated);
    localStorage.setItem('nexus_recent_symbols', JSON.stringify(updated));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSymbolIcon = (type, symbol) => {
    return <SymbolIcon type={type} symbol={symbol} className="w-4 h-4" />;
  };

  const getSymbolTypeColor = (type) => {
    switch (type) {
      case 'crypto': return 'text-orange-500';
      case 'future': return 'text-blue-500';
      case 'stock': return 'text-green-500';
      case 'etf': return 'text-purple-500';
      case 'forex': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProviderInfo = (providerId) => {
    return availableProviders.find(p => p.id === providerId) || { icon: '🔗', color: 'text-gray-500', name: providerId };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedSymbol}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-12 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[var(--bg-secondary)] rounded transition-colors"
        >
          <Filter className={`w-4 h-4 ${selectedProviders.length > 1 || !selectedProviders.includes('all') ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
        </button>
      </div>

      {/* Provider Filters */}
      {showFilters && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg p-3">
          <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Filter by Data Provider</div>
          <div className="grid grid-cols-2 gap-2">
            {availableProviders.map(provider => (
              <label key={provider.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-[var(--bg-tertiary)]">
                <input
                  type="checkbox"
                  checked={selectedProviders.includes(provider.id)}
                  onChange={() => handleProviderToggle(provider.id)}
                  className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-secondary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
                />
                <span className="text-sm">{provider.icon}</span>
                <span className={`text-sm ${provider.color}`}>{provider.name}</span>
                {userBrokers.includes(provider.id) && (
                  <Wifi className="w-3 h-3 text-[var(--accent-primary)]" title="Your Active Broker" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {isOpen && !showFilters && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg max-h-80 overflow-auto">
          
          {/* Active Provider Filter Indicator */}
          {(selectedProviders.length > 1 || !selectedProviders.includes('all')) && (
            <div className="p-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="text-xs text-[var(--text-muted)] mb-1">Filtering by:</div>
              <div className="flex flex-wrap gap-1">
                {selectedProviders.map(providerId => {
                  const provider = getProviderInfo(providerId);
                  return (
                    <span key={providerId} className={`inline-flex items-center px-2 py-1 rounded text-xs ${provider.color} bg-[var(--bg-tertiary)]`}>
                      <span className="mr-1">{provider.icon}</span>
                      {provider.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Symbols */}
          {recentSymbols.length > 0 && (
            <div className="p-3 border-b border-[var(--border-primary)]">
              <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Recent</div>
              <div className="flex flex-wrap gap-1">
                {recentSymbols.map(symbol => (
                  <div
                    key={symbol}
                    onClick={() => handleSymbolSelect(symbol)}
                    className="flex items-center px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs cursor-pointer hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  >
                    <span>{symbol}</span>
                    <X 
                      className="w-3 h-3 ml-1 hover:text-[var(--error)]"
                      onClick={(e) => removeRecentSymbol(symbol, e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-primary)] mr-2" />
              <span className="text-sm text-[var(--text-muted)]">Searching symbols...</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-3 border-b border-[var(--border-primary)]">
              <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
                Search Results ({searchResults.length} found)
              </div>
              {searchResults.map((item, index) => (
                <div
                  key={`${item.symbol}-${item.provider}-${index}`}
                  onClick={() => handleSymbolSelect(item.symbol)}
                  className="px-3 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer rounded mb-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className={`text-sm mr-2 ${getSymbolTypeColor(item.type)}`}>
                        {getSymbolIcon(item.type, item.symbol)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-[var(--text-primary)]">{item.symbol}</span>
                          {item.isUserBroker && (
                            <Star className="w-3 h-3 ml-1 text-[var(--accent-primary)] fill-current" title="Your Active Broker" />
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="flex items-center justify-end mb-1">
                        <span className="text-xs text-[var(--accent-primary)] mr-1">{getProviderInfo(item.provider).icon}</span>
                        <span className="text-xs text-[var(--text-muted)]">{item.providerName}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{item.type}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Symbol */}
          {searchTerm && !searchResults.some(s => s.symbol === searchTerm.toUpperCase()) && (
            <div
              onClick={() => handleSymbolSelect(searchTerm.toUpperCase())}
              className="px-4 py-3 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-primary)]"
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)] mr-3" />
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{searchTerm.toUpperCase()}</div>
                  <div className="text-xs text-[var(--text-muted)]">Search for this custom symbol</div>
                </div>
              </div>
            </div>
          )}

          {/* Popular Symbols (fallback) */}
          {searchResults.length === 0 && !isLoading && (
          <div className="p-3">
            <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Popular Symbols</div>
              {filteredPopularSymbols.map((item, index) => (
              <div
                  key={`${item.symbol}-${item.provider}-popular-${index}`}
                onClick={() => handleSymbolSelect(item.symbol)}
                  className="px-3 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer rounded mb-1"
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className={`text-sm mr-2 ${getSymbolTypeColor(item.type)}`}>
                        {getSymbolIcon(item.type, item.symbol)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-[var(--text-primary)]">{item.symbol}</span>
                          {item.isUserBroker && (
                            <Star className="w-3 h-3 ml-1 text-[var(--accent-primary)] fill-current" title="Your Active Broker" />
                          )}
                        </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{item.name}</div>
                  </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="flex items-center justify-end mb-1">
                        <span className="text-xs text-[var(--accent-primary)] mr-1">{getProviderInfo(item.provider).icon}</span>
                        <span className="text-xs text-[var(--text-muted)]">{item.providerName}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{item.type}</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* No Results */}
          {searchResults.length === 0 && filteredPopularSymbols.length === 0 && !isLoading && searchTerm && (
            <div className="px-4 py-3 text-center text-[var(--text-muted)]">
              No symbols found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSelector; 