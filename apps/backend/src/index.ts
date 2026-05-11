import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './data-source';
import app from './app';
import { seedPerfumes } from './seeds/perfumes.seed';
import { seedAdmin } from './seed-admin';
import { seedPromos } from './seeds/promos.seed';

console.log('DB_NAME:', process.env.DB_NAME);
const PORT = process.env.PORT || 5000;
console.log('JWT_SECRET:', process.env.JWT_SECRET);

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected');

    await seedPerfumes();
    await seedAdmin();
    await seedPromos();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });