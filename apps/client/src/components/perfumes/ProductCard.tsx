import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Perfume, PerfumeSize } from '@/api/perfumes.api';
import { formatPrice, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';

interface ProductCardProps {
  product: Perfume;
  onAddToCart: (product: Perfume, size: PerfumeSize) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();

  const fallbackImage = useMemo(() => {
    const perfumeName = encodeURIComponent(product.name || 'Perfume');
    const brandName = encodeURIComponent(product.brand || 'VELNOR');
    return `https://placehold.co/800x800/f5f5f4/18181b?text=${brandName}%0A${perfumeName}`;
  }, [product.brand, product.name]);

  const [imageSrc, setImageSrc] = useState(product.imageUrl || fallbackImage);

  const isWishlisted = isFavorite(product.id);

  const getStartingPrice = () => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    return Math.min(...product.sizes.map((s) => s.price));
  };

  const getStartingSize = () => {
    if (!product.sizes || product.sizes.length === 0) return null;
    return [...product.sizes].sort((a, b) => a.price - b.price)[0];
  };

  const isOutOfStock = () => {
    if (!product.sizes || product.sizes.length === 0) return true;
    return product.sizes.every((s) => s.stock <= 0);
  };

  const goToProductDetails = () => {
    navigate(`/store/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const size = getStartingSize();
    if (size) {
      onAddToCart(product, size);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToProductDetails();
  };

  return (
    <div
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-[40px]"
      onClick={goToProductDetails}
    >
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== fallbackImage) {
              setImageSrc(fallbackImage);
            }
          }}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-white dark:bg-zinc-900/80 ltr:right-3 rtl:left-3 sm:h-12 sm:w-12"
        >
          <Heart
            className={cn(
              'size-4 transition-colors sm:size-5',
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
            )}
          />
        </button>

        <div className="absolute bottom-3 flex flex-wrap gap-1.5 ltr:left-3 rtl:right-3">
          {product.bestseller && (
            <div className="rounded-lg bg-amber-500 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg sm:text-[10px]">
              {t('store.featured')}
            </div>
          )}

          {product.featured && (
            <div className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg dark:bg-white dark:text-zinc-900 sm:text-[10px]">
              {t('store.royalPicks')}
            </div>
          )}
        </div>

        {isOutOfStock() && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-zinc-900/40">
            <span className="rounded-2xl bg-zinc-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl sm:text-xs">
              {t('store.outOfStock')}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full p-4 transition-transform duration-500 group-hover:translate-y-0 lg:block">
          <Button
            className="h-12 w-full rounded-2xl bg-zinc-900/90 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-md hover:bg-zinc-900 dark:bg-white/90 dark:text-zinc-900 dark:hover:bg-white"
            onClick={handleAddToCart}
            disabled={isOutOfStock()}
          >
            <ShoppingCart className="mr-2 size-4" />
            {t('store.addToCart')}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:gap-6 sm:p-6">
        <div className="space-y-1 sm:space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="truncate text-[8px] font-black uppercase tracking-[0.3em] text-rose-600 sm:text-[11px]">
              {product.brand}
            </p>
          </div>

          <h3 className="line-clamp-1 text-xs font-black leading-tight tracking-tight text-zinc-900 dark:text-white sm:line-clamp-2 sm:text-xl">
            {product.name}
          </h3>

          <p className="hidden line-clamp-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400 xs:block sm:text-xs">
            {product.category}
          </p>
        </div>

        <div className="space-y-3 sm:space-y-5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400 sm:text-sm">
                EGP
              </span>
              <span className="text-sm leading-none font-black tracking-tighter text-zinc-900 dark:text-white sm:text-3xl">
                {formatPrice(getStartingPrice()).replace('EGP', '').trim()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-900 shadow-sm transition-all active:scale-90 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white sm:h-14 sm:rounded-2xl"
              onClick={handleAddToCart}
              disabled={isOutOfStock()}
            >
              <ShoppingCart className="size-4 sm:size-5" />
            </button>

            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-xl bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-90 disabled:opacity-30 dark:bg-white dark:text-zinc-900 sm:h-14 sm:rounded-2xl sm:text-[11px]"
              onClick={handleBuyNow}
              disabled={isOutOfStock()}
            >
              {t('store.buyNow')}
            </button>
          </div>

          <div className="hidden items-center justify-between border-t border-zinc-50 pt-2 dark:border-zinc-800 lg:flex">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 transition-colors hover:text-rose-600 disabled:opacity-30 dark:text-white"
            >
              {t('store.buyNow')}
              <Zap className="size-3 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}