import { Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Order } from '../../entities/Order';
import { Perfume } from '../../entities/Perfume';
import { User } from '../../entities/User';
import { PromoCode, DiscountType } from '../../entities/PromoCode';
import { PromoUsage } from '../../entities/PromoUsage';
import { UserAddress } from '../../entities/UserAddress';
import { AuthRequest } from '../../middleware/auth.middleware';
import { NotificationService } from '../../services/notification.service';
import { formatFullAddress } from '../../utils/address-formatter';

const orderRepository = AppDataSource.getRepository(Order);
const userRepository = AppDataSource.getRepository(User);
const promoRepository = AppDataSource.getRepository(PromoCode);

type OrderItemInput = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  sizeMl?: number;
  productType?: string;
  quantity: number;
  image: string;
};

export class OrdersController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        fullName,
        email,
        phone,
        
        // Structured Address
        governorate,
        city,
        area,
        street,
        buildingNumber,
        apartmentNumber,
        floor,
        landmark,
        deliveryNotes,

        paymentMethod,
        items,
        totalPrice,
        appliedPromoCode,
        discountAmount = 0,
        saveAddress = false,
        addressLabel = 'Home',
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const user = await userRepository.findOneBy({ id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Basic validation for required address fields
      if (!governorate || !city || !area || !street || !buildingNumber) {
        return res.status(400).json({ message: 'Please complete all required address fields' });
      }

      // Validate promo code if provided
      let promo: PromoCode | null = null;
      if (appliedPromoCode) {
        promo = await promoRepository.findOneBy({
          code: appliedPromoCode.toUpperCase(),
          isActive: true,
        });

        if (!promo) {
          return res.status(400).json({ message: 'Invalid or inactive promo code' });
        }

        const usageRepository = AppDataSource.getRepository(PromoUsage);
        const existingUsage = await usageRepository.findOne({
          where: {
            user: { id: userId },
            promoCode: { id: promo.id },
          },
        });

        if (existingUsage) {
          return res.status(400).json({ message: 'You have already used this promo code' });
        }
      }

      for (const item of items) {
        if (
          !item.productId ||
          !item.quantity ||
          item.quantity < 1
        ) {
          return res.status(400).json({ message: 'Invalid order item data' });
        }
      }

      const fullAddressString = formatFullAddress({
        governorate,
        city,
        area,
        street,
        buildingNumber,
        apartmentNumber,
        floor,
        landmark
      });

      const order = await AppDataSource.transaction(async (manager) => {
        const perfumeRepository = manager.getRepository(Perfume);
        const transactionalOrderRepository = manager.getRepository(Order);
        const usageRepository = manager.getRepository(PromoUsage);
        const addressRepository = manager.getRepository(UserAddress);

        for (const item of items) {
          const perfume = await perfumeRepository.findOne({
            where: { id: item.productId },
          });

          if (!perfume) {
            throw new Error(`Product not found: ${item.name}`);
          }

          // Match variant: for perfumes use sizeMl, for others we expect only one variant (0 sizeMl)
          const variantToMatch = perfume.type === 'perfume' ? Number(item.sizeMl) : 0;

          const sizeIndex = perfume.sizes.findIndex(
            (size) => Number(size.sizeMl) === variantToMatch
          );

          if (sizeIndex === -1) {
            const errorMsg = perfume.type === 'perfume' 
              ? `Selected size ${item.sizeMl}ml is not available for ${perfume.name}`
              : `Product ${perfume.name} is unavailable`;
            throw new Error(errorMsg);
          }

          const selectedSize = perfume.sizes[sizeIndex];

          if (selectedSize.stock < item.quantity) {
            const stockMsg = perfume.type === 'perfume'
              ? `${perfume.name} ${selectedSize.sizeMl}ml only has ${selectedSize.stock} item(s) left in stock`
              : `${perfume.name} only has ${selectedSize.stock} item(s) left in stock`;
            throw new Error(stockMsg);
          }

          perfume.sizes[sizeIndex] = {
            ...selectedSize,
            stock: selectedSize.stock - item.quantity,
          };

          await perfumeRepository.save(perfume);
        }

        // Recalculate discount
        let verifiedDiscount = 0;
        if (promo) {
          const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
          if (promo.discountType === DiscountType.PERCENTAGE) {
            verifiedDiscount = subtotal * (Number(promo.discountValue) / 100);
          } else {
            verifiedDiscount = Number(promo.discountValue);
          }
          // Use the maxDiscount from the promo entity
          verifiedDiscount = Math.min(verifiedDiscount, Number(promo.maxDiscount));
        }

        const createdOrder = transactionalOrderRepository.create({
          user,
          fullName,
          email,
          phone,
          governorate,
          city,
          area,
          street,
          buildingNumber,
          apartmentNumber: apartmentNumber || null,
          floor: floor || null,
          landmark: landmark || null,
          deliveryNotes: deliveryNotes || null,
          address: fullAddressString,
          paymentMethod,
          totalPrice,
          discountAmount: verifiedDiscount,
          appliedPromoCode: promo ? promo.code : null,
          items,
          status: 'pending',
        });

        const savedOrder = await transactionalOrderRepository.save(createdOrder);

        if (promo) {
          const usage = usageRepository.create({
            user,
            promoCode: promo,
            order: savedOrder,
          });
          await usageRepository.save(usage);
        }

        // Save new address if requested
        if (saveAddress) {
          const newAddress = addressRepository.create({
            user,
            label: addressLabel || 'Home',
            governorate,
            city,
            area,
            street,
            buildingNumber,
            apartmentNumber: apartmentNumber || null,
            floor: floor || null,
            landmark: landmark || null,
            deliveryNotes: deliveryNotes || null,
            phone,
            fullAddress: fullAddressString,
            isDefault: false,
          });
          await addressRepository.save(newAddress);
        }

        // Update user's phone if it changed
        const userRepo = manager.getRepository(User);
        if (phone && user.phone !== phone) {
          user.phone = phone;
          await userRepo.save(user);
        }

        return savedOrder;
      });

      // Trigger notifications
      NotificationService.notifyNewOrder(order);

      return res.status(201).json({
        message: 'Order created successfully ✅',
        orderId: order.id,
      });
    } catch (error: any) {
      console.error('CREATE ORDER ERROR:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(error.message ? 400 : 500).json({ message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const order = await orderRepository.findOne({
        where: { id: String(req.params.id), user: { id: userId } },
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json(order);
    } catch (error: any) {
      console.error('GET ORDER ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const orders = await orderRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      return res.status(200).json(orders);
    } catch (error: any) {
      console.error('GET MY ORDERS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
