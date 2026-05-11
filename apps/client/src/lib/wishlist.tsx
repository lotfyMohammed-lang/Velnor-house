import { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { Perfume } from '@/api/perfumes.api';
import { useAuth } from '@/lib/auth';

type WishlistContextValue = {
  items: Perfume[];
  count: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Perfume) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readWishlistFromStorage(key: string): Perfume[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Storage key is user-specific. Guests get their own separate storage.
  const storageKey = useMemo(() => {
    return user ? `todolo_wishlist_${user.id}` : 'todolo_wishlist_guest';
  }, [user]);

  // We use a ref to track which storage key the current 'items' state belongs to.
  // This prevents the save effect from overwriting a new user's data with the old user's items
  // before the load effect has finished.
  const lastLoadedKeyRef = useRef<string | null>(null);
  const [items, setItems] = useState<Perfume[]>([]);

  // Load items when the user (and thus storageKey) changes
  useEffect(() => {
    const loadedItems = readWishlistFromStorage(storageKey);
    setItems(loadedItems);
    lastLoadedKeyRef.current = storageKey;
  }, [storageKey]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    // Only save if the items in state are actually for the current storageKey
    if (storageKey && lastLoadedKeyRef.current === storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey]);

  const value = useMemo<WishlistContextValue>(() => {
    const isFavorite = (productId: string) => items.some((item) => item.id === productId);

    const toggleFavorite = (product: Perfume) => {
      setItems((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        if (exists) {
          toast.info(`${product.name} removed from favorites`);
          return prev.filter((item) => item.id !== product.id);
        }
        toast.success(`${product.name} added to favorites`);
        return [product, ...prev];
      });
    };

    const removeFavorite = (productId: string) => {
      const product = items.find(i => i.id === productId);
      if (product) {
        toast.info(`${product.name} removed from favorites`);
      }
      setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearFavorites = () => {
      if (items.length > 0) {
        setItems([]);
        toast.info('Favorites cleared');
      }
    };

    return {
      items,
      count: items.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}
