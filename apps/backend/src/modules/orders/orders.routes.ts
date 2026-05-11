import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', OrdersController.create);
router.get('/my', OrdersController.getMyOrders);
router.get('/:id', OrdersController.getById);

export default router;