import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Edit3, Save, X } from 'lucide-react';
import authService from '../../services/authService.js';

const UserProfile = ({ user, onLogout, onUpdateProfile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if server request fails
      onLogout();
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(editData);
      onUpdateProfile(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Trader';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {getInitials(getUserDisplayName())}
          </span>
        </div>
        <span className="hidden md:block text-sm text-[var(--text-secondary)]">
          {getUserDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-primary)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {getInitials(getUserDisplayName())}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {getUserDisplayName()}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Edit3 className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <div className="p-4 border-b border-[var(--border-primary)]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[var(--accent-primary)] text-white rounded text-sm hover:bg-[var(--accent-primary)]/80 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-sm hover:bg-[var(--bg-tertiary)]/80 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="p-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">Account Settings</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left">
              <User className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">Trading Profile</span>
            </button>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-[var(--border-primary)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 group-hover:text-red-300">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
