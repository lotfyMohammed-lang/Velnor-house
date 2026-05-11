import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LogOut,
  Store,
  ShoppingCart,
  User,
  LogIn,
  ChevronDown,
  Search,
  X,
  Sun,
  Moon,
  Heart,
  Package,
  RefreshCcw,
  Menu,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useTheme } from '@/lib/theme';
import { useWishlist } from '@/lib/wishlist';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageToggle } from './LanguageToggle';
import logo from '@/assets/velnor-logo.png';
import { useState } from 'react';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full border border-zinc-200 bg-background shadow-sm hover:bg-accent dark:border-zinc-800 sm:h-11 sm:w-11"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="size-4 text-zinc-700 sm:size-5" />
      ) : (
        <Sun className="size-4 text-zinc-300 sm:size-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function SearchInput({ className, isMobile = false }: { className?: string; isMobile?: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const query = searchParams.get('q') || '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value) {
      navigate(`/?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }

  function handleClear() {
    navigate('/', { replace: true });
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
        <Input
          placeholder={t('common.search')}
          value={query}
          onChange={handleChange}
          className={`${
            isMobile ? 'h-9 text-[11px]' : 'h-10 text-sm sm:h-11'
          } rounded-xl border-zinc-100 bg-zinc-100/50 shadow-none focus-visible:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 ltr:pl-9 ltr:pr-10 rtl:pl-10 rtl:pr-9`}
        />
        {query && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground ltr:right-3 rtl:left-3"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function NavHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: favoritesCount } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRtl = i18n.language === 'ar';

  function handleLogout() {
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  }

  const NavItems = ({ className = "" }: { className?: string }) => (
    <div className={cn("flex flex-col md:flex-row md:items-center gap-1 md:gap-2", className)}>
      <NavLink
        to="/"
        end
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-all md:rounded-full md:px-5 md:py-2 md:text-[11px] lg:text-xs ${
            isActive
              ? 'bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900'
              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800'
          }`
        }
      >
        <Store className="size-4 shrink-0 md:size-3.5" />
        {t('common.store')}
      </NavLink>

      <NavLink
        to="/favorites"
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-all md:rounded-full md:px-5 md:py-2 md:text-[11px] lg:text-xs ${
            isActive
              ? 'bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900'
              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800'
          }`
        }
      >
        <Heart className="size-4 shrink-0 md:size-3.5" />
        <span className="flex-1">{t('common.favorites')}</span>
        {favoritesCount > 0 && (
          <Badge
            variant="secondary"
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-black text-white"
          >
            {favoritesCount}
          </Badge>
        )}
      </NavLink>

      <NavLink
        to="/cart"
        onClick={() => setIsMobileMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-all md:rounded-full md:px-5 md:py-2 md:text-[11px] lg:text-xs ${
            isActive
              ? 'bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900'
              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800'
          }`
        }
      >
        <ShoppingCart className="size-4 shrink-0 md:size-3.5" />
        <span className="flex-1">{t('common.cart')}</span>
        {totalItems > 0 && (
          <Badge
            variant="secondary"
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-black text-white dark:bg-white dark:text-zinc-900"
          >
            {totalItems}
          </Badge>
        )}
      </NavLink>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 sm:h-18 lg:px-12">
        {/* Left Side: Logo (Desktop) / Menu (Mobile) */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full bg-zinc-50 dark:bg-zinc-900" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side={isRtl ? 'right' : 'left'} className="w-[300px] border-none p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access Velnor House store collections, favorites, and account settings.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex h-full flex-col bg-background dark:bg-zinc-950">
                  <div className="border-b border-zinc-100 p-8 dark:border-zinc-900">
                    <div className="flex items-center gap-4">
                      <img src={logo} alt="Velnor House" className="h-12 w-12" />
                      <div className="flex flex-col leading-none">
                        <span className="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-white">VELNOR</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                          House
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    <div>
                      <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Collections
                      </p>
                      <NavItems />
                    </div>

                    <Separator className="opacity-50" />

                    <div>
                      <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Preferences
                      </p>
                      <div className="flex flex-col gap-3 px-2">
                        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                           <span className="text-xs font-black uppercase tracking-widest text-zinc-600">Appearance</span>
                           <ThemeToggle />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                           <span className="text-xs font-black uppercase tracking-widest text-zinc-600">Language</span>
                           <LanguageToggle />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-900 dark:bg-zinc-900/40">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="mb-6 flex items-center gap-4 px-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black uppercase text-white shadow-xl">
                            {(user?.username || 'U').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black uppercase tracking-tight">{user?.username}</p>
                            <p className="truncate text-[10px] font-bold text-zinc-400">{user?.email}</p>
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-zinc-800"
                        >
                          <User className="size-4" />
                          {t('common.profile')}
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-zinc-800"
                        >
                          <Package className="size-4" />
                          {t('common.myOrders')}
                        </Link>

                        <button
                          onClick={handleLogout}
                          type="button"
                          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="size-4" />
                          {t('common.signOut')}
                        </button>
                      </div>
                    ) : (
                      <Button
                        asChild
                        className="h-14 w-full rounded-2xl bg-zinc-900 text-xs font-black uppercase tracking-widest shadow-2xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/login">
                          <LogIn className="mr-2 size-4" />
                          {t('common.signIn')}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
            <img src={logo} alt="Velnor House" className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black italic tracking-tighter text-zinc-900 dark:text-white sm:text-xl">VELNOR</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 sm:text-[10px]">
                House
              </span>
            </div>
          </Link>

          <Separator orientation="vertical" className="mx-2 hidden h-8 opacity-20 md:block lg:mx-4" />

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <NavItems />
          </nav>
        </div>

        {/* Center: Search (Laptop+) */}
        <div className="mx-8 hidden max-w-lg flex-1 lg:block">
          <SearchInput className="w-full" />
        </div>

        {/* Right Side: Icons / User */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          <div className="hidden items-center gap-2 lg:flex">
             <LanguageToggle />
             <ThemeToggle />
          </div>

          <Separator orientation="vertical" className="mx-1 hidden h-6 opacity-20 lg:block" />

          {/* Cart Icon (Always visible on Mobile/Tablet, integrated in nav on Desktop) */}
          <div className="md:hidden lg:hidden">
             <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 transition-all active:scale-90 dark:bg-zinc-900">
                <ShoppingCart className="size-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[9px] font-black text-white shadow-lg dark:bg-white dark:text-zinc-900">
                    {totalItems}
                  </span>
                )}
             </Link>
          </div>

          {/* User Section (Laptop+) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-full border border-zinc-100 bg-zinc-50 px-3 shadow-sm transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-black text-white shadow-md dark:bg-white dark:text-zinc-900">
                      {(user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate text-[10px] font-black uppercase tracking-widest">
                      {user?.username}
                    </span>
                    <ChevronDown className="ml-1.5 size-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 rounded-[24px] border border-zinc-100 p-2 shadow-2xl dark:border-zinc-800">
                  <DropdownMenuLabel className="flex flex-col gap-1 px-4 py-4">
                    <span className="truncate text-sm font-black uppercase tracking-tight">{user?.username}</span>
                    <span className="truncate text-[10px] font-bold text-zinc-400">{user?.email}</span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="opacity-50" />

                  <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-zinc-50 dark:focus:bg-zinc-800">
                    <Link to="/profile" className="flex cursor-pointer items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <User className="size-4" />
                      {t('common.profile')}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-zinc-50 dark:focus:bg-zinc-800">
                    <Link to="/orders" className="flex cursor-pointer items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <Package className="size-4" />
                      {t('common.myOrders')}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-zinc-50 dark:focus:bg-zinc-800">
                    <Link to="/returns" className="flex cursor-pointer items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <RefreshCcw className="size-4" />
                      {t('common.returns')}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="opacity-50" />

                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                    <LogOut className="mr-3 size-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{t('common.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-zinc-900 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-900 hover:text-white"
              >
                <Link to="/login">
                  <LogIn className="mr-2 size-3.5" />
                  {t('common.signIn')}
                </Link>
              </Button>
            )}
          </div>

          {/* User Icon (Mobile/Tablet only) */}
          <div className="md:hidden">
            {isAuthenticated ? (
               <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-black text-white shadow-lg active:scale-90 dark:bg-white dark:text-zinc-900">
                  {(user?.username || 'U').charAt(0)}
               </Link>
            ) : (
               <Link to="/login" className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-900 active:scale-90 dark:bg-zinc-900 dark:text-white">
                  <User className="size-5" />
               </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Search Bar (Visible below header) */}
      <div className="border-t border-zinc-100 bg-white/80 px-4 py-2.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
        <SearchInput isMobile={true} className="mx-auto max-w-2xl w-full" />
      </div>
    </header>
  );
}