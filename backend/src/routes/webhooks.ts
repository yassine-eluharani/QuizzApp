import { Router } from 'express';

const router = Router();

// RevenueCat webhook handler is registered in this router (see ./webhooks/revenuecat).
// Mounted in app.ts BEFORE express.json so raw body is available for signature verification.

import revenueCatRouter from './webhooks/revenuecat';
router.use('/revenuecat', revenueCatRouter);

export default router;
