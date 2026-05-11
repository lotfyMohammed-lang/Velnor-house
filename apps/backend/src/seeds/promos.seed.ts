import { AppDataSource } from '../data-source';
import { PromoCode, DiscountType } from '../entities/PromoCode';

export async function seedPromos() {
  const promoRepository = AppDataSource.getRepository(PromoCode);

  const initialPromos = [
    {
      code: 'WELCOME10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      maxDiscount: 200,
    },
    {
      code: 'SAVE15',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      maxDiscount: 200,
    },
    {
      code: 'EGYPT50',
      discountType: DiscountType.FIXED,
      discountValue: 50,
      maxDiscount: 200,
    },
  ];

  for (const promoData of initialPromos) {
    const existing = await promoRepository.findOneBy({ code: promoData.code });
    if (!existing) {
      const promo = promoRepository.create(promoData);
      await promoRepository.save(promo);
      console.log(`Seeded promo code: ${promoData.code}`);
    }
  }
}
