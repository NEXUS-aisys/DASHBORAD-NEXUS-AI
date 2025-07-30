import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStatus } from '../../contexts/AppStatusContext';
import UserProfile from '../auth/UserProfile';
import { 
  Moon, 
  Sun, 
  Activity, 
  Wifi, 
  Database,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Header = ({ onToggleSidebar, isMobile, mobileMenuOpen, user, onLogout, onUpdateProfile }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected, lastSynced, notifications, clearNotifications } = useAppStatus();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: Database },
    { path: '/trading', label: 'Trading', icon: Wifi },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="mobile-nav-toggle p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--text-primary)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--text-primary)]" />
              )}
            </button>
          )}

          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">NEXUS AI</h1>
              <p className="text-xs text-[var(--text-muted)]">Trading System</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-[var(--text-primary)]">NEXUS</h1>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status and Controls */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* System Status Indicators - Hidden on small mobile */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
              <span className="text-xs text-[var(--text-muted)] hidden lg:inline">Live</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wifi className={`w-4 h-4 ${isConnected ? 'text-[var(--success)]' : 'text-[var(--error)]'}`} />
              <span className={`text-xs ${isConnected ? 'text-[var(--text-muted)]' : 'text-[var(--error)]'} hidden lg:inline`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="w-4 h-4 text-[var(--info)]" />
              <span className="text-xs text-[var(--text-muted)] hidden lg:inline">
                Synced: {lastSynced ? lastSynced.toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-[var(--border-primary)]"></div>

          {/* Controls */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notifications */}
            <button
              onClick={clearNotifications}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors relative"
            >
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{notifications.length}</span>
                </div>
              )}
            </button>

            {/* Settings - Hidden on small mobile */}
            <button className="hidden sm:block p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>

            {/* User Profile */}
            <UserProfile 
              user={user}
              onLogout={onLogout}
              onUpdateProfile={onUpdateProfile}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

