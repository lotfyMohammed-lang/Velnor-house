import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    if (!loginEmail.trim()) newErrors.loginEmail = t('auth.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) newErrors.loginEmail = t('auth.validEmail');
    if (!loginPassword) newErrors.loginPassword = t('auth.passwordRequired');
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
    if (!signupName.trim()) newErrors.name = 'Name is required';
    if (!signupEmail.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) newErrors.email = 'Enter a valid email';
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!signupPassword) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(signupPassword)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    if (signupPassword !== signupConfirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
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
    if (!response?.credential) return;
    setIsLoading(true);
    const result = await googleLogin(response.credential);
    setIsLoading(false);
    if (result.success) navigate('/', { replace: true });
    else toast.error(result.error || 'Google login failed');
  };

  const SocialButtons = ({ isActive }: { active?: boolean; isActive?: boolean }) => (
    <div className="mb-6 flex gap-4">
      {/* Google Button */}
      <div className="group relative h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <div className="absolute inset-0 opacity-0">
          {/* CRITICAL: Only render GoogleLogin for the active panel to avoid multiple initializations */}
          {isActive && (
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Login Error')}
              type="icon" 
              shape="circle" 
              theme="outline" 
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:py-12">
      {/* Brand Header */}
      <div className="mb-8 sm:mb-10 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <img src={logo} alt="Velnor House Logo" className="mb-3 sm:mb-4 h-14 w-auto drop-shadow-sm sm:h-20" />
        <h2 className="text-center text-xl font-black tracking-[0.2em] text-zinc-900 dark:text-white sm:text-3xl sm:tracking-[0.25em]">
          VELNOR HOUSE
        </h2>
        <div className="mt-2 h-0.5 w-10 sm:w-12 bg-linear-to-r from-[#ff416c] to-[#ff4b2b] rounded-full" />
      </div>

      <Link 
        to="/" 
        className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">{isRtl ? 'العودة للمتجر' : 'Back to Store'}</span>
      </Link>

      <div className={cn("auth-container", isSignUpActive && "right-panel-active")}>
        
        {/* Sign Up Form */}
        <div className={cn("form-container sign-up-container", isSignUpActive && "mobile-active")}>
          <form onSubmit={handleSignUpSubmit} className="flex h-full flex-col items-center justify-center bg-white px-6 sm:px-12 py-10 text-center dark:bg-zinc-900">
            <h1 className="mb-2 sm:mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {t('auth.signUp')}
            </h1>
            
            <SocialButtons isActive={isSignUpActive} />

            <span className="mb-4 sm:mb-6 text-[11px] sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
              or use your email
            </span>

            <div className="w-full space-y-3 sm:space-y-4">
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="signup-name"
                  name="name"
                  placeholder="Full Name"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="signup-phone"
                  name="phone"
                  placeholder="Phone (Optional)"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 sm:mt-8 h-11 sm:h-12 w-full sm:w-48 rounded-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] font-black uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SIGN UP'}
            </Button>
            
            <p className="mt-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 md:hidden">
              Already have an account?{' '}
              <button type="button" onClick={() => toggleMode('login')} className="font-bold text-[#ff4b2b]">
                Sign In
              </button>
            </p>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={cn("form-container sign-in-container", !isSignUpActive && "mobile-active")}>
          <form onSubmit={handleLoginSubmit} className="flex h-full flex-col items-center justify-center bg-white px-6 sm:px-12 py-10 text-center dark:bg-zinc-900">
            <h1 className="mb-2 sm:mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {t('auth.signIn')}
            </h1>
            
            <SocialButtons isActive={!isSignUpActive} />

            <span className="mb-4 sm:mb-6 text-[11px] sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
              or use your account
            </span>

            <div className="w-full space-y-3 sm:space-y-4">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="h-11 sm:h-12 border-none bg-zinc-100 pl-11 sm:pl-12 dark:bg-zinc-800 text-sm sm:text-base font-bold"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute top-1/2 ltr:right-4 rtl:left-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Link to="/forgot-password" size="sm" className="mt-4 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('auth.forgotPassword')}
            </Link>

            <Button
              type="submit"
              className="mt-6 sm:mt-8 h-11 sm:h-12 w-full sm:w-48 rounded-full bg-linear-to-r from-[#ff416c] to-[#ff4b2b] font-black uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SIGN IN'}
            </Button>

            <p className="mt-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 md:hidden">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => toggleMode('signup')} className="font-bold text-[#ff4b2b]">
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* Overlay */}
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
