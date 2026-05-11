import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Perfume, PerfumeSize } from '@/api/perfumes.api';
import { formatPrice, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';

interface ProductCardProps {
  product: Perfume;
  onAddToCart: (product: Perfume, size: PerfumeSize) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();
  const isRtl = i18n.language === 'ar';

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

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const size = getStartingSize();
    if (size) {
      onAddToCart(product, size);
      navigate('/checkout');
    }
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-[24px] sm:rounded-[40px] border border-zinc-100 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 active:scale-[0.98] h-full flex flex-col dark:border-zinc-800 dark:bg-zinc-900"
      onClick={() => navigate(`/store/${product.id}`)}
    >
      {/* Image Area - Premium Presentation */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50 shrink-0 dark:bg-zinc-950">
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

        {/* Favorite Button - Top Edge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-3 z-10 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/80 shadow-xl backdrop-blur-md transition-all hover:bg-white hover:scale-110 ltr:right-3 rtl:left-3 dark:bg-zinc-900/80"
        >
          <Heart
            className={cn(
              "size-4 sm:size-5 transition-colors",
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-zinc-400"
            )}
          />
        </button>

        {/* Status Badges - Bottom Edge */}
        <div className="absolute bottom-3 flex flex-wrap gap-1.5 ltr:left-3 rtl:right-3">
          {product.bestseller && (
            <div className="rounded-lg bg-amber-500 text-white px-2.5 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg">
              {t('store.featured')}
            </div>
          )}
          {product.featured && (
            <div className="rounded-lg bg-zinc-900 text-white px-2.5 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg dark:bg-white dark:text-zinc-900">
              {t('store.royalPicks')}
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock() && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-zinc-900/40">
            <span className="rounded-2xl bg-zinc-900 px-5 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-2xl">
              {t('store.outOfStock')}
            </span>
          </div>
        )}

        {/* Quick Add Overlay (Desktop Only) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full p-4 transition-transform duration-500 group-hover:translate-y-0 hidden lg:block">
           <Button
             className="w-full h-12 rounded-2xl bg-zinc-900/90 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md hover:bg-zinc-900 dark:bg-white/90 dark:text-zinc-900 dark:hover:bg-white shadow-2xl"
             onClick={handleAddToCart}
             disabled={isOutOfStock()}
           >
             <ShoppingCart className="size-4 mr-2" />
             {t('store.addToCart')}
           </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between gap-3 sm:gap-6">
        <div className="space-y-1 sm:space-y-2.5">
          <div className="flex items-center justify-between">
             <p className="text-[8px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-rose-600 truncate">
               {product.brand}
             </p>
          </div>

          <h3 className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white">
            {product.name}
          </h3>

          <p className="line-clamp-1 text-[9px] sm:text-xs leading-relaxed text-zinc-400 font-bold uppercase tracking-widest hidden xs:block">
            {t(`store.${product.category}s` || product.category)}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="space-y-3 sm:space-y-5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
               <span className="text-[10px] sm:text-sm font-black text-zinc-400 uppercase">EGP</span>
               <span className="text-sm sm:text-3xl font-black tracking-tighter text-zinc-900 leading-none dark:text-white">
                 {formatPrice(getStartingPrice()).replace('EGP', '').trim()}
               </span>
            </div>
          </div>

          {/* Mobile/Tablet Actions */}
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <button
              className="h-10 sm:h-14 rounded-xl sm:rounded-2xl border border-zinc-100 bg-zinc-50 flex items-center justify-center text-zinc-900 transition-all active:scale-90 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white shadow-sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock()}
            >
              <ShoppingCart className="size-4 sm:size-5" />
            </button>

            <button
              className="h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-zinc-900 flex items-center justify-center text-white transition-all active:scale-90 shadow-lg disabled:opacity-30 font-black text-[9px] sm:text-[11px] uppercase tracking-widest dark:bg-white dark:text-zinc-900"
              onClick={handleBuyNow}
              disabled={isOutOfStock()}
            >
              {t('store.buyNow')}
            </button>
          </div>

          {/* Desktop Actions (More subtle since Quick Add exists) */}
          <div className="hidden lg:flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800">
             <button
               onClick={handleBuyNow}
               disabled={isOutOfStock()}
               className="text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:text-rose-600 transition-colors flex items-center gap-2 dark:text-white"
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
