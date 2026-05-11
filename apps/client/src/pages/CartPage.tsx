import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/cart';
import { cn, formatPrice, calculateShipping } from '@/lib/utils';

export function CartPage() {
  const { t, i18n } = useTranslation();
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    discountAmount: globalDiscount,
    appliedPromo,
    setDiscount,
    validateAndApplyPromo,
  } = useCart();

  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      setPromoError(t('cart.enterPromo'));
      setPromoSuccess(null);
      return;
    }

    if (appliedPromo) {
      return;
    }

    setPromoError(null);
    setPromoSuccess(null);

    const result = await validateAndApplyPromo(code);

    if (result.success) {
      setPromoSuccess(result.message || 'Promo code applied successfully!');
      setPromoInput('');
    } else {
      setPromoError(result.message || t('cart.invalidPromo'));
    }
  };

  const handleRemovePromo = () => {
    setDiscount(0, null);
    setPromoSuccess(null);
    setPromoError(null);
    setPromoInput('');
  };

  const shippingFee = calculateShipping(totalPrice);
  const finalTotal = Math.max(0, totalPrice - globalDiscount + shippingFee);

  const isRtl = i18n.language === 'ar';

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {t('cart.bagEmpty')}
        </h2>

        <p className="mt-2 max-w-xs text-muted-foreground">
          {t('cart.bagEmptyDesc')}
        </p>

        <Button
          asChild
          className="mt-8 h-12 rounded-full bg-zinc-900 px-8 font-bold text-white shadow-lg transition-all hover:bg-rose-600"
          size="lg"
        >
          <Link to="/">{t('cart.startShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] animate-in fade-in px-4 py-8 duration-500 sm:px-6 lg:px-12 lg:py-12">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600">
            Royal Selection
          </p>
          <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white">
            {t('cart.shoppingBag')}
          </h1>
          <div className="flex items-center gap-2">
             <div className="h-1 w-8 bg-zinc-900 dark:bg-white rounded-full" />
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
               {totalItems} {totalItems === 1 ? t('cart.inCollection') : t('cart.inCollectionPlural')}
             </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-fit h-12 px-6 rounded-2xl border border-zinc-100 bg-white font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all dark:bg-zinc-900 dark:border-zinc-800"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className={cn('h-4 w-4 ltr:mr-2 rtl:ml-2', isRtl && 'rotate-180')} />
          {t('cart.continueSelection')}
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <div className="space-y-4 sm:space-y-6">
            {items.map((item) => {
              const isAtMaxStock = item.quantity >= item.selectedSize.stock;

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize.sizeMl}`}
                  className="group relative flex flex-col sm:flex-row gap-6 rounded-[32px] border border-zinc-100 bg-white p-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Link
                    to={`/store/${item.product.id}`}
                    className="aspect-square w-full sm:h-32 sm:w-32 lg:h-40 lg:w-40 shrink-0 overflow-hidden rounded-[24px] border border-zinc-50 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
                          {item.product.brand}
                        </p>

                        <Link
                          to={`/store/${item.product.id}`}
                          className="text-lg sm:text-2xl font-black text-zinc-900 transition-colors hover:text-rose-600 tracking-tight dark:text-white"
                        >
                          {item.product.name}
                        </Link>

                        <div className="flex items-center gap-3">
                          {item.product.type === 'perfume' && (
                            <p className="inline-flex rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800">
                              {item.selectedSize.sizeMl}ml
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id, item.selectedSize.sizeMl)}
                        className="p-3 rounded-2xl bg-zinc-50 text-zinc-300 transition-all hover:text-rose-600 hover:bg-rose-50 dark:bg-zinc-800 dark:text-zinc-600"
                        title={t('cart.remove')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-6 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-0 border-zinc-50 dark:border-zinc-800">
                      <div className="flex h-12 items-center rounded-2xl border border-zinc-100 bg-zinc-50/50 px-2 dark:border-zinc-800 dark:bg-zinc-950/50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedSize.sizeMl, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-900 transition-all hover:bg-white dark:text-white dark:hover:bg-zinc-800 shadow-sm border border-transparent hover:border-zinc-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-12 text-center text-sm font-black text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={isAtMaxStock}
                          onClick={() => updateQuantity(item.product.id, item.selectedSize.sizeMl, item.quantity + 1)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl text-zinc-900 transition-all shadow-sm border border-transparent dark:text-white',
                            isAtMaxStock ? 'cursor-not-allowed opacity-40' : 'hover:bg-white hover:border-zinc-100 dark:hover:bg-zinc-800'
                          )}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="ltr:text-right rtl:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Price</p>
                        <p className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tighter dark:text-white">
                          {formatPrice(item.selectedSize.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-32">
          <div className="rounded-[40px] border border-zinc-100 bg-white p-8 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">
              {t('cart.orderInsight')}
            </h2>

            <div className="mt-10 space-y-5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {t('cart.subtotal')}
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {globalDiscount > 0 && (
                <div className="flex justify-between items-baseline animate-in slide-in-from-right-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
                    {t('cart.promoCode')}
                  </span>
                  <span className="text-sm font-black text-rose-600">
                    -{formatPrice(globalDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {t('cart.delivery')}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full',
                    shippingFee === 0
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                      : 'text-zinc-900 dark:text-white'
                  )}
                >
                  {shippingFee === 0 ? t('common.free') : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="pt-8 border-t border-zinc-50 dark:border-zinc-800">
                <div className="flex justify-between items-end">
                   <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                     {t('common.total')}
                   </span>
                   <span className="text-3xl sm:text-4xl font-black tracking-tighter text-rose-600">
                     {formatPrice(finalTotal)}
                   </span>
                </div>
              </div>
            </div>

            {/* Promo Section */}
            <div className="mt-10 pt-10 border-t border-zinc-50 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {t('cart.promoCode')}
                </Label>

                {appliedPromo && (
                  <button
                    onClick={handleRemovePromo}
                    className="p-1 text-zinc-400 transition-colors hover:text-rose-600"
                    title={t('cart.removePromo')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={t('cart.enterCode')}
                  value={appliedPromo || promoInput}
                  disabled={!!appliedPromo}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className={cn(
                    'h-12 rounded-2xl border-zinc-100 bg-zinc-50 text-[11px] font-black uppercase tracking-widest transition-all focus:ring-rose-500 dark:bg-zinc-800 dark:border-zinc-700',
                    appliedPromo &&
                      'cursor-not-allowed border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50'
                  )}
                />

                <Button
                  onClick={handleApplyPromo}
                  disabled={!!appliedPromo}
                  className={cn(
                    'h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl',
                    appliedPromo
                      ? 'bg-emerald-600 text-white opacity-100'
                      : 'bg-zinc-900 text-white hover:bg-rose-600 dark:bg-white dark:text-zinc-900'
                  )}
                >
                  {appliedPromo ? <CheckCircle2 className="h-4 w-4" /> : t('cart.apply')}
                </Button>
              </div>

              {promoError && (
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  {promoError}
                </p>
              )}
            </div>

            <Button
              className="mt-10 h-16 w-full rounded-[24px] bg-zinc-900 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:bg-rose-600 hover:-translate-y-1 active:scale-95 dark:bg-white dark:text-zinc-900"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              {t('cart.completeOrder')}
            </Button>

            <div className="mt-12 grid gap-6">
              {[
                { icon: ShieldCheck, title: t('cart.encryptedPayments'), desc: t('cart.processedByLeaders') },
                { icon: Truck, title: t('cart.swiftLogistics'), desc: t('cart.arrivalDays') },
                { icon: RotateCcw, title: t('cart.qualityGuarantee'), desc: t('cart.boutiqueExchange') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white transition-all dark:border-zinc-800 dark:bg-zinc-800">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}