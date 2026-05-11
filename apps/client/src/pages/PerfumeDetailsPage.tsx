import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePerfume, usePerfumes } from '@/hooks/usePerfumes';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist';
import { formatPrice, cn } from '@/lib/utils';
import type { PerfumeSize } from '@/api/perfumes.api';
import { toast } from 'sonner';

export function PerfumeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = usePerfume(id ?? '');
  const { data: allPerfumes } = usePerfumes();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<PerfumeSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Ensure page starts at top when product opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    if (!selectedSize) return;

    const maxStock = Math.max(selectedSize.stock, 1);
    setQuantity((prev) => Math.min(prev, maxStock));
  }, [selectedSize]);

  const recommendedPerfumes = useMemo(() => {
    return (allPerfumes || [])
      .filter((p) => p.id !== product?.id && p.category === product?.category)
      .slice(0, 4);
  }, [allPerfumes, product]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Perfume Not Found</h2>
          <p className="mt-2 max-w-xs text-muted-foreground">
            We couldn&apos;t find the perfume you&apos;re looking for. It might be out of stock or no longer available.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = isFavorite(product.id);
  const maxStock = selectedSize?.stock ?? 0;
  const isAtMaxStock = selectedSize ? quantity >= selectedSize.stock : false;

  const handleIncreaseQuantity = () => {
    if (!selectedSize) return;

    if (quantity >= selectedSize.stock) {
      toast.error('Maximum available stock reached');
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (selectedSize) {
      if (selectedSize.stock <= 0) {
        toast.error('This size is out of stock');
        return;
      }

      const safeQuantity = Math.min(quantity, selectedSize.stock);
      addItem(product, selectedSize, safeQuantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleRecommendedClick = (perfumeId: string) => {
    navigate(`/store/${perfumeId}`);
  };

  const handleBackToStore = () => {
    // If we have history (the user came from the Store page), go back to preserve scroll.
    // Otherwise, navigate directly to the root.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 pb-24 sm:pb-10">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 px-0 sm:px-6 lg:px-12 py-0 sm:py-10">
        <div className="w-full">
          {/* Breadcrumbs / Back button - Hidden on mobile, visible from tablet up */}
          <div className="hidden sm:block mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="group -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              onClick={handleBackToStore}
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('cart.continueSelection')}
            </Button>
          </div>

          <div className="grid gap-0 sm:gap-12 lg:gap-20 lg:grid-cols-2 items-start">
            {/* Left: Product Image */}
            <div className="relative space-y-4 sm:space-y-6">
              <div className="group relative aspect-[4/5] sm:aspect-square overflow-hidden sm:rounded-[48px] border-b sm:border border-zinc-100 bg-zinc-50 shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Mobile Back Button */}
                <button 
                  onClick={handleBackToStore}
                  className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-xl sm:hidden"
                >
                  <ArrowLeft className="h-5 w-5 text-zinc-900" />
                </button>

                <div className="absolute left-6 top-6 sm:left-8 sm:top-8 flex flex-col gap-2.5">
                  {product.bestseller && (
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">
                      {t('store.bestSellers')}
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-zinc-900 text-white hover:bg-black text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl dark:bg-white dark:text-zinc-900">
                      {t('store.featured')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col p-6 sm:p-0">
              <div className="flex-1 space-y-8 sm:space-y-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-rose-600">
                      {product.brand}
                    </p>
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white sm:text-5xl lg:text-7xl leading-[1.1]">
                    {product.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="outline" className="capitalize border-zinc-100 bg-zinc-50 text-[10px] sm:text-xs font-black tracking-widest px-4 py-1.5 rounded-full dark:border-zinc-800 dark:bg-zinc-900">
                    {t(`store.${product.category}s` || product.category)}
                  </Badge>

                  {selectedSize && selectedSize.stock > 0 ? (
                    <span className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-600">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      </span>
                      {selectedSize.stock} {t('store.inStock')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      {t('store.outOfStock')}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-[12px] sm:text-sm font-black text-zinc-400 uppercase tracking-widest">{t('store.startingAt')}</span>
                  <span className="text-3xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                    {selectedSize ? formatPrice(selectedSize.price) : 'N/A'}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                    {t('store.viewDetails')}
                  </h3>
                  <p className="text-sm sm:text-lg leading-[1.8] text-zinc-500 font-medium max-w-xl">
                    {product.description}
                  </p>
                </div>

                {/* Size Selector */}
                <div className="space-y-5">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                    {t('store.categories')}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((size) => (
                      <Button
                        key={size.sizeMl}
                        variant="outline"
                        className={cn(
                          'h-12 sm:h-16 min-w-20 sm:min-w-24 border-2 font-black transition-all text-xs sm:text-sm rounded-2xl',
                          selectedSize?.sizeMl === size.sizeMl
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl scale-105'
                            : 'border-zinc-100 bg-white hover:bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900'
                        )}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size.sizeMl}ml
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tablet/Desktop Action Section */}
                <div className="hidden sm:flex flex-col gap-6 pt-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-14 items-center rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-12 text-center text-sm font-black text-zinc-900 dark:text-white">{quantity}</span>

                      <button
                        type="button"
                        onClick={handleIncreaseQuantity}
                        disabled={!selectedSize || selectedSize.stock <= 0 || isAtMaxStock}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                          !selectedSize || selectedSize.stock <= 0 || isAtMaxStock
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-white dark:hover:bg-zinc-800'
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex gap-3 flex-1">
                      <Button
                        className="h-14 flex-1 text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl dark:bg-white dark:text-zinc-900"
                        size="lg"
                        disabled={!selectedSize || selectedSize.stock <= 0 || addedToCart}
                        onClick={handleAddToCart}
                      >
                        {addedToCart ? (
                          <>
                            <Check className="mr-3 h-5 w-5" />
                            {t('store.added')}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-3 h-5 w-5" />
                            {t('store.addToCart')}
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                          'h-14 w-14 rounded-2xl transition-all border-2 shadow-sm',
                          isWishlisted
                            ? 'border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20'
                            : 'border-zinc-100 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
                        )}
                        onClick={() => toggleFavorite(product)}
                      >
                        <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                <div className="grid gap-4 grid-cols-1 xs:grid-cols-3">
                  {[
                    { icon: Truck, label: t('common.shipping'), value: t('common.free') },
                    { icon: ShieldCheck, label: t('cart.qualityGuarantee'), value: '100% Certified' },
                    { icon: RotateCcw, label: t('common.returns'), value: '14-day Easy' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-[24px] border border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <item.icon className="h-5 w-5 text-zinc-400 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{item.label}</p>
                        <p className="text-[9px] font-bold text-zinc-400">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <h3 className="mb-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                    {t('store.discovery')}
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {(product.tags ?? []).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-zinc-50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-100 rounded-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {recommendedPerfumes.length > 0 && (
            <div className="mt-24 sm:mt-32 px-6 sm:px-0">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
                  {t('store.royalPicks')}
                </h2>
                <div className="h-px flex-1 mx-8 bg-zinc-100 hidden sm:block dark:bg-zinc-800" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
                {recommendedPerfumes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="group space-y-4 text-left"
                    onClick={() => handleRecommendedClick(p.id)}
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-50 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>

                    <div className="space-y-1.5 px-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-600">
                        {p.brand}
                      </p>
                      <h3 className="text-xs sm:text-base font-black tracking-tight text-zinc-900 dark:text-white line-clamp-1">{p.name}</h3>
                      <p className="text-xs sm:text-sm font-bold text-zinc-400">
                        {p.sizes?.length
                          ? `${formatPrice(Math.min(...p.sizes.map((s) => s.price)))}`
                          : 'Price on request'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 pb-8 sm:hidden dark:bg-zinc-950/80 dark:border-zinc-800">
         <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-50 rounded-2xl p-1 dark:bg-zinc-900">
               <button
                 onClick={() => setQuantity(q => Math.max(1, q - 1))}
                 className="h-10 w-10 flex items-center justify-center text-zinc-900 dark:text-white"
               >
                 <Minus className="h-4 w-4" />
               </button>
               <span className="w-8 text-center text-xs font-black">{quantity}</span>
               <button
                 onClick={handleIncreaseQuantity}
                 disabled={isAtMaxStock}
                 className="h-10 w-10 flex items-center justify-center text-zinc-900 dark:text-white disabled:opacity-30"
               >
                 <Plus className="h-4 w-4" />
               </button>
            </div>
            
            <Button
              className="flex-1 h-12 rounded-2xl bg-zinc-900 text-[11px] font-black uppercase tracking-widest shadow-2xl dark:bg-white dark:text-zinc-900"
              disabled={!selectedSize || selectedSize.stock <= 0 || addedToCart}
              onClick={handleAddToCart}
            >
              {addedToCart ? <Check className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              {addedToCart ? t('store.added') : t('store.addToCart')}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-2xl border-zinc-100 shrink-0",
                isWishlisted && "bg-rose-50 border-rose-100 text-rose-500"
              )}
              onClick={() => toggleFavorite(product)}
            >
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
            </Button>
         </div>
      </div>
    </div>
  );
}
