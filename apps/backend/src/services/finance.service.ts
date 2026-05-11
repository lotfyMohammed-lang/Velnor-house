import { AppDataSource } from '../data-source';
import { Order } from '../entities/Order';
import { ReturnRequest } from '../entities/ReturnRequest';

export const financeService = {
  getFinanceSummary: async () => {
    const orderRepository = AppDataSource.getRepository(Order);
    const returnRequestRepository = AppDataSource.getRepository(ReturnRequest);

    // Total Revenue & Total Orders
    const orders = await orderRepository.find();
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    const totalOrders = orders.length;

    // Approved and Pending Returns Count
    const approvedReturns = await returnRequestRepository.findBy({ status: 'approved' });
    const pendingReturns = await returnRequestRepository.findBy({ status: 'pending' });
    const approvedReturnsCount = approvedReturns.length;
    const pendingReturnsCount = pendingReturns.length;

    // Return Expenses (detailed calculation)
    let returnExpenses = 0;
    for (const returnReq of approvedReturns) {
      const order = await orderRepository.findOne({
        where: { id: returnReq.orderId },
      });

      if (order) {
        const returnedItem = order.items.find(
          item => item.productId === returnReq.productId && item.sizeMl === returnReq.sizeMl
        );
        if (returnedItem) {
          returnExpenses += Number(returnedItem.price || 0) * Number(returnReq.quantity || 0);
        }
      }
    }

    const netRevenue = totalRevenue - returnExpenses;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      returnExpenses: Number(returnExpenses.toFixed(2)),
      netRevenue: Number(netRevenue.toFixed(2)),
      totalOrders,
      approvedReturnsCount,
      pendingReturnsCount,
    };
  },
};
