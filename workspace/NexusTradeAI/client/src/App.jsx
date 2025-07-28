import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './components/auth/AuthProvider.jsx';
import { AppStatusProvider } from './contexts/AppStatusContext';
import { SymbolProvider } from './contexts/SymbolContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Trading from './pages/Trading';
import AIAssistant from './pages/AIAssistant';
import Performance from './pages/Performance';
import RiskAnalysis from './pages/RiskAnalysis';
import AdvancedCharts from './pages/AdvancedCharts';
import CorrelationMatrix from './pages/CorrelationMatrix';
import StrategyAnalysis from './pages/StrategyAnalysis';
import AIChat from './pages/AIChat';
import AIInsights from './pages/AIInsights';
import TradingJournal from './pages/TradingJournal';
import Backtesting from './pages/Backtesting';
import Settings from './pages/Settings';
import TradeSignals from './pages/TradeSignals';
import DataMonitor from './pages/DataMonitor';
// ML Models
import MLModels from './pages/MLModels';
import authService from './services/authService';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // We'll get user from authService
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleRegister = (userData) => {
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('nexus_user');
      setUser(null);
    }
  };

  const handleUpdateProfile = (updatedUser) => {
    const currentUser = JSON.parse(localStorage.getItem('nexus_user') || '{}');
    const newUserData = { ...currentUser, ...updatedUser };
    localStorage.setItem('nexus_user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center">
          {authMode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </ThemeProvider>
    );
  }

  // Show main application with routing
  return (
    <ThemeProvider>
      <AuthProvider>
        <SymbolProvider>
          <AppStatusProvider>
            <Router>
              <div className="min-h-screen bg-[var(--bg-primary)]">
                <Routes>
                  <Route path="/" element={
                    <Layout user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
                  }>
                  <Route index element={<Dashboard />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="risk" element={<RiskAnalysis />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="analytics/charts" element={<AdvancedCharts />} />
                  <Route path="analytics/correlation" element={<CorrelationMatrix />} />
                  <Route path="analytics/strategy" element={<StrategyAnalysis />} />
                  <Route path="trading" element={<Trading />} />
                  <Route path="trade-signals" element={<TradeSignals />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="ai-chat" element={<AIChat />} />
                  <Route path="ai-insights" element={<AIInsights />} />
                  {/* ML Models Route */}
                  <Route path="ml-models" element={<MLModels />} />
                  <Route path="data-monitor" element={<DataMonitor />} />
                  <Route path="journal" element={<TradingJournal />} />
                  <Route path="backtesting" element={<Backtesting />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </AppStatusProvider>
      </SymbolProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
