import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Save, Smartphone, Key, LogOut } from 'lucide-react';

const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    sessionTimeout: 30,
    requirePasswordForTrades: true,
    ipWhitelist: [],
    loginHistory: []
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load saved security settings from localStorage
    const saved = localStorage.getItem('nexus_security_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSecurity(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    }

    // Load mock login history
    setSecurity(prev => ({
      ...prev,
      loginHistory: [
        { id: 1, location: 'New York, NY', device: 'Chrome on Windows', time: '2024-01-15 14:30:00', ip: '192.168.1.100' },
        { id: 2, location: 'New York, NY', device: 'Safari on iPhone', time: '2024-01-14 09:15:00', ip: '192.168.1.101' },
        { id: 3, location: 'Unknown', device: 'Firefox on Mac', time: '2024-01-13 16:45:00', ip: '203.0.113.1' }
      ]
    }));
  }, []);

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const saveSecuritySettings = async () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('nexus_security_settings', JSON.stringify(security));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setSaveStatus('saving');
      // Here you would typically make an API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswords({ current: '', new: '', confirm: '' });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const enableTwoFactor = async () => {
    try {
      setSaveStatus('saving');
      // Here you would typically make an API call to enable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const PasswordInput = ({ field, label, placeholder }) => (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={passwords[field]}
          onChange={(e) => handlePasswordChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(field)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Two-Factor Authentication</h2>
          </div>
          <button
            onClick={saveSecuritySettings}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">SMS Authentication</h3>
              <p className="text-sm text-[var(--text-muted)]">Receive codes via text message</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${security.twoFactorEnabled ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={enableTwoFactor}
                disabled={security.twoFactorEnabled}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  security.twoFactorEnabled
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-[var(--accent-primary)] text-white hover:bg-opacity-90'
                }`}
              >
                {security.twoFactorEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={security.emailNotifications}
              onChange={(e) => handleSecurityChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="emailNotifications" className="text-sm text-[var(--text-primary)]">
              Send security notifications via email
            </label>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Password</h2>
        </div>

        <div className="space-y-4">
          <PasswordInput field="current" label="Current Password" placeholder="Enter current password" />
          <PasswordInput field="new" label="New Password" placeholder="Enter new password" />
          <PasswordInput field="confirm" label="Confirm New Password" placeholder="Confirm new password" />
          
          <button
            onClick={changePassword}
            disabled={!passwords.current || !passwords.new || !passwords.confirm}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Session Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Session Timeout (minutes)</label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requirePasswordForTrades"
              checked={security.requirePasswordForTrades}
              onChange={(e) => handleSecurityChange('requirePasswordForTrades', e.target.checked)}
              className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
            />
            <label htmlFor="requirePasswordForTrades" className="text-sm text-[var(--text-primary)]">
              Require password confirmation for large trades
            </label>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Login Activity</h2>
          </div>
          <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out All</span>
          </button>
        </div>

        <div className="space-y-3">
          {security.loginHistory.map((login) => (
            <div key={login.id} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{login.location}</p>
                  <p className="text-xs text-[var(--text-muted)]">{login.device} • {login.ip}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--text-primary)]">{new Date(login.time).toLocaleDateString()}</p>
                <p className="text-xs text-[var(--text-muted)]">{new Date(login.time).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 