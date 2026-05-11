import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { API_BASE_URL } from '@/api/client';

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identifier, method } = location.state || {};

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!identifier || !method) {
      navigate('/login');
    }
  }, [identifier, method, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Success! Move to set new password
      navigate('/reset-password-final', { 
        state: { resetToken: data.resetToken } 
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method }),
      });

      if (!res.ok) throw new Error('Failed to resend OTP');

      setMessage('A new code has been sent.');
    } catch (err: any) {
      setError(err.message || 'Could not resend code');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Velnor House</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Refined fragrances, simplified.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Verify your identity</CardTitle>
            <CardDescription>
              We sent a 6-digit code to your {method}. <br />
              <span className="font-medium text-foreground">{identifier}</span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col items-center gap-4">
              {error && (
                <div className="w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {message && (
                <div className="w-full rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 flex items-center gap-2">
                  {message}
                </div>
              )}

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Continue
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/forgot-password">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try a different method
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
