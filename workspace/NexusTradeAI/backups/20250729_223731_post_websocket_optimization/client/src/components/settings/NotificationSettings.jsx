import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save, AlertCircle, TrendingUp, DollarSign, MessageCircle, Phone } from 'lucide-react';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      tradeSignals: true,
      marketAlerts: true,
      portfolioUpdates: true,
      systemUpdates: false
    },
    push: {
      enabled: true,
      tradeSignals: true,
      marketAlerts: true,
      portfolioUpdates: false,
      systemUpdates: false
    },
    sms: {
      enabled: false,
      tradeSignals: false,
      marketAlerts: false,
      portfolioUpdates: false,
      systemUpdates: false
    },
    telegram: {
      enabled: false,
      phoneNumber: '',
      tradeSignals: true,
      marketAlerts: true,
      portfolioUpdates: false,
      systemUpdates: false
    },
    frequency: 'realtime',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [telegramActivationStatus, setTelegramActivationStatus] = useState('');

  useEffect(() => {
    // Load saved notification settings from localStorage
    const saved = localStorage.getItem('nexus_notification_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  const handleChannelToggle = (channel, field, value) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: value
      }
    }));
  };

  const handleNotificationToggle = (channel, type, value) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }));
  };

  const handleTelegramPhoneChange = (value) => {
    setNotifications(prev => ({
      ...prev,
      telegram: {
        ...prev.telegram,
        phoneNumber: value
      }
    }));
  };

  const activateTelegramNotifications = async () => {
    if (!notifications.telegram.phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    try {
      setTelegramActivationStatus('activating');
      const apiService = (await import('../../services/apiService')).default;
      await apiService.activateTelegramNotifications(notifications.telegram.phoneNumber);
      setTelegramActivationStatus('success');
      setTimeout(() => setTelegramActivationStatus(''), 3000);
    } catch (error) {
      console.error('Telegram activation failed:', error);
      setTelegramActivationStatus('error');
      setTimeout(() => setTelegramActivationStatus(''), 3000);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('nexus_notification_settings', JSON.stringify(notifications));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const notificationTypes = [
    { id: 'tradeSignals', label: 'Trade Signals', icon: TrendingUp, description: 'AI-generated trading signals' },
    { id: 'marketAlerts', label: 'Market Alerts', icon: AlertCircle, description: 'Price movements and market events' },
    { id: 'portfolioUpdates', label: 'Portfolio Updates', icon: DollarSign, description: 'Daily portfolio performance' },
    { id: 'systemUpdates', label: 'System Updates', icon: Bell, description: 'Platform updates and maintenance' }
  ];

  const channels = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Receive notifications via email' },
    { id: 'push', label: 'Push Notifications', icon: Bell, description: 'Browser and mobile push notifications' },
    { id: 'sms', label: 'SMS', icon: Smartphone, description: 'Text message notifications' },
    { id: 'telegram', label: 'Telegram', icon: MessageCircle, description: 'Telegram notifications (admin configured)' }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Channels</h2>
          </div>
          <button
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved!' : 
               saveStatus === 'error' ? 'Error!' : 'Save'}
            </span>
          </button>
        </div>

        <div className="space-y-6">
          {channels.map((channel) => (
            <div key={channel.id} className="border border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <channel.icon className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{channel.label}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{channel.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${channel.id}-enabled`}
                    checked={notifications[channel.id].enabled}
                    onChange={(e) => handleChannelToggle(channel.id, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
                  />
                  <label htmlFor={`${channel.id}-enabled`} className="text-sm text-[var(--text-primary)]">
                    Enable
                  </label>
                </div>
              </div>

              {notifications[channel.id].enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notificationTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <type.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">{type.label}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{type.description}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[channel.id][type.id]}
                        onChange={(e) => handleNotificationToggle(channel.id, type.id, e.target.checked)}
                        className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Telegram Phone Number Activation */}
              {channel.id === 'telegram' && notifications.telegram.enabled && (
                <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">Activate Telegram Notifications</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Phone Number</label>
                      <input
                        type="tel"
                        value={notifications.telegram.phoneNumber}
                        onChange={(e) => handleTelegramPhoneChange(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Enter your phone number to receive Telegram notifications
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={activateTelegramNotifications}
                        disabled={!notifications.telegram.phoneNumber || telegramActivationStatus === 'activating'}
                        className="px-3 py-1 bg-[var(--accent-primary)] text-white rounded text-sm hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>
                          {telegramActivationStatus === 'activating' ? 'Activating...' : 'Activate'}
                        </span>
                      </button>
                      {telegramActivationStatus === 'success' && (
                        <span className="text-sm text-[var(--success)]">✓ Activated successfully!</span>
                      )}
                      {telegramActivationStatus === 'error' && (
                        <span className="text-sm text-[var(--error)]">✗ Activation failed</span>
                      )}
                    </div>
                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                      <p className="text-xs text-[var(--text-muted)]">
                        <strong>Note:</strong> Telegram notifications are configured by the system administrator. 
                        You only need to provide your phone number to receive signals.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Frequency</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Update Frequency</label>
            <select
              value={notifications.frequency}
              onChange={(e) => setNotifications(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="realtime">Real-time</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="1hour">Every hour</option>
              <option value="daily">Daily digest</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="quietHours"
              checked={notifications.quietHours.enabled}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                quietHours: { ...prev.quietHours, enabled: e.target.checked }
              }))}
              className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="quietHours" className="text-sm text-[var(--text-primary)]">
              Enable quiet hours
            </label>
          </div>

          {notifications.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Start Time</label>
                <input
                  type="time"
                  value={notifications.quietHours.start}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">End Time</label>
                <input
                  type="time"
                  value={notifications.quietHours.end}
                  onChange={(e) => setNotifications(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preview */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preview</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--success)]">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Trade Signal: AAPL</h4>
                <p className="text-sm text-[var(--text-muted)]">Strong buy signal detected with 85% confidence</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--warning)]">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Market Alert: TSLA</h4>
                <p className="text-sm text-[var(--text-muted)]">Price dropped 5% in the last 10 minutes</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">5 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--info)]">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-[var(--info)]" />
              <div>
                <h4 className="font-medium text-[var(--text-primary)]">Portfolio Update</h4>
                <p className="text-sm text-[var(--text-muted)]">Daily P&L: +$1,250 (+2.3%)</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">1 hour ago</p>
              </div>
            </div>
          </div>

          {/* Telegram Message Preview */}
          {notifications.telegram.enabled && (
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--accent-primary)]">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-[var(--accent-primary)]" />
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">Telegram Message Preview</h4>
                  <div className="text-sm text-[var(--text-muted)] mt-2 p-3 bg-[var(--bg-secondary)] rounded">
                    <p><strong>🚀 Trade Signal: AAPL</strong></p>
                    <p>📈 BUY Signal</p>
                    <p>💰 Target: $185.50</p>
                    <p>🛑 Stop Loss: $175.20</p>
                    <p>📊 Confidence: 85%</p>
                    <p>⏰ Time: 14:30 EST</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 