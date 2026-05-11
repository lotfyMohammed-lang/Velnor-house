import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Perfume } from '../../entities/Perfume';
import { Order } from '../../entities/Order';
import { Project } from '../../entities/Project';
import { Admin } from '../../entities/Admin';
import { ReturnRequest } from '../../entities/ReturnRequest';
import { Notification } from '../../entities/Notification';
import { Setting } from '../../entities/Setting';
import { AdminRequest } from '../../middleware/admin-auth.middleware';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../settings/settings.service';
import { MoreThan } from 'typeorm';

const userRepo = AppDataSource.getRepository(User);
const perfumeRepo = AppDataSource.getRepository(Perfume);
const orderRepo = AppDataSource.getRepository(Order);
const projectRepo = AppDataSource.getRepository(Project);
const adminRepo = AppDataSource.getRepository(Admin);
const returnRequestRepo = AppDataSource.getRepository(ReturnRequest);
const notificationRepo = AppDataSource.getRepository(Notification);
const settingsRepo = AppDataSource.getRepository(Setting);

type OrderItem = {
  productId?: string;
  price?: number | string;
  quantity?: number;
  sizeMl?: number;
};

export class AdminController {
  // Dashboard
  static async getDashboard(_req: AdminRequest, res: Response) {
    try {
      const totalUsers = await userRepo.count();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newUsersLast7Days = await userRepo.count({
        where: { createdAt: MoreThan(sevenDaysAgo) },
      });

      const totalPerfumes = await perfumeRepo.count();
      const totalOrders = await orderRepo.count();

      const recentUsers = await userRepo.find({
        select: ['id', 'username', 'email', 'createdAt'],
        order: { createdAt: 'DESC' },
        take: 5,
      });

      const pendingOrders = await orderRepo.count({
        where: { status: 'pending' },
      });

      const recentOrders = await orderRepo.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 5,
      });

