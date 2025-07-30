import React, { useState, useEffect } from 'react';
import { Settings, Bot, MessageCircle, Save, TestTube, Shield, Users } from 'lucide-react';

const TelegramAdminConfig = () => {
  const [config, setConfig] = useState({
    botToken: '',
    adminChatId: '',
    isEnabled: false,
    testMode: false
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lastSignalSent: null
  });

  useEffect(() => {
    // Load admin configuration from localStorage or API
    const saved = localStorage.getItem('nexus_telegram_admin_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading admin config:', error);
      }
    }
  }, []);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfig = async () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('nexus_telegram_admin_config', JSON.stringify(config));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const testBotConnection = async () => {
    if (!config.botToken || !config.adminChatId) {
      alert('Please enter both Bot Token and Admin Chat ID');
      return;
    }

    try {
      setTestStatus('testing');
      const apiService = (await import('../../services/apiService')).default;
      await apiService.testTelegramConnection(config.botToken, config.adminChatId);
      setTestStatus('success');
      setTimeout(() => setTestStatus(''), 3000);
    } catch (error) {
      console.error('Telegram test failed:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  const sendTestSignal = async () => {
    try {
      setTestStatus('sending');
      const apiService = (await import('../../services/apiService')).default;
      await apiService.sendTestTelegramSignal();
      setTestStatus('sent');
      setTimeout(() => setTestStatus(''), 3000);
    } catch (error) {
      console.error('Test signal failed:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-[var(--accent-primary)]" />
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Telegram Bot Configuration</h2>
              <p className="text-sm text-[var(--text-muted)]">Admin-only settings for Telegram notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-[var(--accent-primary)] text-white text-xs rounded">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Bot Configuration */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bot Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Bot Token</label>
            <input
              type="password"
              value={config.botToken}
              onChange={(e) => handleConfigChange('botToken', e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Get this from @BotFather on Telegram
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Admin Chat ID</label>
            <input
              type="text"
              value={config.adminChatId}
              onChange={(e) => handleConfigChange('adminChatId', e.target.value)}
              placeholder="123456789 or @admin_channel"
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Admin chat for system notifications and monitoring
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isEnabled"
              checked={config.isEnabled}
              onChange={(e) => handleConfigChange('isEnabled', e.target.checked)}
              className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="isEnabled" className="text-sm text-[var(--text-primary)]">
              Enable Telegram notifications system-wide
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="testMode"
              checked={config.testMode}
              onChange={(e) => handleConfigChange('testMode', e.target.checked)}
              className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="testMode" className="text-sm text-[var(--text-primary)]">
              Enable test mode (signals only sent to admin)
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={saveConfig}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error!' : 'Save Configuration'}
              </span>
            </button>

            <button
              onClick={testBotConnection}
              disabled={!config.botToken || !config.adminChatId || testStatus === 'testing'}
              className="px-4 py-2 bg-[var(--warning)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <TestTube className="w-4 h-4" />
              <span>
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </span>
            </button>
          </div>

          {testStatus === 'success' && (
            <div className="p-3 bg-[var(--success)] bg-opacity-10 border border-[var(--success)] rounded-lg">
              <p className="text-sm text-[var(--success)]">✓ Bot connection successful!</p>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded-lg">
              <p className="text-sm text-[var(--error)]">✗ Bot connection failed</p>
            </div>
          )}
        </div>
      </div>

      {/* System Statistics */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">System Statistics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-[var(--accent-primary)]" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Users</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-[var(--success)]" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Active Users</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center space-x-3">
              <Bot className="w-5 h-5 text-[var(--info)]" />
              <div>
                <p className="text-sm text-[var(--text-muted)]">Last Signal</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {stats.lastSignalSent ? new Date(stats.lastSignalSent).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <button
            onClick={sendTestSignal}
            disabled={!config.isEnabled || testStatus === 'sending'}
            className="px-4 py-2 bg-[var(--info)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <TestTube className="w-4 h-4" />
            <span>
              {testStatus === 'sending' ? 'Sending...' : 'Send Test Signal'}
            </span>
          </button>

          {testStatus === 'sent' && (
            <span className="text-sm text-[var(--success)]">✓ Test signal sent!</span>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="professional-card">
        <div className="p-4 bg-[var(--warning)] bg-opacity-10 border border-[var(--warning)] rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[var(--warning)] mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-2">Security Notice</h4>
              <ul className="text-sm text-[var(--text-muted)] space-y-1">
                <li>• Bot token should be kept secure and never shared</li>
                <li>• Only authorized administrators should access this configuration</li>
                <li>• Test mode is recommended for initial setup</li>
                <li>• Monitor system logs for any suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramAdminConfig; 