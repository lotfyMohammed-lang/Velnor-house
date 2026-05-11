import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import logo from '@/assets/velnor-logo.png';

interface AuthLayoutProps {
  initialMode: 'login' | 'signup';
}

export function AuthLayout({ initialMode }: AuthLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, signup, googleLogin } = useAuth();
  const isRtl = i18n.language === 'ar';

  const [isSignUpActive, setIsSignUpActive] = useState(initialMode === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  useEffect(() => {
    setIsSignUpActive(initialMode === 'signup');
  }, [initialMode]);

  const toggleMode = (mode: 'login' | 'signup') => {
    setErrors({});
    setIsSignUpActive(mode === 'signup');
    navigate(mode === 'signup' ? '/signup' : '/login', { replace: true });
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      newErrors.loginEmail = t('auth.validEmail');
    }

    if (!loginPassword) {
      newErrors.loginPassword = t('auth.passwordRequired');
    }

    return newErrors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateLogin();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      const errorMsg = result.error ?? t('auth.loginFailed');
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    }
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};

    if (!signupName.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!signupEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      newErrors.email = 'Enter a valid email';
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!signupPassword) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(signupPassword)) {
      newErrors.password =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }

    if (signupPassword !== signupConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateSignUp();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    const result = await signup(signupName, signupEmail, signupPassword, signupPhone);
    setIsLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      const errorMsg = result.error ?? 'Signup failed';
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    if (!response?.credential) {
      toast.error('Google credential not received');
      return;
    }

    setIsLoading(true);
    const result = await googleLogin(response.credential);
    setIsLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      toast.error(result.error || 'Google login failed');
    }
  };

  const SocialButtons = () => (
    <div className="mb-6 flex justify-center">
      <GoogleLogin
        key={isSignUpActive ? 'google-signup' : 'google-login'}
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error('Google Login Error')}
        type="icon"
        shape="circle"
        theme="outline"
        size="large"
        ux_mode="popup"
        useOneTap={false}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:py-12">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000 sm:mb-10">
        <img
          src={logo}
          alt="Velnor House Logo"
          className="mb-3 h-14 w-auto drop-shadow-sm sm:mb-4 sm:h-20"
        />
        <h2 className="text-center text-xl font-black tracking-[0.2em] text-zinc-900 dark:text-white sm:text-3xl sm:tracking-[0.25em]">
          VELNOR HOUSE
        </h2>
        <div className="mt-2 h-0.5 w-10 rounded-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] sm:w-12" />
      </div>

      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:top-8 sm:left-8 sm:text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">
          {isRtl ? 'العودة للمتجر' : 'Back to Store'}
        </span>
      </Link>

      <div className={cn('auth-container', isSignUpActive && 'right-panel-active')}>
        <div className={cn('form-container sign-up-container', isSignUpActive && 'mobile-active')}>
          <form
            onSubmit={handleSignUpSubmit}
            className="flex h-full flex-col items-center justify-center bg-white px-6 py-10 text-center dark:bg-zinc-900 sm:px-12"
          >
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:mb-4 sm:text-4xl">
              {t('auth.signUp')}
            </h1>

            {isSignUpActive && <SocialButtons />}

            <span className="mb-4 text-[11px] font-bold tracking-widest text-zinc-500 uppercase dark:text-zinc-400 sm:mb-6 sm:text-sm">
              or use your email
            </span>

            <div className="w-full space-y-3 sm:space-y-4">
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="signup-name"
                  name="name"
                  placeholder="Full Name"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-left text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-left text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="signup-phone"
                  name="phone"
                  placeholder="Phone (Optional)"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>

              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="mt-1 text-left text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-left text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {errors.form && (
              <p className="mt-4 text-sm text-red-500">{errors.form}</p>
            )}

            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] font-black tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105 active:scale-95 sm:mt-8 sm:h-12 sm:w-48"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SIGN UP'}
            </Button>

            <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm md:hidden">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode('login')}
                className="font-bold text-[#ff4b2b]"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>

        <div className={cn('form-container sign-in-container', !isSignUpActive && 'mobile-active')}>
          <form
            onSubmit={handleLoginSubmit}
            className="flex h-full flex-col items-center justify-center bg-white px-6 py-10 text-center dark:bg-zinc-900 sm:px-12"
          >
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:mb-4 sm:text-4xl">
              {t('auth.signIn')}
            </h1>

            {!isSignUpActive && <SocialButtons />}

            <span className="mb-4 text-[11px] font-bold tracking-widest text-zinc-500 uppercase dark:text-zinc-400 sm:mb-6 sm:text-sm">
              or use your account
            </span>

            <div className="w-full space-y-3 sm:space-y-4">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.loginEmail && (
                  <p className="mt-1 text-left text-xs text-red-500">{errors.loginEmail}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 sm:h-5 sm:w-5" />
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="h-11 border-none bg-zinc-100 pl-11 text-sm font-bold dark:bg-zinc-800 sm:h-12 sm:pl-12 sm:text-base"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute top-1/2 ltr:right-4 rtl:left-4 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.loginPassword && (
                  <p className="mt-1 text-left text-xs text-red-500">{errors.loginPassword}</p>
                )}
              </div>
            </div>

            {errors.form && (
              <p className="mt-4 text-sm text-red-500">{errors.form}</p>
            )}

            <Link
              to="/forgot-password"
              className="mt-4 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:text-sm"
            >
              {t('auth.forgotPassword')}
            </Link>

            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] font-black tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105 active:scale-95 sm:mt-8 sm:h-12 sm:w-48"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SIGN IN'}
            </Button>

            <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm md:hidden">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode('signup')}
                className="font-bold text-[#ff4b2b]"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Welcome Back!</h1>
              <p className="mb-8 text-sm opacity-90">
                To keep connected with us please login with your personal info
              </p>
              <button
                type="button"
                className="h-12 w-40 rounded-full border border-white bg-transparent font-bold text-white transition-all hover:bg-white/10"
                onClick={() => toggleMode('login')}
              >
                SIGN IN
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Hello, Royalty!</h1>
              <p className="mb-8 text-sm opacity-90">
                Enter your personal details and start your journey with us
              </p>
              <button
                type="button"
                className="h-12 w-40 rounded-full border border-white bg-transparent font-bold text-white transition-all hover:bg-white/10"
                onClick={() => toggleMode('signup')}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}