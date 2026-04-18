import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: required('DATABASE_URL'),
  revenueCatSecretKey: required('REVENUECAT_SECRET_KEY'),
  revenueCatEntitlementId: process.env.REVENUECAT_ENTITLEMENT_ID ?? 'pro',
  adminApiKey: required('ADMIN_API_KEY'),
};
