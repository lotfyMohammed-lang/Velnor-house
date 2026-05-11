import { AppDataSource } from '../../data-source';
import { ReturnRequest } from '../../entities/ReturnRequest';
import { Order } from '../../entities/Order';
import { Perfume } from '../../entities/Perfume';

export class ReturnsService {
  private returnRepository = AppDataSource.getRepository(ReturnRequest);
  private orderRepository = AppDataSource.getRepository(Order);
  private perfumeRepository = AppDataSource.getRepository(Perfume);

  async createReturnRequest(userId: string, data: {
    orderId: string;
    productId: string;
    productName: string;
    sizeMl: number;
    quantity: number;
    reason: string;
  }) {
    const order = await this.orderRepository.findOne({
      where: { id: data.orderId, user: { id: userId } },
    });

    if (!order) {
      throw new Error('Order not found or does not belong to you');
    }

    // Check if within 14 days
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      throw new Error('Return window (14 days) has expired');
    }

    // Optional: Check if duplicate request exists for this product in this order
    const existing = await this.returnRepository.findOne({
      where: { orderId: data.orderId, productId: data.productId, userId, sizeMl: data.sizeMl },
    });

    if (existing) {
      throw new Error('A return request already exists for this item');
    }

    const returnRequest = this.returnRepository.create({
      ...data,
      userId,
      status: 'pending',
    });

    return await this.returnRepository.save(returnRequest);
  }

  async getUserReturnRequests(userId: string) {
    return await this.returnRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    });
  }

  // Admin methods
  async getAllReturnRequests() {
    return await this.returnRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'order'],
    });
  }

  async updateReturnStatus(requestId: string, status: 'approved' | 'rejected') {
    const request = await this.returnRepository.findOne({
      where: { id: requestId },
      relations: ['order'],
    });

    if (!request) {
      throw new Error('Return request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Return request is already processed');
    }

    // If approved, restore stock
    if (status === 'approved') {
      const perfume = await this.perfumeRepository.findOne({
        where: { id: request.productId },
      });

      if (perfume && request.sizeMl !== null) {
        const sizes = [...perfume.sizes];
        const sizeIndex = sizes.findIndex((s) => s.sizeMl === request.sizeMl);
        
        if (sizeIndex !== -1) {
          sizes[sizeIndex] = {
            ...sizes[sizeIndex],
            stock: Number(sizes[sizeIndex].stock) + Number(request.quantity)
          };
          perfume.sizes = sizes;
          await this.perfumeRepository.save(perfume);
        }
      }
    }

    request.status = status;
    return await this.returnRepository.save(request);
  }
}
