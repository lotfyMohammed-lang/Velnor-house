import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
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
  const isAtMaxStock = selectedSize ? quantity >= selectedSize.stock : false;

  const handleIncreaseQuantity = () => {
    if (!selectedSize) return;

    if (quantity >= selectedSize.stock) {
      toast.error('Maximum available stock reached');
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (selectedSize.stock <= 0) {
      toast.error('This size is out of stock');
      return;
    }

    const safeQuantity = Math.min(quantity, selectedSize.stock);
    addItem(product, selectedSize, safeQuantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleRecommendedClick = (perfumeId: string) => {
    navigate(`/store/${perfumeId}`);
  };

  const handleBackToStore = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24 dark:bg-zinc-950 sm:pb-10">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 px-0 py-0 sm:px-6 sm:py-10 lg:px-12">
        <div className="w-full">
          <div className="mb-8 hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="group -ml-2 text-zinc-400 transition-colors hover:text-zinc-900"
              onClick={handleBackToStore}
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('cart.continueSelection')}
            </Button>
          </div>

          <div className="grid items-start gap-0 sm:gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative space-y-4 sm:space-y-6">
              <div className="group relative aspect-[4/5] overflow-hidden border-b border-zinc-100 bg-zinc-50 shadow-inner dark:border-zinc-800 dark:bg-zinc-900 sm:aspect-square sm:rounded-[48px] sm:border">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                <button
                  type="button"
                  onClick={handleBackToStore}
                  className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-xl backdrop-blur-md sm:hidden"
                >
                  <ArrowLeft className="h-5 w-5 text-zinc-900" />
                </button>

                <div className="absolute left-6 top-6 flex flex-col gap-2.5 sm:left-8 sm:top-8">
                  {product.bestseller && (
                    <Badge className="rounded-full bg-amber-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl hover:bg-amber-600 sm:text-xs">
                      {t('store.bestSellers')}
                    </Badge>
                  )}

                  {product.featured && (
                    <Badge className="rounded-full bg-zinc-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl hover:bg-black dark:bg-white dark:text-zinc-900 sm:text-xs">
                      {t('store.featured')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col p-6 sm:p-0">
              <div className="flex-1 space-y-8 sm:space-y-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 sm:text-xs">
                      {product.brand}
                    </p>
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  </div>

                  <h1 className="text-3xl leading-[1.1] font-black tracking-tighter text-zinc-900 dark:text-white sm:text-5xl lg:text-7xl">
                    {product.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Badge
                    variant="outline"
                    className="rounded-full border-zinc-100 bg-zinc-50 px-4 py-1.5 text-[10px] font-black tracking-widest capitalize dark:border-zinc-800 dark:bg-zinc-900 sm:text-xs"
                  >
                    {product.category}
                  </Badge>

                  {selectedSize && selectedSize.stock > 0 ? (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 sm:text-xs">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      </span>
                      {selectedSize.stock} {t('store.inStock')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 sm:text-xs">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      {t('store.outOfStock')}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-[12px] font-black uppercase tracking-widest text-zinc-400 sm:text-sm">
                    {t('store.startingAt')}
                  </span>
                  <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white sm:text-5xl">
                    {selectedSize ? formatPrice(selectedSize.price) : 'N/A'}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 sm:text-xs">
                    {t('store.viewDetails')}
                  </h3>
                  <p className="max-w-xl text-sm leading-[1.8] font-medium text-zinc-500 sm:text-lg">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 sm:text-xs">
                    {t('store.categories')}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map((size) => (
                      <Button
                        key={size.sizeMl}
                        variant="outline"
                        className={cn(
                          'h-12 min-w-20 rounded-2xl border-2 text-xs font-black transition-all sm:h-16 sm:min-w-24 sm:text-sm',
                          selectedSize?.sizeMl === size.sizeMl
                            ? 'scale-105 border-zinc-900 bg-zinc-900 text-white shadow-2xl'
                            : 'border-zinc-100 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
                        )}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size.sizeMl}ml
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="hidden flex-col gap-6 pt-6 sm:flex">
                  <div className="flex items-center gap-6">
                    <div className="flex h-14 items-center rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={handleDecreaseQuantity}
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white dark:hover:bg-zinc-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-12 text-center text-sm font-black text-zinc-900 dark:text-white">
                        {quantity}
                      </span>

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

                    <div className="flex flex-1 gap-3">
                      <Button
                        className="h-14 flex-1 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl dark:bg-white dark:text-zinc-900"
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
                          'h-14 w-14 rounded-2xl border-2 shadow-sm transition-all',
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

                <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
                  {[
                    { icon: Truck, label: t('common.shipping'), value: t('common.free') },
                    { icon: ShieldCheck, label: t('cart.qualityGuarantee'), value: '100% Certified' },
                    { icon: RotateCcw, label: t('common.returns'), value: '14-day Easy' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-[24px] border border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      <item.icon className="h-5 w-5 shrink-0 text-zinc-400" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-400">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <h3 className="mb-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 sm:text-xs">
                    {t('store.discovery')}
                  </h3>

                  <div className="flex flex-wrap gap-2.5">
                    {(product.tags ?? []).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-full border border-zinc-100 bg-zinc-50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
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
            <div className="mt-24 px-6 sm:mt-32 sm:px-0">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white sm:text-4xl">
                  {t('store.royalPicks')}
                </h2>
                <div className="mx-8 hidden h-px flex-1 bg-zinc-100 dark:bg-zinc-800 sm:block" />
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
                      <h3 className="line-clamp-1 text-xs font-black tracking-tight text-zinc-900 dark:text-white sm:text-base">
                        {p.name}
                      </h3>
                      <p className="text-xs font-bold text-zinc-400 sm:text-sm">
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

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-100 bg-white/80 p-4 pb-8 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl bg-zinc-50 p-1 dark:bg-zinc-900">
            <button
              type="button"
              onClick={handleDecreaseQuantity}
              className="flex h-10 w-10 items-center justify-center text-zinc-900 dark:text-white"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-8 text-center text-xs font-black">{quantity}</span>

            <button
              type="button"
              onClick={handleIncreaseQuantity}
              disabled={!selectedSize || selectedSize.stock <= 0 || isAtMaxStock}
              className="flex h-10 w-10 items-center justify-center text-zinc-900 disabled:opacity-30 dark:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            className="h-12 flex-1 rounded-2xl bg-zinc-900 text-[11px] font-black uppercase tracking-widest shadow-2xl dark:bg-white dark:text-zinc-900"
            disabled={!selectedSize || selectedSize.stock <= 0 || addedToCart}
            onClick={handleAddToCart}
          >
            {addedToCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('store.added')}
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t('store.addToCart')}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'h-12 w-12 shrink-0 rounded-2xl border-zinc-100',
              isWishlisted && 'border-rose-100 bg-rose-50 text-rose-500'
            )}
            onClick={() => toggleFavorite(product)}
          >
            <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
          </Button>
        </div>
      </div>
    </div>
  );
}