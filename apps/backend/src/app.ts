import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './routes/profile.routes';
import perfumeRoutes from './modules/perfumes/perfumes.routes';
import orderRoutes from './modules/orders/orders.routes';
import returnsRoutes from './modules/returns/returns.routes';
import adminAuthRoutes from './modules/admin-auth/admin-auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import promoRoutes from './modules/promos/promos.routes';
import addressRoutes from './modules/addresses/address.routes';
import settingsRoutes from './modules/settings/settings.routes';
import aiRoutes from './modules/admin/ai/ai.routes';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.CLIENT_URL,
        process.env.ADMIN_URL,
      ].filter(Boolean) as string[];

      const isAllowed = allowedOrigins.some(o => origin === o || origin.startsWith(o));

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/perfumes', perfumeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/ai', aiRoutes);
app.use('/api', routes);

app.use(errorHandler);

export default app;
