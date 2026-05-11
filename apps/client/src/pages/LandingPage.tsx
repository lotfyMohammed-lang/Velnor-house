import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/velnor-logo.png';

const features = [
  {
    icon: Sparkles,
    title: 'Premium Collection',
    description: 'Curated selection of designer and niche fragrances from the world\'s finest houses.',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-600/10',
  },
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'Every fragrance is sourced directly from authorized distributors. Guaranteed genuine.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-600/10',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same-day dispatch on orders placed before 2 PM. Free shipping on orders over 3000 EGP.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-600/10',
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Velnor House" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-foreground">Velnor House</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-linear-to-b from-amber-50 to-background dark:from-amber-950/20 px-6 py-24 text-center sm:py-32">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              <span className="text-amber-600 dark:text-amber-400">Discover</span>{' '}
              <span className="text-foreground">your</span>
              <br />
              <span className="text-foreground">signature scent.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Explore our curated collection of premium perfumes from Chanel, Dior,
              YSL, Armani, and more. Authentic fragrances, delivered to your door.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-amber-500/20">
                <Link to="/signup">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 bg-linear-to-r from-amber-500/10 to-rose-500/10 blur-[120px] rounded-full" />
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Why shop with Velnor House?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
              Your trusted destination for premium fragrances.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to find your fragrance?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create an account and start exploring.
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to="/signup">Create your account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
          Velnor House -- Premium Perfume Store
        </div>
      </footer>
    </div>
  );
}
