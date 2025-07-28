import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AppStatusContext = createContext();

export const useAppStatus = () => useContext(AppStatusContext);

export const AppStatusProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = apiService.connectWebSocket();

    // If WebSocket is disabled (returns null), skip setup
    if (!ws) {
      console.log('WebSocket disabled - skipping connection setup');
      setLastSynced(new Date());
      return;
    }

    const handleOpen = () => setIsConnected(true);
    const handleClose = () => setIsConnected(false);
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_signal') {
        setNotifications(prev => [...prev, data.data]);
      }
      setLastSynced(new Date());
    };

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('close', handleClose);
    ws.addEventListener('message', handleMessage);
    
    setLastSynced(new Date());

    return () => {
      if (ws) {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('message', handleMessage);
      ws.close();
      }
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    isConnected,
    lastSynced,
    notifications,
    clearNotifications,
  };

  return (
    <AppStatusContext.Provider value={value}>
      {children}
    </AppStatusContext.Provider>
  );
}; 