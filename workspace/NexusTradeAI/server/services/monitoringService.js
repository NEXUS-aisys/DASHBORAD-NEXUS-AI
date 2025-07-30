const client = require('prom-client');
const cluster = require('cluster');

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({
  prefix: 'nexustrade_ai_',
  register,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Buckets for GC duration
});

// Add a default label to all metrics
register.setDefaultLabels({
  app: 'nexustrade-ai-backend',
  workerId: cluster.isWorker ? `worker-${cluster.worker.id}` : 'master'
});

// Define custom metrics

// HTTP Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'nexustrade_ai_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestCounter = new client.Counter({
    name: 'nexustrade_ai_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

// WebSocket Metrics
const websocketConnections = new client.Gauge({
  name: 'nexustrade_ai_websocket_connections_total',
  help: 'Total number of active WebSocket connections',
});

const websocketMessagesSent = new client.Counter({
    name: 'nexustrade_ai_websocket_messages_sent_total',
    help: 'Total number of WebSocket messages sent',
    labelNames: ['event']
});

const websocketMessagesReceived = new client.Counter({
    name: 'nexustrade_ai_websocket_messages_received_total',
    help: 'Total number of WebSocket messages received',
    labelNames: ['event']
});

// Cache Metrics
const cacheHits = new client.Counter({
  name: 'nexustrade_ai_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type']
});

const cacheMisses = new client.Counter({
  name: 'nexustrade_ai_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type']
});

// Data Provider Metrics
const dataProviderRequests = new client.Counter({
    name: 'nexustrade_ai_data_provider_requests_total',
    help: 'Total number of requests to data providers',
    labelNames: ['provider', 'status']
});

const dataProviderRequestDuration = new client.Histogram({
    name: 'nexustrade_ai_data_provider_request_duration_seconds',
    help: 'Duration of requests to data providers in seconds',
    labelNames: ['provider'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Circuit Breaker Metrics
const circuitBreakerState = new client.Gauge({
    name: 'nexustrade_ai_circuit_breaker_state',
    help: 'State of the circuit breaker (0=closed, 1=open, 2=half-open)',
    labelNames: ['provider']
});

// Register all custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(websocketConnections);
register.registerMetric(websocketMessagesSent);
register.registerMetric(websocketMessagesReceived);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(dataProviderRequests);
register.registerMetric(dataProviderRequestDuration);
register.registerMetric(circuitBreakerState);

// Middleware for tracking HTTP requests
const trackHttpRequest = (req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        const route = req.route ? req.route.path : 'unknown_route';
        const code = res.statusCode;
        end({ route, code, method: req.method });
        httpRequestCounter.inc({ route, code, method: req.method });
    });
    next();
};


module.exports = {
  register,
  httpRequestDurationMicroseconds,
  httpRequestCounter,
  websocketConnections,
  websocketMessagesSent,
  websocketMessagesReceived,
  cacheHits,
  cacheMisses,
  dataProviderRequests,
  dataProviderRequestDuration,
  circuitBreakerState,
  trackHttpRequest
};