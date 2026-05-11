import { Router } from 'express';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware';
import { AdminController } from './admin.controller';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(adminAuthMiddleware);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);
router.get('/finance', AdminController.getFinanceSummary);

// Users CRUD
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Perfumes CRUD
router.get('/perfumes', AdminController.getPerfumes);
router.post('/perfumes/upload', upload.single('image'), AdminController.uploadPerfumeImage);
router.post('/perfumes', AdminController.createPerfume);
router.put('/perfumes/:id', AdminController.updatePerfume);
router.delete('/perfumes/:id', AdminController.deletePerfume);

// Admins CRUD
router.get('/admins', AdminController.getAdmins);
router.get('/admins/:id', AdminController.getAdminById);
router.put('/admins/:id', AdminController.updateAdmin);
router.delete('/admins/:id', AdminController.deleteAdmin);

// Orders
router.get('/orders', AdminController.getOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// Notifications
router.get('/notifications', AdminController.getNotifications);
router.put('/notifications/:id/read', AdminController.markNotificationAsRead);
router.put('/notifications/read-all', AdminController.markAllNotificationsAsRead);

// Communication Settings (WhatsApp + Notifications)
router.get('/communication-settings', AdminController.getCommunicationSettings);
router.put('/communication-settings', AdminController.updateCommunicationSettings);

// Test Telegram
router.post('/test-telegram', AdminController.testTelegram);

export default router;
