import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

const ResponsiveWrapper = ({ children }) => {
  const [screenSize, setScreenSize] = useState('desktop');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1920) {
        setScreenSize('desktop');
      } else {
        setScreenSize('large');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getScreenIcon = () => {
    switch (screenSize) {
      case 'mobile':
        return <Smartphone className="w-3 h-3" />;
      case 'tablet':
        return <Tablet className="w-3 h-3" />;
      default:
        return <Monitor className="w-3 h-3" />;
    }
  };

  const getOptimalLayout = () => {
    // Multi-monitor support: adjust layout based on screen width
    if (dimensions.width >= 2560) {
      return 'ultra-wide'; // 4K+ monitors
    } else if (dimensions.width >= 1920) {
      return 'wide'; // Standard wide monitors
    } else if (dimensions.width >= 1024) {
      return 'standard'; // Standard desktop
    } else {
      return 'compact'; // Tablet/mobile
    }
  };

  const layoutClass = getOptimalLayout();

  return (
    <div className={`responsive-wrapper layout-${layoutClass}`} data-screen-size={screenSize}>
      {/* Screen size indicator (dev mode) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] flex items-center space-x-2">
          {getScreenIcon()}
          <span>{screenSize}</span>
          <span>({dimensions.width}×{dimensions.height})</span>
        </div>
      )} */}
      
      {children}
    </div>
  );
};

export default ResponsiveWrapper;

