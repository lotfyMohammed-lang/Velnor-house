import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware';

const router = Router();

// Publicly accessible to client
router.get('/', SettingsController.getSettings);

// Admin only
router.patch('/', adminAuthMiddleware, SettingsController.updateSettings);

export default router;
