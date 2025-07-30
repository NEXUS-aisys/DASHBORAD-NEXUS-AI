import React, { useState, useEffect } from 'react';
import { User, MapPin, Globe, Briefcase, Calendar, Save, Key, Shield, TestTube, Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    tradingExperience: '',
    accountType: '',
    tradingStyle: '',
    investmentGoals: '',
    country: '',
    state: '',
    city: '',
    timezone: '',
    primaryBroker: '',
    accountNumber: '',
    accountSize: '',
    tradingSince: ''
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [cryptoApis, setCryptoApis] = useState([]);
  const [showApiKey, setShowApiKey] = useState({});
  const [testingApi, setTestingApi] = useState({});
  const [apiTestResults, setApiTestResults] = useState({});

  // Crypto Exchange Options
  const cryptoExchanges = [
    { id: 'binance', name: 'Binance', icon: '₿', description: 'Global cryptocurrency exchange' },
    { id: 'coinbase', name: 'Coinbase', icon: '🪙', description: 'US-based crypto exchange' },
    { id: 'kraken', name: 'Kraken', icon: '🐙', description: 'Professional crypto trading platform' },
    { id: 'kucoin', name: 'KuCoin', icon: '🔴', description: 'People\'s exchange' },
    { id: 'bybit', name: 'Bybit', icon: '⚡', description: 'Crypto derivatives exchange' },
    { id: 'okx', name: 'OKX', icon: '🟢', description: 'Global crypto exchange' },
    { id: 'gate', name: 'Gate.io', icon: '🚪', description: 'Cryptocurrency exchange' },
    { id: 'huobi', name: 'Huobi', icon: '🔥', description: 'Global digital asset exchange' }
  ];

  // Comprehensive list of all countries
  const countries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'CD', name: 'Democratic Republic of the Congo' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Greece' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'North Korea' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Romania' },
    { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapore' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
  ];

  // Trading experience options
  const tradingExperienceOptions = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)' },
    { value: 'advanced', label: 'Advanced (3-5 years)' },
    { value: 'expert', label: 'Expert (5+ years)' }
  ];

  // Account type options
  const accountTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'joint', label: 'Joint Account' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'trust', label: 'Trust' },
    { value: 'ira', label: 'IRA' },
    { value: '401k', label: '401(k)' }
  ];

  // Trading style options
  const tradingStyleOptions = [
    { value: 'day_trading', label: 'Day Trading' },
    { value: 'swing_trading', label: 'Swing Trading' },
    { value: 'position_trading', label: 'Position Trading' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'long_term', label: 'Long-term Investing' },
    { value: 'options', label: 'Options Trading' },
    { value: 'futures', label: 'Futures Trading' }
  ];

  // Investment goals options
  const investmentGoalsOptions = [
    { value: 'capital_growth', label: 'Capital Growth' },
    { value: 'income_generation', label: 'Income Generation' },
    { value: 'wealth_preservation', label: 'Wealth Preservation' },
    { value: 'retirement', label: 'Retirement Planning' },
    { value: 'education', label: 'Education Funding' },
    { value: 'tax_efficiency', label: 'Tax Efficiency' }
  ];

  // Timezone options (major timezones)
  const timezoneOptions = [
    { value: 'UTC-12', label: 'UTC-12 (Baker Island, Howland Island)' },
    { value: 'UTC-11', label: 'UTC-11 (Samoa, American Samoa)' },
    { value: 'UTC-10', label: 'UTC-10 (Hawaii, Tahiti)' },
    { value: 'UTC-9', label: 'UTC-9 (Alaska)' },
    { value: 'UTC-8', label: 'UTC-8 (Pacific Time)' },
    { value: 'UTC-7', label: 'UTC-7 (Mountain Time)' },
    { value: 'UTC-6', label: 'UTC-6 (Central Time)' },
    { value: 'UTC-5', label: 'UTC-5 (Eastern Time)' },
    { value: 'UTC-4', label: 'UTC-4 (Atlantic Time)' },
    { value: 'UTC-3', label: 'UTC-3 (Brazil, Argentina)' },
    { value: 'UTC-2', label: 'UTC-2 (South Georgia)' },
    { value: 'UTC-1', label: 'UTC-1 (Azores, Cape Verde)' },
    { value: 'UTC+0', label: 'UTC+0 (London, Lisbon)' },
    { value: 'UTC+1', label: 'UTC+1 (Paris, Berlin)' },
    { value: 'UTC+2', label: 'UTC+2 (Cairo, Helsinki)' },
    { value: 'UTC+3', label: 'UTC+3 (Moscow, Istanbul)' },
    { value: 'UTC+4', label: 'UTC+4 (Dubai, Baku)' },
    { value: 'UTC+5', label: 'UTC+5 (Tashkent, Karachi)' },
    { value: 'UTC+5:30', label: 'UTC+5:30 (Mumbai, New Delhi)' },
    { value: 'UTC+6', label: 'UTC+6 (Dhaka, Almaty)' },
    { value: 'UTC+7', label: 'UTC+7 (Bangkok, Jakarta)' },
    { value: 'UTC+8', label: 'UTC+8 (Beijing, Singapore)' },
    { value: 'UTC+9', label: 'UTC+9 (Tokyo, Seoul)' },
    { value: 'UTC+10', label: 'UTC+10 (Sydney, Melbourne)' },
    { value: 'UTC+11', label: 'UTC+11 (Solomon Islands)' },
    { value: 'UTC+12', label: 'UTC+12 (New Zealand, Fiji)' }
  ];

  useEffect(() => {
    // Load saved profile data from localStorage
    const saved = localStorage.getItem('nexus_profile_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfileData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }

    // Load crypto APIs
    const savedApis = localStorage.getItem('nexus_crypto_apis');
    if (savedApis) {
      try {
        const parsed = JSON.parse(savedApis);
        setCryptoApis(parsed);
      } catch (error) {
        console.error('Error loading crypto APIs:', error);
      }
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    try {
      setSaveStatus('saving');
      localStorage.setItem('nexus_profile_data', JSON.stringify(profileData));
      localStorage.setItem('nexus_crypto_apis', JSON.stringify(cryptoApis));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // Crypto API Management Functions
  const addCryptoApi = () => {
    const newApi = {
      id: Date.now(),
      exchange: '',
      apiKey: '',
      secretKey: '',
      passphrase: '',
      isActive: false,
      createdAt: new Date().toISOString()
    };
    setCryptoApis([...cryptoApis, newApi]);
  };

  const removeCryptoApi = (id) => {
    setCryptoApis(cryptoApis.filter(api => api.id !== id));
    setShowApiKey(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setApiTestResults(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateCryptoApi = (id, field, value) => {
    setCryptoApis(cryptoApis.map(api => 
      api.id === id ? { ...api, [field]: value } : api
    ));
  };

  const toggleApiKeyVisibility = (id) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const testCryptoApi = async (api) => {
    setTestingApi(prev => ({ ...prev, [api.id]: true }));
    setApiTestResults(prev => ({ ...prev, [api.id]: null }));

    try {
      // Test API connection - use the test endpoint that doesn't require authentication
      const response = await fetch('/api/trading/test/crypto-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exchange: api.exchange,
          apiKey: api.apiKey,
          secretKey: api.secretKey,
          passphrase: api.passphrase
        })
      });

      const result = await response.json();
      setApiTestResults(prev => ({ 
        ...prev, 
        [api.id]: result.success ? 'success' : 'error' 
      }));
    } catch (error) {
      console.error('API test error:', error);
      setApiTestResults(prev => ({ 
        ...prev, 
        [api.id]: 'error' 
      }));
    } finally {
      setTestingApi(prev => ({ ...prev, [api.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">First Name</label>
            <input
              type="text"
              value={profileData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Last Name</label>
            <input
              type="text"
              value={profileData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Email</label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Date of Birth</label>
            <input
              type="date"
              value={profileData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Trading Experience</label>
            <select
              value={profileData.tradingExperience || ''}
              onChange={(e) => handleInputChange('tradingExperience', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select trading experience</option>
              {tradingExperienceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trading Profile */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trading Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Account Type</label>
            <select
              value={profileData.accountType || ''}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select account type</option>
              {accountTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Trading Style</label>
            <select
              value={profileData.tradingStyle || ''}
              onChange={(e) => handleInputChange('tradingStyle', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select trading style</option>
              {tradingStyleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Investment Goals</label>
            <select
              value={profileData.investmentGoals || ''}
              onChange={(e) => handleInputChange('investmentGoals', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select investment goals</option>
              {investmentGoalsOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Account Size</label>
            <select
              value={profileData.accountSize || ''}
              onChange={(e) => handleInputChange('accountSize', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select account size</option>
              <option value="under_10k">Under $10,000</option>
              <option value="10k_50k">$10,000 - $50,000</option>
              <option value="50k_100k">$50,000 - $100,000</option>
              <option value="100k_500k">$100,000 - $500,000</option>
              <option value="500k_1m">$500,000 - $1,000,000</option>
              <option value="over_1m">Over $1,000,000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Trading Since</label>
            <input
              type="date"
              value={profileData.tradingSince || ''}
              onChange={(e) => handleInputChange('tradingSince', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Primary Broker</label>
            <input
              type="text"
              value={profileData.primaryBroker || ''}
              onChange={(e) => handleInputChange('primaryBroker', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your primary broker"
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="professional-card">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Location Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Country</label>
            <select
              value={profileData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select your country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">State/Province</label>
            <input
              type="text"
              value={profileData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your state or province"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">City</label>
            <input
              type="text"
              value={profileData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Enter your city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Timezone</label>
            <select
              value={profileData.timezone || ''}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="">Select your timezone</option>
              {timezoneOptions.map(timezone => (
                <option key={timezone.value} value={timezone.value}>{timezone.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Crypto API Management */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Crypto Exchange APIs</h2>
          </div>
          <button
            onClick={addCryptoApi}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add API</span>
          </button>
        </div>

        <div className="space-y-4">
          {cryptoApis.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No crypto exchange APIs configured</p>
              <p className="text-sm">Add your exchange API keys to access real-time crypto data</p>
            </div>
          ) : (
            cryptoApis.map((api) => (
              <div key={api.id} className="border border-[var(--border-primary)] rounded-lg p-4 bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <select
                      value={api.exchange}
                      onChange={(e) => updateCryptoApi(api.id, 'exchange', e.target.value)}
                      className="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    >
                      <option value="">Select Exchange</option>
                      {cryptoExchanges.map(exchange => (
                        <option key={exchange.id} value={exchange.id}>
                          {exchange.icon} {exchange.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`active-${api.id}`}
                        checked={api.isActive}
                        onChange={(e) => updateCryptoApi(api.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-secondary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)]"
                      />
                      <label htmlFor={`active-${api.id}`} className="text-sm text-[var(--text-primary)]">
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testCryptoApi(api)}
                      disabled={testingApi[api.id] || !api.exchange || !api.apiKey}
                      className="px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50 flex items-center space-x-1"
                    >
                      {testingApi[api.id] ? (
                        <TestTube className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                      <span>Test</span>
                    </button>
                    <button
                      onClick={() => removeCryptoApi(api.id)}
                      className="px-3 py-1 bg-[var(--error)]/10 text-[var(--error)] rounded hover:bg-[var(--error)]/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* API Test Results */}
                {apiTestResults[api.id] && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                    apiTestResults[api.id] === 'success' 
                      ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                      : 'bg-[var(--error)]/10 text-[var(--error)]'
                  }`}>
                    {apiTestResults[api.id] === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {apiTestResults[api.id] === 'success' 
                        ? 'API connection successful!' 
                        : 'API connection failed. Please check your credentials.'
                      }
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey[api.id] ? "text" : "password"}
                        value={api.apiKey}
                        onChange={(e) => updateCryptoApi(api.id, 'apiKey', e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        placeholder="Enter API Key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility(api.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showApiKey[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Secret Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey[api.id] ? "text" : "password"}
                        value={api.secretKey}
                        onChange={(e) => updateCryptoApi(api.id, 'secretKey', e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        placeholder="Enter Secret Key"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility(api.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showApiKey[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {(api.exchange === 'kraken' || api.exchange === 'okx') && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Passphrase</label>
                      <div className="relative">
                        <input
                          type={showApiKey[api.id] ? "text" : "password"}
                          value={api.passphrase}
                          onChange={(e) => updateCryptoApi(api.id, 'passphrase', e.target.value)}
                          className="w-full px-3 py-2 pr-10 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                          placeholder="Enter Passphrase (Kraken/OKX only)"
                        />
                        <button
                          onClick={() => toggleApiKeyVisibility(api.id)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          {showApiKey[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-[var(--text-muted)]">
                  <p>⚠️ Your API keys are encrypted and stored locally. Never share them with anyone.</p>
                  <p>🔒 For security, only enable "Read" permissions on your API keys.</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={saveStatus === 'saving'}
          className="px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>
            {saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'saved' ? 'Saved!' : 
             saveStatus === 'error' ? 'Error!' : 'Save Profile'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings; 