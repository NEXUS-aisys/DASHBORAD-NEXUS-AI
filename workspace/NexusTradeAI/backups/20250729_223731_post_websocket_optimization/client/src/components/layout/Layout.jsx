import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ResponsiveWrapper from './ResponsiveWrapper';

const Layout = ({ user, onLogout, onUpdateProfile }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <ResponsiveWrapper>
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          user={user}
          onLogout={onLogout}
          onUpdateProfile={onUpdateProfile}
        />
        
        {/* Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggleCollapse={toggleSidebar}
            isMobile={isMobile}
            mobileMenuOpen={mobileMenuOpen}
            onCloseMobile={closeMobileMenu}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto transition-all duration-300 main-content">
            <div className="h-full p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ResponsiveWrapper>
  );
};

export default Layout;

