import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/api/client';

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setError('Username or email is required');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedIdentifier }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to request reset');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Link
        to="/login"
        className="fixed left-4 top-4 z-50 flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Link>

      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white p-10 shadow-2xl dark:bg-zinc-900 sm:p-12">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {isSubmitted ? 'Email Sent' : 'Reset Password'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isSubmitted
              ? 'Check your inbox for a secure recovery link.'
              : 'Enter your email or username to receive a secure recovery link.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              If an account exists for{' '}
              <span className="font-bold text-zinc-900 dark:text-white">{identifier}</span>,
              instructions are on the way.
            </p>

            <Button
              asChild
              className="h-12 w-full rounded-full bg-zinc-900 font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Link to="/login">Return to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                className="text-xs font-bold uppercase tracking-wider text-zinc-400"
              >
                Email Address or Username
              </Label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="identifier"
                  className="h-12 border-none bg-zinc-100 pl-12 dark:bg-zinc-800"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-[#ff416c] font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SEND RESET LINK'}
            </Button>
          </form>
        )}

        {!isSubmitted && (
          <div className="mt-8 text-center text-sm font-medium text-zinc-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-[#ff4b2b]">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}