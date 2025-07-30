import React, { useState, useEffect } from 'react';
import { CreditCard, Loader, Calendar, DollarSign, CheckCircle, AlertCircle, Download } from 'lucide-react';
import apiService from '../../services/apiService';

const SubscriptionSettings = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingHistory, setBillingHistory] = useState([]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subData = await apiService.getSubscription();
        setSubscription(subData);
        
        // Mock billing history
        setBillingHistory([
          {
            id: 1,
            date: '2024-01-15',
            amount: 29.99,
            status: 'paid',
            description: 'NexusTrade Pro - Monthly Plan',
            invoice: 'INV-2024-001'
          },
          {
            id: 2,
            date: '2023-12-15',
            amount: 29.99,
            status: 'paid',
            description: 'NexusTrade Pro - Monthly Plan',
            invoice: 'INV-2023-012'
          },
          {
            id: 3,
            date: '2023-11-15',
            amount: 29.99,
            status: 'paid',
            description: 'NexusTrade Pro - Monthly Plan',
            invoice: 'INV-2023-011'
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleManageSubscription = async () => {
    try {
      const { url } = await apiService.createSubscription();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create subscription session:', error);
    }
  };

  const downloadInvoice = (invoiceId) => {
    // Mock invoice download
    console.log(`Downloading invoice: ${invoiceId}`);
    alert(`Invoice ${invoiceId} download started...`);
  };

  if (loading) {
    return (
      <div className="professional-card">
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Current Plan</h2>
        </div>
        
        {subscription && subscription.stripe_status === 'active' ? (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--success)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">NexusTrade Pro</h3>
                  <p className="text-sm text-[var(--text-muted)]">Monthly subscription</p>
                  <p className="text-sm text-[var(--text-muted)]">$29.99/month</p>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                  <span className="text-sm text-[var(--success)]">Active</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">$29.99</div>
                <div className="text-sm text-[var(--text-muted)]">Monthly Cost</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">Next</div>
                <div className="text-sm text-[var(--text-muted)]">Feb 15, 2024</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">Auto</div>
                <div className="text-sm text-[var(--text-muted)]">Renewal</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Manage Subscription
              </button>
              <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-l-4 border-[var(--warning)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Free Plan</h3>
                  <p className="text-sm text-[var(--text-muted)]">Limited features</p>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
                  <span className="text-sm text-[var(--warning)]">Free</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <h4 className="font-medium text-[var(--text-primary)] mb-2">Upgrade to Pro</h4>
              <ul className="text-sm text-[var(--text-muted)] space-y-1">
                <li>• Unlimited trading signals</li>
                <li>• Advanced analytics</li>
                <li>• Real-time market data</li>
                <li>• Priority support</li>
                <li>• Custom alerts</li>
              </ul>
            </div>

            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Subscribe Now - $29.99/month
            </button>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Payment Method</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-[var(--accent-primary)] rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">•••• •••• •••• 4242</p>
                  <p className="text-xs text-[var(--text-muted)]">Expires 12/25</p>
                </div>
              </div>
              <button className="text-sm text-[var(--accent-primary)] hover:underline">
                Update
              </button>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Billing History</h2>
        </div>
        
        <div className="space-y-3">
          {billingHistory.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  invoice.status === 'paid' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{invoice.description}</p>
                  <p className="text-xs text-[var(--text-muted)]">{invoice.date} • {invoice.invoice}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">${invoice.amount}</span>
                <button
                  onClick={() => downloadInvoice(invoice.invoice)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Features */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Plan Features</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Free Plan</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>5 trading signals per day</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Basic market data</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Portfolio tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Email support</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Pro Plan - $29.99/month</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Unlimited trading signals</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Real-time market data</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Custom alerts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                <span>API access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings; 