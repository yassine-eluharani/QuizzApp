import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function csv(name: string, fallback: string[] = []): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: required('DATABASE_URL'),
  revenueCatSecretKey: required('REVENUECAT_SECRET_KEY'),
  revenueCatEntitlementId: process.env.REVENUECAT_ENTITLEMENT_ID ?? 'pro',
  revenueCatWebhookAuth: process.env.REVENUECAT_WEBHOOK_AUTH ?? '',
  adminApiKey: required('ADMIN_API_KEY'),
  logLevel: process.env.LOG_LEVEL ?? (nodeEnv === 'production' ? 'info' : 'debug'),
  allowedOrigins: csv('ALLOWED_ORIGINS', ['http://localhost:8081', 'http://localhost:19006']),
  pgPoolMax: parseInt(process.env.PG_POOL_MAX ?? '20', 10),
  pgIdleTimeoutMs: parseInt(process.env.PG_IDLE_TIMEOUT_MS ?? '30000', 10),
  pgConnectionTimeoutMs: parseInt(process.env.PG_CONNECTION_TIMEOUT_MS ?? '5000', 10),
};
