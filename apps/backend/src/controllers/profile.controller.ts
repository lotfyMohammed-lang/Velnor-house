import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: req.user.userId },
      select: [
        'id',
        'email',
        'username',
        'phone',
        'gender',
        'birthDate',
        'country',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, phone, gender, birthDate, country } =
      req.body;

    if (username !== undefined) user.username = username || null;
    if (phone !== undefined) user.phone = phone || null;

    if (gender !== undefined) {
      user.gender = gender ? String(gender).trim().toLowerCase() : null;
    }

    if (birthDate !== undefined) {
      user.birthDate = birthDate ? birthDate : null;
    }

    if (country !== undefined) {
      user.country = country || null;
    }

    await userRepo.save(user);

    return res.status(200).json({
      message: 'Profile updated successfully ✅',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        birthDate: user.birthDate,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
