import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAdminAuth } from '@/lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error ?? 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl">
             <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">
            Velnor House
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Management Panel
          </p>
        </div>

        <Card className="rounded-[32px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white p-6 sm:p-8">
            <CardTitle className="text-xl sm:text-2xl font-black">Admin Access</CardTitle>
            <CardDescription className="text-zinc-400 font-medium">
              Secure entry for authorized personnel only.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {error && (
                <div className="rounded-xl bg-destructive/10 px-4 py-3 text-xs sm:text-sm font-bold text-destructive border border-destructive/20 animate-in shake-1">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Command Center Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@velnor.com"
                  className="h-11 sm:h-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 sm:h-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-sm pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-zinc-900 transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl bg-zinc-900 text-xs sm:text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#ef1b4f] transition-all active:scale-95" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  'Establish Connection'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          &copy; 2026 VELNOR HOUSE ROYALTY SERVICES
        </p>
      </div>
    </div>
  );
}
