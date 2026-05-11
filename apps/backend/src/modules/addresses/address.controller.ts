import { Response } from 'express';
import { AppDataSource } from '../../data-source';
import { UserAddress } from '../../entities/UserAddress';
import { User } from '../../entities/User';
import { AuthRequest } from '../../middleware/auth.middleware';
import { formatFullAddress } from '../../utils/address-formatter';

const addressRepository = AppDataSource.getRepository(UserAddress);
const userRepository = AppDataSource.getRepository(User);

export class AddressController {
  static async getMyAddresses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const addresses = await addressRepository.find({
        where: { user: { id: userId } },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });

      return res.status(200).json(addresses);
    } catch (error) {
      console.error('GET ADDRESSES ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        label,
        governorate,
        city,
        area,
        street,
        buildingNumber,
        apartmentNumber,
        floor,
        landmark,
        deliveryNotes,
        phone,
        isDefault
      } = req.body;

      if (!label || !governorate || !city || !area || !street || !buildingNumber || !phone) {
        return res.status(400).json({ message: 'Missing required address fields' });
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
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

      if (isDefault) {
        await addressRepository.update(
          { user: { id: userId } },
          { isDefault: false }
        );
      }

      const address = addressRepository.create({
        user,
        label,
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
        isDefault: !!isDefault,
      });

      await addressRepository.save(address);
      return res.status(201).json(address);
    } catch (error) {
      console.error('CREATE ADDRESS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async setDefault(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        return res.status(400).json({ message: 'Address id is required' });
      }

      await addressRepository.update(
        { user: { id: userId } },
        { isDefault: false }
      );

      await addressRepository.update(
        { id: String(id), user: { id: userId } },
        { isDefault: true }
      );

      return res.status(200).json({ message: 'Default address updated' });
    } catch (error) {
      console.error('SET DEFAULT ADDRESS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        return res.status(400).json({ message: 'Address id is required' });
      }

      await addressRepository.delete({ id: String(id), user: { id: userId } });

      return res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
      console.error('DELETE ADDRESS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
