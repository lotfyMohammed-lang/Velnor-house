import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';

import { StorePage } from '@/pages/StorePage';
import { PerfumeDetailsPage } from '@/pages/PerfumeDetailsPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ReturnsPage } from '@/pages/ReturnsPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

import { ProfilePage } from '@/pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <ThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    expand
                    gap={8}
                    offset={20}
                    toastOptions={{
                      duration: 2600,
                      className:
                        'rounded-[20px] border border-border/60 bg-background/95 px-4 py-3 text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.10)] backdrop-blur-xl min-w-[320px] max-w-[360px] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]',
                    }}
                  />

                  <Routes>
                    <Route element={<PublicRoute />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    <Route element={<AppLayout />}>
                      <Route path="/" element={<StorePage />} />
                      <Route path="/store/:id" element={<PerfumeDetailsPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/returns" element={<ReturnsPage />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </WishlistProvider>
              </CartProvider>
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;