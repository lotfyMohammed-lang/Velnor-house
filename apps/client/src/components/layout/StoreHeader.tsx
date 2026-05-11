import { Search, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import logo from '@/assets/velnor-logo.png';

interface StoreHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function StoreHeader({ searchQuery = '', onSearchChange }: StoreHeaderProps) {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      navigate(`/?q=${encodeURIComponent(value)}`);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange('');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Velnor House" className="h-9 w-9 object-contain" />
          <div className="flex flex-col leading-none">
            <h1 className="text-lg font-bold tracking-tight text-rose-600">VELNOR</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              House
            </p>
          </div>
        </div>

        <div className="mx-8 hidden max-w-md flex-1 sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search perfumes, brands..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-9 border-zinc-200 pl-9 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-rose-50 hover:text-rose-600"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}