import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthResponse = {
  admin: AdminUser;
  token: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
};

type AuthContextValue = {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'admin_access_token';
const ADMIN_KEY = 'todolo_admin_user';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdminState] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_KEY);

    if (savedToken) {
      setTokenState(savedToken);
    }

    if (savedAdmin) {
      try {
        setAdminState(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem(ADMIN_KEY);
      }
    }
  }, []);

  const setAdmin = useCallback((next: AdminUser | null) => {
    setAdminState(next);
    if (next) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  }, []);

  const setToken = useCallback((next: string | null) => {
    setTokenState(next);
    if (next) {
      localStorage.setItem(TOKEN_KEY, next);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data?.message || 'Login failed' };
      }

      const result = data as AuthResponse;
      setAdmin(result.admin);
      setToken(result.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, [setAdmin, setToken]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data?.message || 'Registration failed' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
  }, [setAdmin, setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, token, isAuthenticated: !!token, login, register, logout }),
    [admin, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

export { API_BASE_URL };

export function getAdminHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
