import React from 'react';

const SymbolIcon = ({ symbol, type, size = 16, className = "" }) => {
  const symbolUpper = symbol?.toUpperCase();
  
  // Professional SVG icons for cryptocurrencies
  const cryptoIcons = {
    'BTC': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zM17.25 13.77c.276-1.83-1.12-2.814-3.022-3.473l.617-2.48-1.508-.375-.6 2.41c-.397-.1-.804-.194-1.207-.29l.605-2.427L9.55 6.33l-.617 2.48c-.328-.075-.65-.15-.97-.222l.002-.009-2.077-.52-.402 1.61s1.12.275 1.097.29c.61.153.77.56.75.885l-.75 3.01c.045.01.104.025.17.04-.055-.015-.113-.03-.175-.04l-1.075 4.32c-.082.206-.29.515-.76.397.018.025-1.097-.275-1.097-.275l-.748 1.68 1.965.49c.365.09.722.185 1.075.275l-.625 2.51 1.507.375.617-2.48c.41.11.81.21 1.2.31l-.612 2.46 1.506.375.625-2.51c2.56.49 4.49.29 5.31-2.05zm-3.95-5.538c-.732 2.94-5.67 1.36-7.273 1.92l.525-2.105c1.603-.4 6.76-1.265 6.748 1.185zm.732 2.944c-.823 3.3-6.12 1.62-7.77 2.03l.6-2.4c1.65-.41 6.99-1.23 7.17.37z"/>
      </svg>
    ),
    'ETH': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    'SOL': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.767 0c-.356 0-.703.248-.852.598L7.596 10.847a.987.987 0 0 0 .852 1.402h3.72l-5.023 10.153a.987.987 0 0 0 .852 1.402h6.324c.356 0 .703-.248.852-.598l5.319-10.249a.987.987 0 0 0-.852-1.402h-3.72l5.023-10.153A.987.987 0 0 0 20.091 0h-6.324z"/>
      </svg>
    ),
    'ADA': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM8.25 7.5v9l6.75-4.5-6.75-4.5z"/>
      </svg>
    ),
    'DOT': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM12 6.75c2.9 0 5.25 2.35 5.25 5.25S14.9 17.25 12 17.25 6.75 14.9 6.75 12 9.1 6.75 12 6.75z"/>
      </svg>
    ),
    'AVAX': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'MATIC': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'LINK': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM8.25 7.5l7.5 4.5-7.5 4.5v-9z"/>
      </svg>
    ),
    'UNI': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'AAVE': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'LTC': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'XRP': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'DOGE': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'SHIB': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'BNB': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'USDT': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'USDC': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'DAI': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'ATOM': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    'NEAR': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM6 6h12v12H6V6zm2 2v8h8V8H8z"/>
      </svg>
    ),
    'FTM': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
  };

  // Professional SVG icons for major stocks
  const stockIcons = {
    'AAPL': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    'MSFT': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
      </svg>
    ),
    'GOOGL': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    'AMZN': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M15.93 17.09c-2.27 0-4.1-1.84-4.1-4.1s1.84-4.1 4.1-4.1 4.1 1.84 4.1 4.1-1.84 4.1-4.1 4.1zm0-6.2c-1.16 0-2.1.94-2.1 2.1s.94 2.1 2.1 2.1 2.1-.94 2.1-2.1-.94-2.1-2.1-2.1z"/>
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
      </svg>
    ),
    'TSLA': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
        <path d="M7 7h10v10H7z"/>
      </svg>
    ),
    'META': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    'NVDA': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.864 16.404l-1.297-2.23L6.27 16.404H4.5l2.16-3.72L4.5 9h1.77l1.297 2.174L8.864 9h1.77l-2.16 3.684L10.634 16.4H8.864zm4.266 0V9h1.77v7.404h-1.77zm2.266-7.404h1.77v7.404h-1.77V9z"/>
      </svg>
    ),
    'NFLX': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5.398 0v.006c-.076.025-.152.05-.228.075C2.25 1.1 0 3.9 0 7.2v9.6c0 3.3 2.25 6.1 5.17 7.119V24h4.796v-5.678C13.35 17.194 16 14.394 16 11.094V1.5C16 .672 15.328 0 14.5 0H5.398z"/>
      </svg>
    ),
  };

  // Professional SVG icons for futures
  const futuresIcons = {
    'NQ': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    'ES': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    'YM': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    'GC': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    ),
    'CL': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    ),
  };

  // Professional SVG icons for ETFs
  const etfIcons = {
    'SPY': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    'QQQ': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    'GLD': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    ),
  };

  // Check for specific symbol first
  if (symbolUpper) {
    if (cryptoIcons[symbolUpper]) return cryptoIcons[symbolUpper];
    if (stockIcons[symbolUpper]) return stockIcons[symbolUpper];
    if (futuresIcons[symbolUpper]) return futuresIcons[symbolUpper];
    if (etfIcons[symbolUpper]) return etfIcons[symbolUpper];
    
    // Check partial matches for complex symbols
    for (const [key, icon] of Object.entries(cryptoIcons)) {
      if (symbolUpper.includes(key) || key.includes(symbolUpper)) {
        return icon;
      }
    }
    
    for (const [key, icon] of Object.entries(futuresIcons)) {
      if (symbolUpper.includes(key) || key.includes(symbolUpper)) {
        return icon;
      }
    }
  }
  
  // Fall back to generic type icons
  const genericIcons = {
    crypto: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM7.5 7.5l3 6 3-6h-6z"/>
      </svg>
    ),
    stock: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
        <path d="M7 7h10v10H7z"/>
      </svg>
    ),
    future: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    etf: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    forex: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    ),
    commodity: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    ),
    bond: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    index: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  };

  return genericIcons[type] || genericIcons.crypto;
};

export default SymbolIcon; 