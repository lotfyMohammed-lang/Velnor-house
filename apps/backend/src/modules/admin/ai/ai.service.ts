import { Between, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../../data-source';
import { Order } from '../../../entities/Order';
import { Perfume } from '../../../entities/Perfume';
import { ReturnRequest } from '../../../entities/ReturnRequest';
import { User } from '../../../entities/User';
import { PromoCode } from '../../../entities/PromoCode';
import { OpenAIService, AIStructuredResponse } from '../../../services/openai.service';

export class AIService {
  static async processQuery(query: string): Promise<AIStructuredResponse> {
    console.log(`🤖 [AIService] Processing query: "${query}"`);

    const contextData = await this.buildStoreContext();
    const storeContext = JSON.parse(contextData);

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('No API Key');
      }
      const response = await OpenAIService.query(query, contextData);
      console.log(`✅ [AIService] OpenAI response received.`);
      return response;
    } catch (error: any) {
      console.warn('⚠️ [AIService] OpenAI flow failed, using rule-based fallback:', error.message);
      return this.fallbackQuery(query, storeContext);
    }
  }

  private static fallbackQuery(query: string, data: any): AIStructuredResponse {
    const q = query.toLowerCase();

    // 1. Sales / Revenue
    if (q.includes('sale') || q.includes('revenue') || q.includes('profit') || q.includes('money')) {
      return {
        type: 'report',
        title: 'Sales & Revenue Analysis (Local Engine)',
        summary: `Today's revenue is EGP ${data.storeStats.revenue.today.toLocaleString()}. Weekly revenue reached EGP ${data.storeStats.revenue.thisWeek.toLocaleString()}.`,
        metrics: [
          { label: 'Today Revenue', value: `EGP ${data.storeStats.revenue.today.toLocaleString()}` },
          { label: 'Weekly Revenue', value: `EGP ${data.storeStats.revenue.thisWeek.toLocaleString()}` },
          { label: 'Total Orders', value: String(data.storeStats.totalOrders) },
          { label: 'Avg Order Value', value: `EGP ${(data.storeStats.totalOrders ? (data.storeStats.revenue.thisWeek / data.storeStats.totalOrders) : 0).toFixed(0)}` }
        ],
        recommendations: [
          'Monitor the conversion rate for today\'s visitors.',
          'Consider a weekend promo if weekly revenue is below target.'
        ]
      };
    }

    // 2. Stock / Inventory
    if (q.includes('stock') || q.includes('inventory') || q.includes('product') || q.includes('perfume')) {
      const lowStock = data.storeStats.inventory.filter((p: any) => p.variants.some((v: any) => v.stock < 5));
      return {
        type: 'ranking',
        title: 'Inventory & Stock Report (Local Engine)',
        summary: `You have ${data.storeStats.totalProducts} products in catalog. ${lowStock.length} items are running low on stock.`,
        items: data.storeStats.inventory.slice(0, 5).map((p: any) => ({
          name: p.name,
          value: `${p.variants[0]?.stock || 0} units`,
          subtitle: p.brand
        })),
        recommendations: [
          'Restock items with less than 5 units.',
          'Review top selling products for inventory priority.'
        ]
      };
    }

    // 3. Customers
    if (q.includes('customer') || q.includes('user') || q.includes('people')) {
      return {
        type: 'summary',
        title: 'Customer Base Overview (Local Engine)',
        summary: `Velnor House has ${data.storeStats.totalCustomers} registered customers.`,
        metrics: [
          { label: 'Total Customers', value: String(data.storeStats.totalCustomers) }
        ],
        recommendations: [
          'Run a re-engagement email campaign for old customers.',
          'Encourage new signups with a welcome promo code.'
        ]
      };
    }

    // Default Fallback
    return {
      type: 'text',
      title: 'Velnor AI Assistant (Local Mode)',
      summary: "I'm currently running in local mode because the AI connection is unavailable.",
      content: `I can see that you have ${data.storeStats.totalOrders} total orders and ${data.storeStats.totalProducts} products. Your revenue today is EGP ${data.storeStats.revenue.today.toLocaleString()}.`,
      recommendations: [
        'Check the Finance page for detailed revenue charts.',
        'Visit the Orders page to manage recent purchases.'
      ]
    };
  }

  private static async buildStoreContext(): Promise<string> {
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    const orderRepo = AppDataSource.getRepository(Order);
    const userRepo = AppDataSource.getRepository(User);
    const returnRepo = AppDataSource.getRepository(ReturnRequest);
    const promoRepo = AppDataSource.getRepository(PromoCode);

    // 1. Products Summary
    const perfumes = await perfumeRepo.find();
    const productStats = perfumes.map(p => ({
      name: p.name,
      brand: p.brand,
      variants: p.sizes.map(s => ({ size: s.sizeMl, stock: s.stock, price: s.price }))
    }));

    // 2. Orders Summary (Recent 100)
    const recentOrders = await orderRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
    
    const orderStats = {
      totalCount: await orderRepo.count(),
      recent: recentOrders.map(o => ({
        id: o.id.slice(0, 8),
        total: o.totalPrice,
        status: o.status,
        date: o.createdAt.toISOString().split('T')[0],
        itemsCount: o.items.length
      }))
    };

    // 3. User Summary
    const userCount = await userRepo.count();

    // 4. Returns Summary
    const returnStats = {
      total: await returnRepo.count(),
      pending: await returnRepo.count({ where: { status: 'pending' } })
    };

    // 5. Promo Codes
    const promos = await promoRepo.find({ where: { isActive: true } });
    const promoList = promos.map(p => ({ code: p.code, type: p.discountType, value: p.discountValue }));

    // 6. Time-based aggregations (Today & This Week)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const todayOrders = await orderRepo.find({ where: { createdAt: MoreThanOrEqual(todayStart) } });
    const weekOrders = await orderRepo.find({ where: { createdAt: MoreThanOrEqual(weekStart) } });

    const dailyRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
    const weeklyRevenue = weekOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    // 7. Top Sellers (calculated from the recent orders for efficiency)
    const salesMap: Record<string, number> = {};
    recentOrders.forEach(o => o.items.forEach(i => {
      salesMap[i.name] = (salesMap[i.name] || 0) + i.quantity;
    }));
    const topSellers = Object.entries(salesMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    const contextObject = {
      currentDate: now.toISOString(),
      storeStats: {
        totalProducts: perfumes.length,
        totalCustomers: userCount,
        totalOrders: orderStats.totalCount,
        revenue: {
          today: dailyRevenue,
          thisWeek: weeklyRevenue
        },
        inventory: productStats,
        topSellingProducts: topSellers,
        returns: returnStats,
        activePromos: promoList
      }
    };

    return JSON.stringify(contextObject);
  }
}
