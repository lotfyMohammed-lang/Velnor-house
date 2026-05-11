import { useEffect, useState } from 'react';
import {
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  VenusAndMars,
  ShieldCheck,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Building2,
  Navigation,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import {
  getMyAddresses,
  createAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/api/addresses.api';
import type { UserAddress } from '@/api/addresses.api';
import { EGYPT_ADDRESS_DATA } from '@/data/egypt-addresses';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const countryOptions = [
  'Algeria',
  'Australia',
  'Bahrain',
  'Belgium',
  'Brazil',
  'Canada',
  'China',
  'Egypt',
  'France',
  'Germany',
  'India',
  'Iraq',
  'Italy',
  'Japan',
  'Jordan',
  'Kuwait',
  'Lebanon',
  'Libya',
  'Morocco',
  'Netherlands',
  'Norway',
  'Oman',
  'Palestine',
  'Qatar',
  'Saudi Arabia',
  'South Africa',
  'Spain',
  'Sudan',
  'Sweden',
  'Switzerland',
  'Syria',
  'Tunisia',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Yemen',
];

export function ProfilePage() {
  const { i18n } = useTranslation();
  const { data, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    governorate: '',
    city: '',
    area: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    floor: '',
    landmark: '',
    deliveryNotes: '',
    phone: '',
  });

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (!data) return;

    setUsername(data.username ?? '');
    setEmail(data.email ?? '');
    setPhone(data.phone ?? '');
    setGender(data.gender ? String(data.gender).trim().toLowerCase() : '');
    setBirthDate(data.birthDate ? String(data.birthDate).slice(0, 10) : '');
    setCountry(data.country ?? '');

    fetchAddresses();
  }, [data]);

  async function fetchAddresses() {
    try {
      setIsAddressesLoading(true);
      const addressesData = await getMyAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsAddressesLoading(false);
    }
  }

  const profileInitial = (username || email || 'U').trim().charAt(0).toUpperCase();
  const profileCountry = country || 'Not set';
  const profileGender = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Not set';

  const selectedGovNew = EGYPT_ADDRESS_DATA.find((g) => g.nameEn === newAddress.governorate);
  const selectedCityObjNew = selectedGovNew?.cities.find((c) => c.nameEn === newAddress.city);

  function getLocalizedName(item: { nameEn: string; nameAr?: string }) {
    return isRtl ? item.nameAr || item.nameEn : item.nameEn;
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (phone && !/^01\d{9}$/.test(phone)) {
      newErrors.phone = 'Phone must be 11 digits and start with 01';
    }

    if (gender && !['male', 'female'].includes(gender)) {
      newErrors.gender = 'Gender must be male or female';
    }

    if (birthDate) {
      const today = new Date().toISOString().split('T')[0];
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    setErrors({});

    if (!validateForm()) return;

    try {
      await updateProfile.mutateAsync({
        username: username.trim() || '',
        phone: phone.trim() || '',
        gender: gender ? gender.trim().toLowerCase() : '',
        birthDate: birthDate || '',
        country: country.trim() || '',
      } as any);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};

        error.response.data.errors.forEach((err: any) => {
          const path = String(err.path || '').replace('body.', '');
          backendErrors[path] = err.message;
        });

        setErrors(backendErrors);
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    }
  }

  async function handleAddAddress() {
    if (
      !newAddress.governorate ||
      !newAddress.city ||
      !newAddress.area ||
      !newAddress.street ||
      !newAddress.buildingNumber ||
      !newAddress.phone
    ) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      await createAddress({
        ...newAddress,
        isDefault: addresses.length === 0,
      });

      toast.success('Address added');
      setIsAddAddressOpen(false);
      setNewAddress({
        label: 'Home',
        governorate: '',
        city: '',
        area: '',
        street: '',
        buildingNumber: '',
        apartmentNumber: '',
        floor: '',
        landmark: '',
        deliveryNotes: '',
        phone: '',
      });
      await fetchAddresses();
    } catch {
      toast.error('Failed to add address');
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await deleteAddress(id);
      toast.success('Address removed');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('Failed to remove address');
    }
  }

  async function handleSetDefaultAddress(id: string) {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
      await fetchAddresses();
    } catch {
      toast.error('Failed to update default address');
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center text-sm text-destructive">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-muted-foreground sm:text-xs">
          VELNOR Account
        </p>
        <h1 className="mt-1 text-2xl font-black uppercase italic tracking-tight text-foreground sm:mt-2 sm:text-4xl">
          My Profile
        </h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground sm:mt-2 sm:text-sm">
          Manage your personal information and delivery addresses.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-zinc-100 bg-background/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur sm:rounded-[32px]">
            <CardContent className="p-0">
              <div className="relative overflow-hidden border-b border-zinc-100 bg-[linear-gradient(135deg,rgba(24,24,27,1)_0%,rgba(9,9,11,1)_100%)] px-5 py-8 text-white sm:px-6 sm:py-10">
                <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black shadow-2xl ring-1 ring-white/20 backdrop-blur sm:h-20 sm:w-20 sm:rounded-3xl sm:text-3xl">
                    {profileInitial}
                  </div>
                  <h2 className="mt-4 truncate text-xl font-black leading-none tracking-tight sm:mt-6 sm:text-2xl">
                    {username || 'User'}
                  </h2>
                  <p className="mt-2 truncate text-xs font-medium text-zinc-400 sm:text-sm">{email}</p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-500 sm:mt-6 sm:text-[10px]">
                    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Verified Royalty
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-50/50 p-4 sm:space-y-4 sm:p-6">
                <div className="group rounded-xl border border-zinc-100 bg-white p-3 shadow-sm transition-all hover:shadow-md sm:rounded-2xl sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-zinc-900 group-hover:text-amber-400 sm:h-10 sm:w-10 sm:rounded-xl">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                        Origin
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-zinc-900 sm:text-sm">
                        {profileCountry}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-zinc-100 bg-white p-3 shadow-sm transition-all hover:shadow-md sm:rounded-2xl sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-zinc-900 group-hover:text-amber-400 sm:h-10 sm:w-10 sm:rounded-xl">
                      <VenusAndMars className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                        Gender
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-zinc-900 sm:text-sm">
                        {profileGender}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:rounded-[32px]">
            <CardHeader className="px-5 pt-6 sm:px-8 sm:pt-8">
              <CardTitle className="text-lg font-black uppercase italic tracking-tight sm:text-xl">
                Address Book
              </CardTitle>
              <CardDescription className="text-xs font-medium sm:text-sm">
                Your saved delivery locations for faster checkout.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-5 pb-6 sm:px-8 sm:pb-8">
              {isAddressesLoading ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-12">
                  <MapPin className="mx-auto mb-3 h-8 w-8 text-zinc-200 sm:mb-4 sm:h-10 sm:w-10" />
                  <p className="text-xs font-bold text-zinc-500 sm:text-sm">No saved addresses yet</p>
                  <p className="mt-1 text-[10px] text-zinc-400 sm:text-xs">
                    Add your first address to speed up your future orders.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={cn(
                        'group relative rounded-xl border p-4 transition-all sm:rounded-2xl sm:p-5',
                        addr.isDefault
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl'
                          : 'border-zinc-100 bg-white hover:border-zinc-200'
                      )}
                    >
                      <div className="mb-2 flex items-center gap-3 sm:mb-3">
                        {addr.label.toLowerCase() === 'home' ? (
                          <Home
                            className={cn(
                              'h-3.5 w-3.5 sm:h-4 sm:w-4',
                              addr.isDefault ? 'text-amber-400' : 'text-zinc-400'
                            )}
                          />
                        ) : (
                          <Briefcase
                            className={cn(
                              'h-3.5 w-3.5 sm:h-4 sm:w-4',
                              addr.isDefault ? 'text-amber-400' : 'text-zinc-400'
                            )}
                          />
                        )}
                        <span className="truncate text-[9px] font-black uppercase tracking-[0.2em] sm:text-[10px]">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="ml-auto shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-950 sm:text-[9px]">
                            Default
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          'mb-4 line-clamp-2 text-[10px] font-medium leading-relaxed sm:mb-6',
                          addr.isDefault ? 'text-zinc-300' : 'text-zinc-500'
                        )}
                      >
                        {addr.fullAddress}
                      </p>

                      <div className="flex items-center gap-2 border-t border-zinc-100/10 pt-3 sm:pt-4">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-amber-400 sm:text-[10px]"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className={cn(
                            'ml-auto transition-colors',
                            addr.isDefault
                              ? 'text-zinc-500 hover:text-white'
                              : 'text-zinc-400 hover:text-red-500'
                          )}
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-dashed border-zinc-200 bg-zinc-50 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-100 sm:h-14 sm:rounded-2xl sm:text-xs"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                </DialogTrigger>

                <DialogContent
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className="max-h-[95vh] overflow-y-auto rounded-3xl p-5 sm:max-w-[500px] sm:rounded-[40px] sm:p-8"
                >
                  <DialogHeader className="px-0">
                    <DialogTitle className="text-xl font-black uppercase italic tracking-tight sm:text-2xl">
                      Add Address
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium sm:text-sm">
                      Save a new delivery location for your orders.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 px-0 py-4 sm:gap-5">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Label
                        </Label>
                        <Select
                          value={newAddress.label}
                          onValueChange={(val) => setNewAddress({ ...newAddress, label: val })}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Governorate *
                        </Label>
                        <Select
                          value={newAddress.governorate}
                          onValueChange={(val) =>
                            setNewAddress({ ...newAddress, governorate: val, city: '', area: '' })
                          }
                        >
                          <SelectTrigger className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {EGYPT_ADDRESS_DATA.map((gov) => (
                              <SelectItem key={gov.id} value={gov.nameEn}>
                                {getLocalizedName(gov)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          City *
                        </Label>
                        <Select
                          disabled={!newAddress.governorate}
                          value={newAddress.city}
                          onValueChange={(val) => setNewAddress({ ...newAddress, city: val, area: '' })}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGovNew?.cities.map((city) => (
                              <SelectItem key={city.id} value={city.nameEn}>
                                {getLocalizedName(city)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Area *
                        </Label>
                        <Select
                          disabled={!newAddress.city}
                          value={newAddress.area}
                          onValueChange={(val) => setNewAddress({ ...newAddress, area: val })}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCityObjNew?.areas.map((area) => (
                              <SelectItem key={area.id} value={area.nameEn}>
                                {getLocalizedName(area)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                        Street Name *
                      </Label>
                      <div className="relative">
                        <MapPin
                          className={cn(
                            'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400',
                            isRtl ? 'right-3.5' : 'left-3.5'
                          )}
                        />
                        <Input
                          className={cn(
                            'h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm',
                            isRtl ? 'pr-10' : 'pl-10'
                          )}
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Building No. *
                        </Label>
                        <div className="relative">
                          <Building2
                            className={cn(
                              'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400',
                              isRtl ? 'right-3.5' : 'left-3.5'
                            )}
                          />
                          <Input
                            className={cn(
                              'h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm',
                              isRtl ? 'pr-10' : 'pl-10'
                            )}
                            value={newAddress.buildingNumber}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, buildingNumber: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Phone *
                        </Label>
                        <Input
                          className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              phone: e.target.value.replace(/\D/g, '').slice(0, 11),
                            })
                          }
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Floor
                        </Label>
                        <Input
                          className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm"
                          value={newAddress.floor}
                          onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                          Apartment
                        </Label>
                        <Input
                          className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm"
                          value={newAddress.apartmentNumber}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, apartmentNumber: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]">
                        Landmark
                      </Label>
                      <div className="relative">
                        <Navigation
                          className={cn(
                            'absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400',
                            isRtl ? 'right-3.5' : 'left-3.5'
                          )}
                        />
                        <Input
                          className={cn(
                            'h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm',
                            isRtl ? 'pr-10' : 'pl-10'
                          )}
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex flex-col gap-2 px-0 pb-0">
                    <Button
                      onClick={handleAddAddress}
                      className="h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-rose-600 active:scale-[0.98] sm:h-14 sm:rounded-2xl sm:text-xs"
                    >
                      Save Location
                    </Button>

                    <DialogTrigger asChild>
                      <Button variant="ghost" className="h-10 rounded-xl text-[10px] font-bold uppercase sm:hidden">
                        Cancel
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-zinc-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:rounded-[32px]">
            <CardHeader className="px-5 pt-6 sm:px-8 sm:pt-8">
              <CardTitle className="text-lg font-black uppercase italic tracking-tight sm:text-xl">
                Account Information
              </CardTitle>
              <CardDescription className="text-xs font-medium sm:text-sm">
                Update your personal details securely.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-5 pb-6 sm:space-y-6 sm:px-8 sm:pb-8">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4" />
                    <Input
                      id="username"
                      className="h-10 rounded-xl border-zinc-100 bg-zinc-50 pl-10 font-bold text-xs sm:h-12 sm:rounded-2xl sm:pl-11 sm:text-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  {errors.username && <p className="text-[10px] text-destructive">{errors.username}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Email Identity
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4" />
                    <Input
                      id="email"
                      className="h-10 rounded-xl border-zinc-100 bg-zinc-100/50 pl-10 font-bold text-xs text-zinc-500 sm:h-12 sm:rounded-2xl sm:pl-11 sm:text-sm"
                      value={email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Phone Connection
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4" />
                    <Input
                      id="phone"
                      className="h-10 rounded-xl border-zinc-100 bg-zinc-50 pl-10 font-bold text-xs sm:h-12 sm:rounded-2xl sm:pl-11 sm:text-sm"
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        if (cleaned.length <= 11) {
                          setPhone(cleaned);
                        }
                      }}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Gender
                  </Label>
                  <div className="relative">
                    <VenusAndMars className="absolute left-3.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4" />
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="h-10 w-full rounded-xl border-zinc-100 bg-zinc-50 pl-10 font-bold text-xs sm:h-12 sm:rounded-2xl sm:pl-11 sm:text-sm">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.gender && <p className="text-[10px] text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="birthDate"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Birth Date
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    lang="en"
                    className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs sm:h-12 sm:rounded-2xl sm:text-sm"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.birthDate && <p className="text-[10px] text-destructive">{errors.birthDate}</p>}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 sm:text-[10px]"
                  >
                    Primary Country
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:h-4 sm:w-4" />
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="h-10 w-full rounded-xl border-zinc-100 bg-zinc-50 pl-10 font-bold text-xs sm:h-12 sm:rounded-2xl sm:pl-11 sm:text-sm">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {countryOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-zinc-50 bg-zinc-50/30 px-5 py-5 sm:px-8 sm:py-6">
              <Button
                type="button"
                className="h-11 w-full rounded-xl px-10 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:bg-rose-600 sm:ml-auto sm:h-12 sm:w-auto sm:rounded-2xl sm:text-xs"
                disabled={updateProfile.isPending}
                onClick={handleSubmit}
              >
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}