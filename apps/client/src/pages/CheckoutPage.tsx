import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  Loader2,
  Lock,
  Wallet,
  Plus,
  Home,
  Briefcase,
  CheckCircle2,
  MapPin,
  Building2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EGYPT_ADDRESS_DATA } from '@/data/egypt-addresses';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { createOrder } from '@/api/orders.api';
import { getProfile } from '@/api/profile.api';
import { getMyAddresses } from '@/api/addresses.api';
import type { UserAddress } from '@/api/addresses.api';
import { cn, formatPrice, calculateShipping } from '@/lib/utils';
import { toast } from 'sonner';

const EGYPT_LOCATIONS = EGYPT_ADDRESS_DATA;

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { items, totalPrice, clearCart, discountAmount, appliedPromo } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [, setIsAddressesLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savedAddresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');

  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    governorate: '',
    city: '',
    area: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    floor: '',
    landmark: '',
    deliveryNotes: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const data = await getMyAddresses();
      setAddresses(data);

      if (data.length > 0) {
        const defaultAddr = data.find((a) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
        setShowNewAddressForm(false);
      } else {
        setSelectedAddressId(null);
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsAddressesLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const subtotal = totalPrice;
  const shippingCost = calculateShipping(subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError(t('cart.bagEmpty'));
      return;
    }

    if (!formData.phone) {
      setError(t('checkout.fillRequired'));
      return;
    }

    const selectedAddress = savedAddresses.find((addr) => addr.id === selectedAddressId);

    const addressData = showNewAddressForm
      ? {
          governorate: formData.governorate,
          city: formData.city,
          area: formData.area,
          street: formData.street,
          buildingNumber: formData.buildingNumber,
          apartmentNumber: formData.apartmentNumber || undefined,
          floor: formData.floor || undefined,
          landmark: formData.landmark || undefined,
          deliveryNotes: formData.deliveryNotes || undefined,
        }
      : {
          governorate: selectedAddress?.governorate || '',
          city: selectedAddress?.city || '',
          area: selectedAddress?.area || '',
          street: selectedAddress?.street || '',
          buildingNumber: selectedAddress?.buildingNumber || '',
          apartmentNumber: selectedAddress?.apartmentNumber || undefined,
          floor: selectedAddress?.floor || undefined,
          landmark: selectedAddress?.landmark || undefined,
          deliveryNotes: selectedAddress?.deliveryNotes || undefined,
        };

    const requiredFields = ['governorate', 'city', 'area', 'street', 'buildingNumber'];
    const missingFields = requiredFields.filter(
      (field) => !addressData[field as keyof typeof addressData]
    );

    if (missingFields.length > 0) {
      if (!showNewAddressForm) {
        setError('Selected saved address is incomplete. Please add a new complete address.');
      } else {
        setError(t('checkout.fillRequired'));
      }
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        ...addressData,
        paymentMethod,
        totalPrice: finalTotal,
        appliedPromoCode: appliedPromo || undefined,
        discountAmount: discountAmount || 0,
        saveAddress: showNewAddressForm && saveAddress,
        addressLabel,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: Number(item.selectedSize.price),
          sizeMl: item.product.type === 'perfume' ? item.selectedSize.sizeMl : 0,
          productType: item.product.type,
          quantity: item.quantity,
          image: item.product.imageUrl,
        })),
      };

      const result = await createOrder(payload as any);

      try {
        const updatedProfile = await getProfile();
        if (setUser && user) {
          setUser({
            ...user,
            phone: updatedProfile.phone,
          });
        }
      } catch (profileErr) {
        console.error('Failed to sync profile after order:', profileErr);
      }

      clearCart();
      toast.success(t('checkout.orderSuccess'));
      navigate(`/order-success?id=${result.orderId}`);
    } catch (err: any) {
      const errorMsg = err.message || t('checkout.failedOrder');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddressSelect = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
  };

  const isRtl = i18n.language === 'ar';

  const selectedGov = EGYPT_LOCATIONS.find((g: any) => g.nameEn === formData.governorate);
  const selectedCityObj = selectedGov?.cities?.find((c: any) => c.nameEn === formData.city);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold">{t('cart.bagEmpty')}</h2>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/">{t('cart.startShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in px-4 py-8 duration-500 sm:px-6">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground ltr:-ml-2 rtl:-mr-2"
          onClick={() => navigate('/cart')}
        >
          <ArrowLeft
            className={cn('h-4 w-4 ltr:mr-2 rtl:ml-2', isRtl && 'rotate-180')}
          />
          {t('checkout.backToBag')}
        </Button>

        <h1 className="text-3xl font-black uppercase italic tracking-tight text-zinc-900">
          {t('checkout.checkout')}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight sm:text-lg">
                <ShieldCheck className="h-5 w-5 text-zinc-900" />
                {t('checkout.personalInfo')}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t('checkout.fullName')}
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-zinc-100 bg-zinc-50 sm:h-12 sm:rounded-2xl"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t('checkout.emailAddress')}
                  </Label>
                  <Input
                    type="email"
                    className="h-11 rounded-xl border-zinc-100 bg-zinc-50 sm:h-12 sm:rounded-2xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t('checkout.phoneNumber')}
                  </Label>
                  <Input
                 type="tel"
                  inputMode="numeric"
                     pattern="[0-9]*"
                       maxLength={11}
                           className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-zinc-100 bg-zinc-50"
                       value={formData.phone}
                     onChange={(e) =>
                            setFormData({
                      ...formData,
                        phone: e.target.value.replace(/\D/g, '').slice(0, 11),
                     })
                 }
                          placeholder="01xxxxxxxxx"
                      required
            />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 sm:space-y-6 sm:pt-4">
              <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight sm:text-lg">
                <Truck className="h-5 w-5 text-zinc-900" />
                {t('checkout.shippingInfo')}
              </h3>

              {savedAddresses.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr)}
                      className={cn(
                        'group relative cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md sm:rounded-2xl',
                        selectedAddressId === addr.id && !showNewAddressForm
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-100 bg-white hover:border-zinc-200'
                      )}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        {addr.label.toLowerCase() === 'home' ? (
                          <Home
                            className={cn(
                              'h-4 w-4',
                              selectedAddressId === addr.id && !showNewAddressForm
                                ? 'text-amber-400'
                                : 'text-zinc-400'
                            )}
                          />
                        ) : (
                          <Briefcase
                            className={cn(
                              'h-4 w-4',
                              selectedAddressId === addr.id && !showNewAddressForm
                                ? 'text-amber-400'
                                : 'text-zinc-400'
                            )}
                          />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest sm:text-xs">
                          {addr.label}
                        </span>
                        {selectedAddressId === addr.id && !showNewAddressForm && (
                          <CheckCircle2 className="ml-auto h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <p
                        className={cn(
                          'line-clamp-2 text-[10px] leading-relaxed sm:text-[11px]',
                          selectedAddressId === addr.id && !showNewAddressForm
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        )}
                      >
                        {addr.fullAddress}
                      </p>
                    </div>
                  ))}

                  <div
                    onClick={handleAddNewAddress}
                    className={cn(
                      'group relative cursor-pointer rounded-xl border border-dashed transition-all hover:bg-zinc-50 sm:rounded-2xl',
                      showNewAddressForm ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 bg-white'
                    )}
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-2 py-4 sm:py-6">
                      <Plus className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 sm:text-[10px]">
                        {isRtl ? 'إضافة عنوان جديد' : 'New Address'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showNewAddressForm && (
                <div className="animate-in slide-in-from-top-2 space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 duration-300 sm:space-y-6 sm:rounded-[32px] sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'تسمية العنوان' : 'Address Label'}
                      </Label>
                      <Input
                        className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        placeholder="Home / Work"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'المحافظة' : 'Governorate'} *
                      </Label>
                      <Select
                        value={formData.governorate}
                        onValueChange={(val) =>
                          setFormData({ ...formData, governorate: val, city: '', area: '' })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl">
                          <SelectValue placeholder={isRtl ? 'اختر المحافظة' : 'Select Governorate'} />
                        </SelectTrigger>
                        <SelectContent>
                          {EGYPT_LOCATIONS.map((gov: any) => (
                            <SelectItem key={gov.id} value={gov.nameEn}>
                              {isRtl ? gov.nameAr : gov.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'المدينة' : 'City'} *
                      </Label>
                      <Select
                        disabled={!formData.governorate}
                        value={formData.city}
                        onValueChange={(val) => setFormData({ ...formData, city: val, area: '' })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl">
                          <SelectValue placeholder={isRtl ? 'اختر المدينة' : 'Select City'} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGov?.cities?.map((city: any) => (
                            <SelectItem key={city.id} value={city.nameEn}>
                              {isRtl ? city.nameAr : city.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'المنطقة' : 'Area'} *
                      </Label>
                      <Select
                        disabled={!formData.city}
                        value={formData.area}
                        onValueChange={(val) => setFormData({ ...formData, area: val })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl">
                          <SelectValue placeholder={isRtl ? 'اختر المنطقة' : 'Select Area'} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCityObj?.areas?.map((area: any) => (
                            <SelectItem key={area.id} value={area.nameEn}>
                              {isRtl ? area.nameAr : area.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'اسم الشارع' : 'Street Name'} *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          className="h-11 rounded-xl border-zinc-100 bg-white pl-11 sm:h-12 sm:rounded-2xl"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'رقم المبنى' : 'Building No.'} *
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          className="h-11 rounded-xl border-zinc-100 bg-white pl-11 sm:h-12 sm:rounded-2xl"
                          value={formData.buildingNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, buildingNumber: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {isRtl ? 'الطابق' : 'Floor'}
                        </Label>
                        <Input
                          className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl"
                          value={formData.floor}
                          onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {isRtl ? 'رقم الشقة' : 'Apt No.'}
                        </Label>
                        <Input
                          className="h-11 rounded-xl border-zinc-100 bg-white sm:h-12 sm:rounded-2xl"
                          value={formData.apartmentNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, apartmentNumber: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'علامة مميزة' : 'Landmark'}
                      </Label>
                      <div className="relative">
                        <Navigation className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          className="h-11 rounded-xl border-zinc-100 bg-white pl-11 sm:h-12 sm:rounded-2xl"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder={isRtl ? 'مثلاً: بجوار صيدلية كذا' : 'e.g. Near ABC Pharmacy'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {isRtl ? 'ملاحظات التوصيل' : 'Delivery Notes'}
                      </Label>
                      <Textarea
                        className="min-h-[80px] resize-none rounded-xl border-zinc-100 bg-white sm:min-h-[100px] sm:rounded-2xl"
                        value={formData.deliveryNotes}
                        onChange={(e) =>
                          setFormData({ ...formData, deliveryNotes: e.target.value })
                        }
                        placeholder={
                          isRtl
                            ? 'أي تعليمات إضافية للمندوب...'
                            : 'Any extra instructions for the courier...'
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 rtl:space-x-reverse">
                    <Checkbox
                      id="save-address"
                      checked={saveAddress}
                      onCheckedChange={(checked) => setSaveAddress(Boolean(checked))}
                    />
                    <label
                      htmlFor="save-address"
                      className="cursor-pointer text-[10px] leading-none font-bold text-zinc-600 sm:text-xs"
                    >
                      {isRtl
                        ? 'حفظ هذا العنوان للطلبات القادمة'
                        : 'Save this address for future orders'}
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2 sm:space-y-6 sm:pt-4">
              <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight sm:text-lg">
                <CreditCard className="h-5 w-5 text-zinc-900" />
                {t('checkout.paymentMethod')}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4 transition-all sm:rounded-2xl sm:p-5',
                    paymentMethod === 'card'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                      : 'border-zinc-100 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        paymentMethod === 'card' ? 'text-amber-400' : 'text-zinc-400'
                      )}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider sm:text-sm">
                      {t('checkout.creditCard')}
                    </span>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4 transition-all sm:rounded-2xl sm:p-5',
                    paymentMethod === 'cash'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                      : 'border-zinc-100 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wallet
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        paymentMethod === 'cash' ? 'text-amber-400' : 'text-zinc-400'
                      )}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider sm:text-sm">
                      {t('checkout.cashOnDelivery')}
                    </span>
                  </div>
                  {paymentMethod === 'cash' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive sm:rounded-2xl sm:px-6 sm:py-4">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-rose-600 active:scale-[0.98] sm:h-14 sm:rounded-2xl sm:text-xs"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2 sm:h-5 sm:w-5" />
                  {t('checkout.placingOrder')}
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 text-amber-400 ltr:mr-2 rtl:ml-2 sm:h-4 sm:w-4" />
                  {t('checkout.completeCheckout')}
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.05)] sm:rounded-[32px] sm:p-8">
            <h3 className="mb-6 text-base font-black uppercase italic tracking-tight text-foreground sm:mb-8 sm:text-lg">
              {t('checkout.orderSummary')}
            </h3>

            <div className="custom-scrollbar mb-6 max-h-[30vh] space-y-4 overflow-y-auto ltr:pr-2 rtl:pl-2 sm:mb-8 sm:max-h-[35vh] sm:space-y-5">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize.sizeMl}`} className="group flex gap-3 sm:gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 sm:h-20 sm:w-20 sm:rounded-2xl">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-0.5 sm:gap-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 sm:text-[10px]">
                      {item.product.brand}
                    </p>
                    <h4 className="line-clamp-1 text-xs font-bold text-foreground sm:text-sm">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] font-medium text-zinc-400 sm:text-[11px]">
                      {item.product.type === 'perfume' ? `${item.selectedSize.sizeMl}ml • ` : ''}
                      {item.quantity} {t('checkout.units')}
                    </p>
                    <p className="mt-0.5 text-xs font-black text-foreground sm:mt-1 sm:text-sm">
                      {formatPrice(Number(item.selectedSize.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6 bg-zinc-50 sm:my-8" />

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 sm:text-[11px]">
                  {t('cart.subtotal')}
                </span>
                <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 sm:text-[11px]">
                    {t('cart.promoCode')} ({appliedPromo})
                  </span>
                  <span className="font-bold text-rose-600">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 sm:text-[11px]">
                  {t('cart.delivery')}
                </span>
                <span className={cn('font-bold', shippingCost === 0 ? 'text-emerald-600' : 'text-foreground')}>
                  {shippingCost === 0 ? t('common.free') : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-zinc-50 pt-4 sm:pt-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 sm:text-xs">
                  {t('common.total')}
                </span>
                <span className="text-2xl leading-none font-black tracking-tighter text-zinc-900 sm:text-3xl">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-3 border-t border-zinc-50 pt-6 sm:mt-10 sm:gap-4 sm:pt-8">
              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 text-emerald-600 sm:h-8 sm:w-8 sm:rounded-xl">
                  <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span>{t('checkout.secureSSL')}</span>
              </div>

              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 text-zinc-900 sm:h-8 sm:w-8 sm:rounded-xl">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span>{t('checkout.dispatchedCairo')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}