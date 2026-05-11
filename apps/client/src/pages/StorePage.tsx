import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Search,
  AlertCircle,
  Grid2X2,
  ShoppingBag,
  Watch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePerfumes } from '@/hooks/usePerfumes';
import { useCart } from '@/lib/cart';
import type { Perfume } from '@/api/perfumes.api';
import { ProductCard } from '@/components/perfumes/ProductCard';
import { cn } from '@/lib/utils';
import heroBanner from '@/assets/velnor-hero-banner.png';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const CATEGORIES = [
  { id: 'perfume', nameKey: 'store.perfumes', icon: Grid2X2, isType: true },
  { id: 'bag', nameKey: 'store.bags', icon: ShoppingBag, isType: true },
  { id: 'watch', nameKey: 'store.watches', icon: Watch, isType: true },
];

const CATEGORIES_COLLAPSED_STORAGE_KEY = 'velnor_categories_collapsed';

export function StorePage() {
  const { t, i18n } = useTranslation();
  const { data: perfumes, isLoading, isError, refetch } = usePerfumes();
  const { addItem } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [activeType, setActiveType] = useState('perfume');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CATEGORIES_COLLAPSED_STORAGE_KEY) === 'true';
  });

  const sortLabels: Record<SortOption, string> = {
    featured: t('store.featured'),
    'price-asc': t('store.priceLowHigh'),
    'price-desc': t('store.priceHighLow'),
    newest: t('store.newest'),
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      CATEGORIES_COLLAPSED_STORAGE_KEY,
      String(categoriesCollapsed)
    );
  }, [categoriesCollapsed]);

  const setSearchQuery = (q: string) => {
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

  const getStartingPrice = (p: Perfume) => {
    if (!p.sizes || p.sizes.length === 0) return 0;
    return Math.min(...p.sizes.map((s) => s.price));
  };

  const handleCategoryClick = (cat: any) => {
    if (cat.isType) {
      setActiveType(cat.id);
      setActiveCategory('all');
    } else {
      setActiveCategory(cat.id);
      setActiveType('perfume');
    }
  };

  const filteredProducts = (perfumes || [])
    .filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = (p.type || 'perfume') === activeType;
      
      const matchesCategory =
        activeCategory === 'all' ||
        p.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const priceA = getStartingPrice(a);
      const priceB = getStartingPrice(b);

      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return (
            (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
            (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)
          );
      }
    });

  const isRtl = i18n.language === 'ar';

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-rose-500" />
          <p className="text-lg font-bold text-foreground">{t('store.failedToLoad')}</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => refetch()}>
            {t('store.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-10">
      {/* Dynamic Header Banner - FULL WIDTH */}
      <section className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-[1920px]">
          <div className="relative flex items-center justify-center min-h-[140px] sm:min-h-[220px] lg:min-h-[300px] overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.05)_0%,transparent_70%)]" />
             <div className="relative z-10 w-full px-0 sm:px-6">
                <img
                  src={heroBanner}
                  alt="Velnor House Collection"
                  className="mx-auto block w-full h-auto object-contain max-h-[100px] sm:max-h-[180px] lg:max-h-[240px]"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Main Container - Full Width on Mobile, Max Width on Desktop */}
      <div className="mx-auto w-full max-w-[1920px]">
        
        {/* CATEGORIES SCROLLER - Mobile/Tablet Only */}
        <div className="sticky top-28 sm:top-32 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 lg:hidden">
           <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 px-4 snap-x">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon!;
                const isActive = activeType === cat.id && activeCategory === 'all';
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border shrink-0 snap-start",
                      isActive
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-105"
                        : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700"
                    )}
                  >
                    <Icon className="size-3" />
                    <span>{t(cat.nameKey!)}</span>
                  </button>
                );
              })}
           </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:p-10 p-4">
          
          {/* DESKTOP SIDEBAR (Visible from Laptop up) */}
          <aside className="hidden lg:block relative">
            <div
              className={cn(
                "sticky top-32 space-y-8 rounded-[40px] border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-500",
                categoriesCollapsed ? "w-24" : "w-[280px]"
              )}
            >
              <div className="flex items-center justify-between px-2">
                {!categoriesCollapsed && (
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{t('store.categories')}</h3>
                )}
                <button
                  type="button"
                  onClick={() => setCategoriesCollapsed((prev) => !prev)}
                  className="p-2.5 hover:bg-zinc-50 rounded-2xl transition-all mx-auto dark:hover:bg-zinc-800 group"
                >
                  <SlidersHorizontal className={cn("size-4 transition-transform group-hover:rotate-180", categoriesCollapsed && "scale-110")} />
                </button>
              </div>

              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon!;
                  const isActive = activeType === cat.id && activeCategory === 'all';
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={cn(
                        "flex w-full items-center rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                        isActive
                          ? "bg-zinc-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800",
                        categoriesCollapsed ? "justify-center p-5" : "gap-4 px-6 py-5"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!categoriesCollapsed && <span className="truncate">{t(cat.nameKey!)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* PRODUCT LISTING */}
          <div className="min-w-0">
            {/* Header / Sort Row */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:mb-10">
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-zinc-100">
                  {activeCategory === 'all' 
                    ? t(`store.${activeType}s`)
                    : t(`store.${activeCategory}s` || activeCategory)}
                </h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 w-8 bg-rose-600 rounded-full" />
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    {filteredProducts.length} {t('common.items')} {t('store.showing')}
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('store.sortBy')}:</span>
                <Button
                  variant="outline"
                  className="h-10 sm:h-12 rounded-2xl border-zinc-100 bg-white px-6 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  {sortLabels[sortBy]}
                  <ChevronDown className="ltr:ml-3 rtl:mr-3 size-4 opacity-50" />
                </Button>

                {showSortMenu && (
                  <div className="absolute top-full z-40 mt-3 w-64 rounded-[32px] border border-zinc-100 bg-white/95 p-3 shadow-[0_30px_60px_rgba(0,0,0,0.15)] backdrop-blur-xl ltr:right-0 rtl:left-0 dark:bg-zinc-900/95 dark:border-zinc-800">
                    {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          "w-full rounded-2xl px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0",
                          sortBy === option
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        )}
                      >
                        {sortLabels[option]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid Layout - Responsive Columns */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[48px] border border-dashed border-zinc-200 bg-white/40 py-24 px-8 text-center backdrop-blur-sm dark:border-zinc-800">
                <div className="mb-8 rounded-full bg-zinc-50 p-8 dark:bg-zinc-900">
                  <Search className="size-12 text-zinc-200 dark:text-zinc-800" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 uppercase italic dark:text-white">{t('store.noProductsFound')}</h3>
                <p className="mt-3 max-w-xs text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-widest">
                  {t('store.tryChangingFilters')}
                </p>
                <Button
                  variant="outline"
                  className="mt-12 rounded-full font-black uppercase tracking-widest px-12 h-14 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-zinc-900"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setActiveType('perfume');
                  }}
                >
                  {t('store.clearFilters')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
