import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source';
import { Admin } from '../../entities/Admin';

const adminRepo = AppDataSource.getRepository(Admin);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
}

export class AdminAuthService {
  static async login(email: string, password: string) {
    const admin = await adminRepo.findOne({ where: { email } });

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }

  static async register(name: string, email: string, password: string) {
    const existing = await adminRepo.findOne({ where: { email } });

    if (existing) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = adminRepo.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await adminRepo.save(admin);

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
