const DEFAULT_PORT = 4010;
const DEFAULT_WS_PATH = '/ws';
const DEFAULT_BLOG_API_BASE_URL = 'http://127.0.0.1:8086/api';

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isProduction = ['production', 'pro'].includes(process.env.NODE_ENV);
const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'xld_blog_jwt_secret_2025_dev');

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required for ws-gateway');
}

const config = {
  port: toPositiveInt(process.env.PORT, DEFAULT_PORT),
  wsPath: process.env.WS_PATH || DEFAULT_WS_PATH,
  jwtSecret,
  blogApiBaseUrl: process.env.BLOG_API_BASE_URL || DEFAULT_BLOG_API_BASE_URL,
  musicQrPollIntervalMs: toPositiveInt(process.env.MUSIC_QR_POLL_INTERVAL_MS, 2000),
  musicQrMaxDurationMs: toPositiveInt(process.env.MUSIC_QR_MAX_DURATION_MS, 180000),
  musicQrMaxFailures: toPositiveInt(process.env.MUSIC_QR_MAX_FAILURES, 10),
  heartbeatIntervalMs: toPositiveInt(process.env.WS_HEARTBEAT_INTERVAL_MS, 30000),
  maxConnections: toPositiveInt(process.env.WS_MAX_CONNECTIONS, 200),
  maxSubscriptionsPerConnection: toPositiveInt(process.env.WS_MAX_SUBSCRIPTIONS_PER_CONNECTION, 3),
};

module.exports = config;
