import { Router } from 'express';
import { AddressController } from './address.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/my', AddressController.getMyAddresses);
router.post('/', AddressController.create);
router.patch('/:id/default', AddressController.setDefault);
router.delete('/:id', AddressController.delete);

export default router;
