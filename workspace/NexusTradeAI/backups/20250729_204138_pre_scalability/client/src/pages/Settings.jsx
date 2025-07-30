import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider.jsx';
import ProfileSettings from '../components/settings/ProfileSettings';
import SubscriptionSettings from '../components/settings/SubscriptionSettings';
import TradingPreferences from '../components/settings/TradingPreferences';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import { Loader, User, CreditCard, Settings as SettingsIcon, Bell, Shield, TrendingUp } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setProfileData(user);
  }, [user]);
  
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  
  const saveProfileChanges = async () => {
    try {
      setSaveStatus('saving');
      await updateUser(profileData);
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'subscription', label: 'Billing', icon: CreditCard },
  ];

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-[var(--text-muted)]">Manage your account and trading preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-[var(--accent-primary)]" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[var(--bg-tertiary)] p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
              <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <ProfileSettings
            profileData={profileData}
            onProfileChange={handleProfileChange}
            onSave={saveProfileChanges}
            saveStatus={saveStatus}
          />
        )}
        
        {activeTab === 'trading' && (
          <TradingPreferences />
        )}
        
        {activeTab === 'notifications' && (
          <NotificationSettings />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings />
        )}
        
        {activeTab === 'subscription' && (
          <SubscriptionSettings />
        )}
      </div>
    </div>
  );
};

export default Settings;
