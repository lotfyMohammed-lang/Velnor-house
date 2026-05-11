import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  ShoppingBag,
  Package,
  RefreshCcw,
  UserPlus,
  Shield,
  LogOut,
  Search,
  ChevronRight,
  Moon,
  Sun,
  Banknote,
  Tag,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { NotificationCenter } from './NotificationCenter';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import logo from '@/assets/velnor-logo.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/finance', label: 'Finance', icon: Banknote },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/promos', label: 'Promo Codes', icon: Tag },
  { to: '/returns', label: 'Returns', icon: RefreshCcw },
  { to: '/settings', label: 'Communication', icon: Settings },
  { to: '/admins', label: 'Admins', icon: Shield },
  { to: '/register-admin', label: 'Register Admin', icon: UserPlus },
];

type SidebarProps = {
  collapsed: boolean;
  darkMode: boolean;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
};

export function Sidebar({
  collapsed,
  darkMode,
  onToggleCollapse,
  onToggleTheme,
}: SidebarProps) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const filteredNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (collapsed) {
      setSearchQuery('');
    }
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div className="relative flex items-center gap-3 px-4 py-4 shrink-0">
        <img src={logo} alt="Velnor House" className="h-8 w-8 object-contain" />

        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className={`truncate text-sm font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
              Velnor House Admin
            </p>
            <p className={`truncate text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Management Panel
            </p>
          </div>
        )}

        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`absolute -right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-transform hover:scale-105 z-50 ${
              darkMode
                ? 'border-white/10 bg-[#13203c] text-zinc-200'
                : 'border-zinc-200 bg-white text-zinc-700'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-300 ${
                collapsed ? '' : 'rotate-180'
              }`}
            />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              darkMode ? 'text-zinc-400' : 'text-zinc-400'
            }`}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={(collapsed && !isMobile) ? '' : 'Search...'}
            className={`h-11 rounded-xl border pl-9 transition-all ${
              (collapsed && !isMobile) ? 'px-0 text-transparent placeholder:text-transparent' : ''
            } ${
              darkMode
                ? 'border-white/10 bg-white/5 text-white placeholder:text-zinc-400'
                : 'border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400'
            }`}
            readOnly={collapsed && !isMobile}
          />
        </div>
      </div>

      <Separator className={darkMode ? 'bg-white/10' : 'bg-zinc-200'} />

      {/* Navigation Menu - Scrollable */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 px-3 py-4 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={(collapsed && !isMobile) ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                isActive
                  ? darkMode
                    ? 'bg-[#ef1b4f] text-white shadow-lg'
                    : 'bg-zinc-950 text-white shadow-md'
                  : darkMode
                    ? 'text-zinc-300 hover:bg-white/8 hover:text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              } ${(collapsed && !isMobile) ? 'justify-center' : ''}`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Section */}
      <div className="mt-auto px-3 pb-3 shrink-0">
        <Separator className={`mb-3 ${darkMode ? 'bg-white/10' : 'bg-zinc-200'}`} />

        <div className="flex flex-col gap-2">
          {/* Admin Profile Card */}
          {(!collapsed || isMobile) ? (
            <div
              className={`rounded-2xl border p-3 ${
                darkMode
                  ? 'border-white/10 bg-white/5'
                  : 'border-zinc-200 bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-900'
                  }`}
                >
                  {(admin?.name || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {admin?.name || 'Admin'}
                  </p>
                  <p className={`truncate text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {admin?.email}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              title={`${admin?.name} (${admin?.role})`}
              className={`mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl font-bold ${
                darkMode ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-900'
              }`}
            >
              {(admin?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
          )}

          {/* Logout Action */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`h-11 w-full justify-start rounded-xl px-3 text-sm font-medium transition-colors ${
              darkMode
                ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-500'
                : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
            } ${(collapsed && !isMobile) ? 'justify-center px-0' : ''}`}
            title="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!collapsed || isMobile) && <span className="ml-3 font-bold">Logout</span>}
          </Button>
        </div>

        {/* Extra System Actions */}
        <div className="mt-2 space-y-1 pt-2 border-t border-transparent">
          <div className={`flex w-full items-center gap-3 rounded-xl px-3 py-1 ${(collapsed && !isMobile) ? 'justify-center' : ''}`}>
            <NotificationCenter darkMode={darkMode} />
            {(!collapsed || isMobile) && <span className="text-xs font-medium opacity-70">Notifications</span>}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              darkMode
                ? 'bg-white/5 text-zinc-200 hover:bg-white/10'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            } ${(collapsed && !isMobile) ? 'justify-center' : ''}`}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {(!collapsed || isMobile) && <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 ${
        darkMode ? 'bg-[#0b1730] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Velnor House" className="h-8 w-8 object-contain" />
          <span className="font-bold text-sm tracking-tight">Velnor House Admin</span>
        </div>
        
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open administration menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={`p-0 w-[280px] border-none ${
            darkMode ? 'bg-[#0b1730] text-white' : 'bg-white text-zinc-900'
          }`}>
            <SheetHeader className="sr-only">
              <SheetTitle>Administration Sidebar</SheetTitle>
              <SheetDescription>
                Manage products, orders, customers, and store analytics.
              </SheetDescription>
            </SheetHeader>
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex relative h-screen flex-col border-r transition-all duration-300 ${
          collapsed ? 'w-[92px]' : 'w-[280px]'
        } ${
          darkMode
            ? 'border-white/10 bg-[#0b1730] text-white'
            : 'border-zinc-200 bg-white text-zinc-900'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
