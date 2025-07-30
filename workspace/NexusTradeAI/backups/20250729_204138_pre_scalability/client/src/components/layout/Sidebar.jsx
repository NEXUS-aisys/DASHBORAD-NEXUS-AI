import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Target,
  Brain,
  MessageSquare,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Monitor
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobile, mobileMenuOpen, onCloseMobile }) => {
  const location = useLocation();

  const sidebarSections = [
    {
      title: 'Dashboard',
      items: [
        { path: '/', label: 'Overview', icon: BarChart3 },
        { path: '/performance', label: 'Performance', icon: TrendingUp },
        { path: '/risk', label: 'Risk Analysis', icon: Target },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/analytics/charts', label: 'Advanced Charts', icon: LineChart },
        { path: '/analytics/correlation', label: 'Correlation Matrix', icon: PieChart },
        { path: '/analytics/strategy', label: 'Strategy Analysis', icon: Brain },
      ]
    },
    {
      title: 'AI Assistant',
      items: [
        { path: '/ai-chat', label: 'Chat Interface', icon: MessageSquare },
        { path: '/ai-insights', label: 'AI Insights', icon: Brain },
      ]
    },
    {
      title: 'ML Models',
      items: [
        { path: '/ml-models', label: 'All Models', icon: Brain },
      ]
    },
    {
      title: 'Tools',
      items: [
        { path: '/data-monitor', label: 'Data Monitor', icon: Monitor },
        { path: '/journal', label: 'Trading Journal', icon: BookOpen },
        { path: '/backtesting', label: 'Backtesting', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Mobile sidebar classes
  const mobileClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : '';

  // Desktop sidebar classes
  const desktopClasses = !isMobile 
    ? `transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`
    : 'w-64';

  return (
    <aside className={`bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col sidebar ${
      isMobile ? mobileClasses : desktopClasses
    } ${mobileMenuOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
              <span className="font-semibold text-[var(--text-primary)]">Navigation</span>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            {(!isCollapsed || isMobile) && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                    title={isCollapsed && !isMobile ? item.label : ''}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {active && (!isCollapsed || isMobile) && (
                      <div className="ml-auto w-1 h-4 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--border-primary)]">
        {(!isCollapsed || isMobile) && (
          <div className="text-xs text-[var(--text-muted)]">
            <div className="flex items-center justify-between mb-1">
              <span>System Status</span>
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
            </div>
            <div className="text-[var(--text-muted)]">
              Last update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
        {isCollapsed && !isMobile && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

