import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { API_BASE_URL } from '@/api/client';

type AuthUser = {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (username: string, email: string, password: string, phone?: string) => Promise<AuthResult>;
  googleLogin: (credential: string) => Promise<AuthResult>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'todolo_token';
const USER_KEY = 'todolo_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously from localStorage to prevent flash of unauthenticated state
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUserState] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Rehydration / Verification effect
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Optional: Call a /me or /verify endpoint here to ensure token is still valid
        // For now, we assume token is valid if it exists, but we set isLoading to false
        // after a small delay to simulate verification if needed or just to ensure
        // everything is synced.
        setIsLoading(false);
      } catch (error) {
        console.error('Auth verification failed', error);
        logout();
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const setToken = useCallback((nextToken: string | null) => {
    setTokenState(nextToken);
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    setTokenState(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || 'Login failed',
        };
      }

      const result = data as AuthResponse;
      setUser(result.user);
      setToken(result.token);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }, [setToken, setUser]);

  const signup = useCallback(async (username: string, email: string, password: string, phone?: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || 'Signup failed',
        };
      }

      const result = data as AuthResponse;
      setUser(result.user);
      setToken(result.token);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }, [setToken, setUser]);

  const googleLogin = useCallback(async (credential: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || 'Google login failed',
        };
      }

      const result = data as AuthResponse;
      setUser(result.user);
      setToken(result.token);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }, [setToken, setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      signup,
      googleLogin,
      logout,
      setUser,
      setToken,
    }),
    [user, token, isLoading, login, signup, googleLogin, logout, setUser, setToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}