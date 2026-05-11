import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/lib/wishlist';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { ProductCard } from '@/components/perfumes/ProductCard';
import type { Perfume, PerfumeSize } from '@/api/perfumes.api';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { items, count, clearFavorites } = useWishlist();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (product: Perfume, size: PerfumeSize) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addItem(product, size);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-border bg-background/80 p-10 text-center shadow-sm backdrop-blur">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400">
            <Heart className="h-7 w-7" />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
            Your Wishlist
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            No favorites yet
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            Save the perfumes you love and come back to them anytime from your favorites page.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Explore Store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-350 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
            Wishlist
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Your Favorites
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You have <span className="font-bold text-foreground">{count}</span> saved perfume
            {count === 1 ? '' : 's'}.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-full"
          onClick={clearFavorites}
        >
          Clear Favorites
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}