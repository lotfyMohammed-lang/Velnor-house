import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LogOut, Store, ShoppingCart, User, LogIn } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleLogout() {
    logout();
    queryClient.clear();
    navigate('/', { replace: true });
  }

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold tracking-tight">VELNOR</h1>
        <p className="text-xs text-muted-foreground mt-0.5">House</p>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/50'
            }`
          }
        >
          <Store className="h-4 w-4 shrink-0" />
          Store
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-accent/50'
            }`
          }
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          Cart
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 min-w-5 flex items-center justify-center text-xs px-1.5">
              {totalItems}
            </Badge>
          )}
        </NavLink>
      </nav>

      <Separator />

      <div className="p-3 space-y-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user?.username || 'User'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-accent/50'
                }`
              }
            >
              <User className="h-4 w-4 shrink-0" />
              Profile
            </NavLink>
          </>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        )}
      </div>
    </aside>
  );
}