      const revenue = await orderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalPrice), 0)', 'total')
        .getRawOne();

      const approvedReturns = await returnRequestRepo.find({
        where: { status: 'approved' },
        relations: ['order'],
      });

      const returnExpenses = approvedReturns.reduce((sum, returnRequest) => {
        const orderItems = Array.isArray(returnRequest.order?.items)
          ? (returnRequest.order.items as OrderItem[])
          : [];

        const matchedItem = orderItems.find((item) => {
          const sameProduct = item.productId === returnRequest.productId;

          if (returnRequest.sizeMl == null) {
            return sameProduct;
          }

          return sameProduct && Number(item.sizeMl) === Number(returnRequest.sizeMl);
        });

        const itemPrice = Number(matchedItem?.price ?? 0);
        const returnedQty = Number(returnRequest.quantity ?? 0);

        return sum + itemPrice * returnedQty;
      }, 0);

      return res.json({
        totalUsers,
        newUsersLast7Days,
        totalPerfumes,
        totalOrders,
        pendingOrders,
        totalRevenue: Number(revenue?.total ?? 0),
        returnExpenses,
        recentUsers,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          fullName: o.fullName,
          totalPrice: o.totalPrice,
          status: o.status,
          itemCount: o.items?.length ?? 0,
          createdAt: o.createdAt,
          user: o.user ? { id: o.user.id, username: o.user.username } : null,
        })),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async getFinanceSummary(_req: AdminRequest, res: Response) {
    try {
      const totalOrders = await orderRepo.count();

      const revenue = await orderRepo
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalPrice), 0)', 'total')
        .getRawOne();

      const totalRevenue = Number(revenue?.total ?? 0);

      const approvedReturns = await returnRequestRepo.find({
        where: { status: 'approved' },
        relations: ['order'],
      });

      const returnExpenses = approvedReturns.reduce((sum, returnRequest) => {
        const orderItems = Array.isArray(returnRequest.order?.items)
          ? (returnRequest.order.items as OrderItem[])
          : [];

        const matchedItem = orderItems.find((item) => {
          const sameProduct = item.productId === returnRequest.productId;
          if (returnRequest.sizeMl == null) return sameProduct;
          return sameProduct && Number(item.sizeMl) === Number(returnRequest.sizeMl);
        });

        const itemPrice = Number(matchedItem?.price ?? 0);
        const returnedQty = Number(returnRequest.quantity ?? 0);

        return sum + itemPrice * returnedQty;
      }, 0);

      const approvedReturnsCount = await returnRequestRepo.count({
        where: { status: 'approved' },
      });

      const pendingReturnsCount = await returnRequestRepo.count({
        where: { status: 'pending' },
      });

      return res.json({
        totalRevenue,
        returnExpenses,
        netRevenue: totalRevenue - returnExpenses,
        totalOrders,
        approvedReturnsCount,
        pendingReturnsCount,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  // Users CRUD
  static async getUsers(_req: AdminRequest, res: Response) {
    try {
      const users = await userRepo.find({
        order: { createdAt: 'DESC' },
      });
      return res.json(users);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async getUserById(req: AdminRequest, res: Response) {
    try {
      const userId = String(req.params.id);

      const user = await userRepo.findOne({
        where: { id: userId },
        select: [
          'id', 'username', 'email', 'phone', 'gender', 'birthDate',
          'country', 'googleId', 'createdAt', 'updatedAt',
        ],
      });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const projects = await projectRepo.find({
        where: { userId },
        relations: ['tasks'],
        order: { createdAt: 'DESC' },
      });

      const orders = await orderRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length ?? 0), 0);

      return res.json({
        ...user,
        projects,
        orders,
        stats: {
          totalProjects: projects.length,
          totalTasks,
          totalOrders: orders.length,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async createUser(req: AdminRequest, res: Response) {
    try {
      const { username, email, password, phone } = req.body;

      const existing = await userRepo.findOne({
        where: [{ email }, { username }],
      });
      if (existing) {
        const field = existing.email === email ? 'Email' : 'Username';
        return res.status(400).json({ message: `${field} already in use` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepo.create({
        username,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        googleId: null,
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      });

      await userRepo.save(user);
      return res.status(201).json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  static async updateUser(req: AdminRequest, res: Response) {
    try {
      const user = await userRepo.findOne({ where: { id: String(req.params.id) } });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { username, email, phone, gender, birthDate, country } = req.body;

      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone || null;
      if (gender !== undefined) user.gender = gender || null;
      if (birthDate !== undefined) user.birthDate = birthDate || null;
      if (country !== undefined) user.country = country || null;

      await userRepo.save(user);
      return res.json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  static async deleteUser(req: AdminRequest, res: Response) {
    try {
      const user = await userRepo.findOne({ where: { id: String(req.params.id) } });
      if (!user) return res.status(404).json({ message: 'User not found' });

      await userRepo.remove(user);
      return res.json({ message: 'User deleted' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  // Perfumes CRUD
  static async getPerfumes(_req: AdminRequest, res: Response) {
    try {
      const perfumes = await perfumeRepo.find({ order: { createdAt: 'DESC' } });
      return res.json(perfumes);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async createPerfume(req: AdminRequest, res: Response) {
    try {
      const perfume = perfumeRepo.create(req.body);
      await perfumeRepo.save(perfume);
      return res.status(201).json(perfume);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  static async updatePerfume(req: AdminRequest, res: Response) {
    try {
      const perfume = await perfumeRepo.findOne({ where: { id: String(req.params.id) } });
      if (!perfume) return res.status(404).json({ message: 'Perfume not found' });

      Object.assign(perfume, req.body);
      await perfumeRepo.save(perfume);
      return res.json(perfume);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  static async deletePerfume(req: AdminRequest, res: Response) {
    try {
      const perfume = await perfumeRepo.findOne({ where: { id: String(req.params.id) } });
      if (!perfume) return res.status(404).json({ message: 'Perfume not found' });

      await perfumeRepo.remove(perfume);
      return res.json({ message: 'Perfume deleted' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async uploadPerfumeImage(req: AdminRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const host = req.get('host');
      const protocol = req.protocol;
      const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      return res.status(200).json({ imageUrl });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  // Admins CRUD
  static async getAdmins(_req: AdminRequest, res: Response) {
    try {
      const admins = await adminRepo.find({
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' },
      });
      return res.json(admins);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async getAdminById(req: AdminRequest, res: Response) {
    try {
      const admin = await adminRepo.findOne({
        where: { id: String(req.params.id) },
        select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      return res.json(admin);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async updateAdmin(req: AdminRequest, res: Response) {
    try {
      const admin = await adminRepo.findOne({ where: { id: String(req.params.id) } });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });

      const { name, email, role } = req.body;
      if (name !== undefined) admin.name = name;
      if (email !== undefined) admin.email = email;
      if (role !== undefined) admin.role = role;

      await adminRepo.save(admin);

      const { password: _, ...safe } = admin;
      return res.json(safe);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  static async deleteAdmin(req: AdminRequest, res: Response) {
    try {
      const targetId = String(req.params.id);

      if (req.admin?.adminId === targetId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const admin = await adminRepo.findOne({ where: { id: targetId } });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });

      await adminRepo.remove(admin);
      return res.json({ message: 'Admin deleted' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  // Orders
  static async getOrders(_req: AdminRequest, res: Response) {
    try {
      const orders = await orderRepo.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      return res.json(orders.map((o) => ({
        ...o,
        user: o.user ? { id: o.user.id, username: o.user.username, email: o.user.email } : null,
      })));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async getOrderById(req: AdminRequest, res: Response) {
    try {
      const order = await orderRepo.findOne({
        where: { id: String(req.params.id) },
        relations: ['user'],
      });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.json({
        ...order,
        user: order.user ? { id: order.user.id, username: order.user.username, email: order.user.email } : null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async updateOrderStatus(req: AdminRequest, res: Response) {
    try {
      const order = await orderRepo.findOne({ where: { id: String(req.params.id) } });
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'Status is required' });

      order.status = status;
      await orderRepo.save(order);
      return res.json(order);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }

  // Notifications
  static async getNotifications(_req: AdminRequest, res: Response) {
    try {
      const notifications = await notificationRepo.find({
        order: { createdAt: 'DESC' },
        take: 50,
      });

      const unreadCount = await notificationRepo.count({
        where: { isRead: false },
      });

      return res.json({
        notifications,
        unreadCount,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async markNotificationAsRead(req: AdminRequest, res: Response) {
    try {
      const notification = await notificationRepo.findOne({
        where: { id: String(req.params.id) },
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      notification.isRead = true;
      await notificationRepo.save(notification);

      return res.json(notification);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async markAllNotificationsAsRead(_req: AdminRequest, res: Response) {
    try {
      await notificationRepo.update({ isRead: false }, { isRead: true });
      return res.json({ message: 'All notifications marked as read' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async testTelegram(_req: AdminRequest, res: Response) {
    try {
      await NotificationService.testTelegram();
      return res.json({ message: 'Telegram test message sent! Check your Telegram.' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  // Communication Settings (WhatsApp + Notifications)
  static async getCommunicationSettings(_req: AdminRequest, res: Response) {
    try {
      const settings = await SettingsService.getSettings();
      return res.json(settings);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(500).json({ message });
    }
  }

  static async updateCommunicationSettings(req: AdminRequest, res: Response) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return res.json(settings);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server error';
      return res.status(400).json({ message });
    }
  }
}