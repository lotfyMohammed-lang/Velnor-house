import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { Perfume, PerfumeSize } from '@/api/perfumes.api';
import { useAuth } from '@/lib/auth';
import { API_BASE_URL } from '@/api/client';

export interface CartItem {
  product: Perfume;
  selectedSize: PerfumeSize;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Perfume, size: PerfumeSize, quantity?: number) => void;
  removeItem: (productId: string, sizeMl: number) => void;
  updateQuantity: (productId: string, sizeMl: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  appliedPromo: string | null;
  setDiscount: (amount: number, promo: string | null) => void;
  validateAndApplyPromo: (code: string) => Promise<{ success: boolean; message?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'todolo_perfume_cart_v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // User-specific storage key
  const storageKey = useMemo(() => {
    return user ? `${CART_STORAGE_KEY}_${user.id}` : `${CART_STORAGE_KEY}_guest`;
  }, [user]);

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Use a ref to prevent race conditions during key switch
  const lastLoadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    } else {
      setItems([]);
    }
    setDiscountAmount(0);
    setAppliedPromo(null);
    setIsLoaded(true);
    lastLoadedKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (isLoaded && lastLoadedKeyRef.current === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, isLoaded, storageKey]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.selectedSize.price) * item.quantity,
        0
      ),
    [items]
  );

  const setDiscount = (amount: number, promo: string | null) => {
    setDiscountAmount(amount);
    setAppliedPromo(promo);
  };

  const validateAndApplyPromo = async (code: string) => {
    try {
      const token = localStorage.getItem('todolo_token');

      const response = await fetch(`${API_BASE_URL}/promos/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Invalid promo code',
        };
      }

      let discount = 0;

      if (data.discountType === 'percentage') {
        discount = totalPrice * (data.discountValue / 100);
      } else {
        discount = data.discountValue;
      }

      // Use the maxDiscount from the API response
      const finalDiscount = Math.min(discount, data.maxDiscount ?? 200);
      setDiscount(finalDiscount, data.code);

      return {
        success: true,
        message: 'Promo code applied successfully!',
      };
    } catch (error) {
      console.error('PROMO VALIDATION ERROR:', error);
      return {
        success: false,
        message: 'Failed to validate promo code',
      };
    }
  };

  const addItem = (product: Perfume, size: PerfumeSize, quantity: number = 1) => {
    let hitMaxStock = false;

    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize.sizeMl === size.sizeMl
      );

      if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;
        const clampedQuantity = Math.min(nextQuantity, size.stock);

        if (clampedQuantity === existingItem.quantity) {
          hitMaxStock = true;
          return prev;
        }

        if (nextQuantity > size.stock) {
          hitMaxStock = true;
        }

        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedSize.sizeMl === size.sizeMl
            ? { ...item, quantity: clampedQuantity }
            : item
        );
      }

      const safeQuantity = Math.min(quantity, size.stock);

      if (quantity > size.stock) {
        hitMaxStock = true;
      }

      if (safeQuantity <= 0) {
        hitMaxStock = true;
        return prev;
      }

      return [...prev, { product, selectedSize: size, quantity: safeQuantity }];
    });

    if (hitMaxStock) {
      toast.error('Maximum available stock reached');
    } else {
      const description = product.type === 'perfume' 
        ? `${size.sizeMl}ml - ${quantity} unit(s)`
        : `${quantity} unit(s)`;

      toast.success(`${product.name} added to cart`, {
        description,
      });
    }
  };

  const removeItem = (productId: string, sizeMl: number) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize.sizeMl === sizeMl
          )
      )
    );
  };

  const updateQuantity = (productId: string, sizeMl: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, sizeMl);
      return;
    }

    let hitMaxStock = false;

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize.sizeMl === sizeMl
        ) {
          const safeQuantity = Math.min(quantity, item.selectedSize.stock);

          if (quantity > item.selectedSize.stock) {
            hitMaxStock = true;
          }

          return { ...item, quantity: safeQuantity };
        }

        return item;
      })
    );

    if (hitMaxStock) {
      toast.error('Maximum available stock reached');
    }
  };

  const clearCart = () => {
    setItems([]);
    setDiscountAmount(0);
    setAppliedPromo(null);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    discountAmount,
    appliedPromo,
    setDiscount,
    validateAndApplyPromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}