import bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { Admin } from './entities/Admin';

export async function seedAdmin() {
  const adminRepo = AppDataSource.getRepository(Admin);

  const existing = await adminRepo.findOne({
    where: { email: 'admin@velnor.com' },
  });

  if (existing) {
    console.log('Super admin already exists. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = adminRepo.create({
    name: 'Super Admin',
    email: 'admin@velnor.com',
    password: hashedPassword,
    role: 'super_admin',
  });

  await adminRepo.save(superAdmin);

  console.log('Super admin seeded successfully.');
  console.log('  Email:    admin@velnor.com');
  console.log('  Password: Admin@123');
}