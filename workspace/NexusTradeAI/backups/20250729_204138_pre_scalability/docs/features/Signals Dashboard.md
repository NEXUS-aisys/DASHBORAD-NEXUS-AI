┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SIGNAL DASHBOARD SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │   FRONTEND      │    │    BACKEND      │    │   EXTERNAL      │             │
│  │   (React)       │    │   (Node.js)     │    │   SERVICES      │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│           │                       │                       │                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │ Signals         │    │ Batch API       │    │ Yahoo Finance   │             │
│  │ Dashboard       │◄──►│ Endpoints       │◄──►│ Alpha Vantage   │             │
│  │ Component       │    │                 │    │ Finnhub         │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│           │                       │                       │                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │ Symbol          │    │ Market Data     │    │ Polygon.io      │             │
│  │ Management      │    │ Service         │    │ IEX Cloud       │             │
│  │ (Watchlist)     │    │                 │    │ MarketStack     │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│           │                       │                       │                     │
│           │                       │                       │                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             │
│  │ Filtering &     │    │ Signal          │    │ Technical       │             │
│  │ View Controls   │    │ Processing      │    │ Indicators      │             │
│  │ (Grid/List)     │    │ Engine          │    │ Service         │             │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

🔄 DATA FLOW DIAGRAM
1. BATCH SIGNAL FETCHING FLOW
 ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │  FRONTEND   │    │   BACKEND   │    │  EXTERNAL   │
│  INTERFACE  │    │  COMPONENT  │    │    API      │    │  PROVIDERS  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Select Symbols │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 2. fetchBatchSignals() │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 3. POST /api/trading/signals/batch │
       │                   │                   │──────────────────►│
       │                   │                   │                   │ 4. Parallel Requests
       │                   │                   │                   │──────────────────►│
       │                   │                   │                   │ 5. Market Data (ES, NQ, CL, GC, ZB)
       │                   │                   │                   │◄──────────────────│
       │                   │                   │ 6. Process & Combine │                   │
       │                   │                   │◄──────────────────│                   │
       │                   │ 7. Update State   │                   │                   │
       │                   │◄──────────────────│                   │                   │
       │ 8. Display Cards  │                   │                   │                   │
       │◄──────────────────│                   │                   │                   │


2. AUTO-REFRESH FLOW
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  AUTO-REFRESH│    │  FRONTEND   │    │   BACKEND   │    │  EXTERNAL   │
│   TIMER     │    │  COMPONENT  │    │    API      │    │  PROVIDERS  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. 60s Timer      │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 2. Auto-refresh   │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 3. Batch Request  │
       │                   │                   │──────────────────►│
       │                   │                   │                   │ 4. Updated Data
       │                   │                   │                   │◄──────────────────│
       │                   │ 5. Update UI      │                   │                   │
       │                   │◄──────────────────│                   │                   │
       │ 6. Reset Timer    │                   │                   │                   │
       │◄──────────────────│                   │                   │                   │

       3. SYMBOL MANAGEMENT FLOW
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │  FRONTEND   │    │   BACKEND   │    │  EXTERNAL   │
│  INPUT      │    │  COMPONENT  │    │    API      │    │  PROVIDERS  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Add Symbol     │                   │                   │
       │──────────────────►│                   │                   │
       │                   │ 2. addSymbol()    │                   │
       │                   │──────────────────►│                   │
       │                   │ 3. Update State   │                   │
       │                   │◄──────────────────│                   │
       │                   │ 4. Trigger Fetch  │                   │
       │                   │──────────────────►│                   │
       │                   │                   │ 5. New Symbol Data│
       │                   │                   │──────────────────►│
       │                   │ 6. Update Cards   │                   │
       │                   │◄──────────────────│                   │
       │ 7. Display New    │                   │                   │
       │    Signal Card    │                   │                   │
       │◄──────────────────│                   │                   │


       🔌 API ENDPOINTS DIAGRAM
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGNAL DASHBOARD API ENDPOINTS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  �� BATCH SIGNAL ENDPOINTS                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ POST   /api/trading/signals/batch       - Fetch multiple symbols       │ │
│  │ Body: { symbols: ['ES', 'NQ', 'CL', 'GC', 'ZB'] }                      │ │
│  │ Response: { success: true, data: [signal1, signal2, ...] }             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  📊 SIGNAL PROCESSING ENDPOINTS                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ GET    /api/trading/signals/:symbol     - Single symbol analysis       │ │
│  │ GET    /api/trading/signals/performance - Performance metrics          │ │
│  │ GET    /api/trading/signals/watchlist   - User watchlist               │ │
│  │ POST   /api/trading/signals/:symbol/watch - Add to watchlist           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  🔧 MARKET DATA ENDPOINTS                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ GET    /api/market/:symbol              - Market data for symbol       │ │
│  │ GET    /api/market/historical/:symbol   - Historical data              │ │
│  │ GET    /api/trading/market/providers    - Provider status              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  📈 TECHNICAL INDICATORS                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ GET    /api/trading/indicators/signals/:symbol - Indicator signals     │ │
│  │ POST   /api/trading/indicators/calculate - Calculate indicators        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

📊 COMPONENT INTERACTION DIAGRAM
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGNAL DASHBOARD COMPONENT                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           STATE MANAGEMENT                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   signals   │  │   loading   │  │    error    │  │ viewMode    │   │ │
│  │  │   (array)   │  │ (boolean)   │  │   (string)  │  │  (string)   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │selectedSymbols│ │filterSignal │ │filterConfidence│ │autoRefresh │   │ │
│  │  │   (array)   │  │  (string)   │  │   (string)  │  │ (boolean)   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           EVENT HANDLERS                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │fetchBatchSignals│  │addSymbol    │  │removeSymbol │  │filterSignals │  │ │
│  │  │   (async)   │  │   (function)│  │   (function)│  │   (function)│   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           UI COMPONENTS                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Header      │  │ Symbol      │  │ Filter      │  │ View Mode   │   │ │
│  │  │ Controls    │  │ Management  │  │ Controls    │  │ Toggle      │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Signal      │  │ Dashboard   │  │ Auto-refresh│  │ Error       │   │ │
│  │  │ Cards       │  │ Summary     │  │ Toggle      │  │ Display     │   │ │
│  │  │ (Grid/List) │  │ Statistics  │  │             │  │             │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

📈 SIGNAL CARD DATA STRUCTURE
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIGNAL CARD DATA STRUCTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 SIGNAL OBJECT STRUCTURE                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ {                                                                       │ │
│  │   symbol: "ES",                    // Symbol name                       │ │
│  │   timestamp: "2024-01-15T10:30:00Z", // Signal timestamp               │ │
│  │   error: null,                     // Error if any                      │ │
│  │                                                                         │ │
│  │   summary: {                        // Signal summary                   │ │
│  │     signal: "BUY",                  // BUY/SELL/HOLD                    │ │
│  │     confidence: 87,                 // 0-100 confidence score           │ │
│  │     sentiment: "bullish",           // Market sentiment                 │ │
│  │     entryPrice: { min: 4850, max: 4860 }, // Entry price range         │ │
│  │     targetPrice: 4920,              // Target price                     │ │
│  │     stopLoss: 4810,                 // Stop loss price                  │ │
│  │     riskRewardRatio: 2.5            // Risk/reward ratio                │ │
│  │   },                                                                │ │
│  │                                                                         │ │
│  │   marketData: {                     // Market data                      │ │
│  │     currentPrice: 4855.25,          // Current price                    │ │
│  │     change: 12.50,                  // Price change                     │ │
│  │     changePercent: 0.26,            // Percentage change                │ │
│  │     volume: 1250000,                // Trading volume                   │ │
│  │     high: 4865.50,                  // Day high                         │ │
│  │     low: 4840.75                    // Day low                          │ │
│  │   }                                                                     │ │
│  │ }                                                                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  🎨 UI RENDERING COMPONENTS                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  • Signal Icon (TrendingUp/TrendingDown/Minus)                         │ │
│  │  • Signal Badge (BUY/SELL/HOLD with color coding)                      │ │
│  │  • Price Information (Current, Change, Percentage)                     │ │
│  │  • Confidence Bar (Visual progress bar)                                │ │
│  │  • Sentiment Indicator (Text with styling)                             │ │
│  │  • Price Targets (Entry, Target, Stop Loss)                            │ │
│  │  • Risk/Reward Ratio Display                                           │ │
│  │  • Timestamp (Last update time)                                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

🔄 FILTERING & VIEW SYSTEM
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FILTERING & VIEW SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔍 SIGNAL FILTERING                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Signal Type Filter:                                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │    All      │  │    BUY      │  │    SELL     │  │    HOLD     │   │ │
│  │  │  Signals    │  │  Signals    │  │  Signals    │  │  Signals    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │  Confidence Filter:                                                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │    All      │  │    High     │  │   Medium    │  │     Low     │   │ │
│  │  │   Levels    │  │   (80%+)    │  │  (60-79%)   │  │   (<60%)    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  👁️ VIEW MODES                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Grid View:                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Signal    │  │   Signal    │  │   Signal    │  │   Signal    │   │ │
│  │  │   Card 1    │  │   Card 2    │  │   Card 3    │  │   Card 4    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  │  List View:                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Signal Card 1 (Horizontal layout)                              │   │ │
│  │  │ Signal Card 2 (Horizontal layout)                              │   │ │
│  │  │ Signal Card 3 (Horizontal layout)                              │   │ │
│  │  │ Signal Card 4 (Horizontal layout)                              │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  🔄 FILTERING LOGIC                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  const filteredSignals = signals.filter(signal => {                   │ │
│  │    // Signal type filter                                               │ │
│  │    if (filterSignal !== 'all' && signal.summary?.signal !== filterSignal) │ │
│  │      return false;                                                     │ │
│  │                                                                         │ │
│  │    // Confidence filter                                                │ │
│  │    if (filterConfidence !== 'all') {                                   │ │
│  │      const confidence = signal.summary?.confidence || 0;               │ │
│  │      if (filterConfidence === 'high' && confidence < 80) return false; │ │
│  │      if (filterConfidence === 'medium' && (confidence < 60 || confidence >= 80)) return false; │ │
│  │      if (filterConfidence === 'low' && confidence >= 60) return false; │ │
│  │    }                                                                    │ │
│  │                                                                         │ │
│  │    return true;                                                         │ │
│  │  });                                                                    │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

📊 DASHBOARD SUMMARY STATISTICS
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD SUMMARY STATISTICS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📈 SUMMARY METRICS                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Total     │  │    Buy      │  │    Sell     │  │    Hold     │   │ │
│  │  │ Contracts   │  │  Signals    │  │  Signals    │  │  Signals    │   │ │
│  │  │             │  │             │  │             │  │             │   │ │
│  │  │     5       │  │     3       │  │     1       │  │     1       │   │ │
│  │  │             │  │             │  │             │  │             │   │ │
│  │  │   Total     │  │   Green     │  │    Red      │  │  Yellow     │   │ │
│  │  │ Contracts   │  │  Signals    │  │  Signals    │  │  Signals    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  🔢 CALCULATION LOGIC                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  // Total Contracts                                                    │ │
│  │  const totalContracts = signals.length;                                │ │
│  │                                                                         │ │
│  │  // Buy Signals                                                        │ │
│  │  const buySignals = signals.filter(s => s.summary?.signal === 'BUY').length; │ │
│  │                                                                         │ │
│  │  // Sell Signals                                                       │ │
│  │  const sellSignals = signals.filter(s => s.summary?.signal === 'SELL').length; │ │
│  │                                                                         │ │
│  │  // Hold Signals                                                       │ │
│  │  const holdSignals = signals.filter(s => s.summary?.signal === 'HOLD').length; │ │
│  │                                                                         │ │
│  │  // Average Confidence                                                 │ │
│  │  const avgConfidence = signals.reduce((sum, s) => sum + (s.summary?.confidence || 0), 0) / signals.length; │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


⚡ AUTO-REFRESH MECHANISM


┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTO-REFRESH MECHANISM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔄 AUTO-REFRESH FLOW                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │ │
│  │  │   User      │    │  Frontend   │    │   Backend   │    │  External   │ │
│  │  │  Toggle     │    │  Component  │    │    API      │    │  Providers  │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │ │
│  │       │                   │                   │                   │     │ │
│  │       │ 1. Enable Auto-refresh │                   │                   │     │ │
│  │       │──────────────────►│                   │                   │     │ │
│  │       │                   │ 2. Set 60s Timer │                   │     │ │
│  │       │                   │──────────────────►│                   │     │ │
│  │       │                   │                   │ 3. Timer Expires │     │ │
│  │       │                   │                   │──────────────────►│     │ │
│  │       │                   │ 4. Fetch Signals │                   │     │ │
│  │       │                   │──────────────────►│                   │     │ │
│  │       │                   │                   │ 5. Updated Data  │     │ │
│  │       │                   │                   │◄──────────────────│     │ │
│  │       │                   │ 6. Update UI      │                   │     │ │
│  │       │                   │◄──────────────────│                   │     │ │
│  │       │ 7. Reset Timer    │                   │                   │     │ │
│  │       │                   │◄──────────────────│                   │     │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ⏰ TIMER IMPLEMENTATION                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  useEffect(() => {                                                     │ │
│  │    fetchBatchSignals();                                                │ │
│  │                                                                         │ │
│  │    if (autoRefresh) {                                                  │ │
│  │      const interval = setInterval(fetchBatchSignals, 60000); // 60s   │ │
│  │      return () => clearInterval(interval);                            │ │
│  │    }                                                                   │ │
│  │  }, [selectedSymbols, autoRefresh]);                                  │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  🎛️ USER CONTROLS                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  • Auto-refresh Toggle Button                                          │ │
│  │  • Manual Refresh Button                                               │ │
│  │  • Loading State Indicator                                             │ │
│  │  • Error State Display                                                 │ │
│  │  • Last Update Timestamp                                               │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
