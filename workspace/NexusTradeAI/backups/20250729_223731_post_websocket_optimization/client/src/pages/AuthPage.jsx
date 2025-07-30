import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm.jsx';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isLogin ? (
        <LoginForm 
          onLogin={onLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground text-xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Register Coming Soon</h2>
              <p className="text-muted-foreground mb-4">Registration is currently under development.</p>
              <button 
                onClick={() => setIsLogin(true)}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
