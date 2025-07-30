import React, { createContext, useContext, useState, useEffect } from 'react';

const SymbolContext = createContext();

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (!context) {
    throw new Error('useSymbol must be used within a SymbolProvider');
  }
  return context;
};

export const SymbolProvider = ({ children }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  // Load symbol from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_selected_symbol');
    if (saved) {
      setSelectedSymbol(saved);
    }
  }, []);

  // Save symbol to localStorage when it changes
  const updateSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    localStorage.setItem('nexus_selected_symbol', symbol);
  };

  const value = {
    selectedSymbol,
    updateSymbol,
  };

  return (
    <SymbolContext.Provider value={value}>
      {children}
    </SymbolContext.Provider>
  );
}; 