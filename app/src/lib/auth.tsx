import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authAPI } from "./api";

export type Role = "guest" | "citizen" | "responder" | "admin";

type AuthContextValue = {
  role: Role;
  user: any | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'responder' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("guest");
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setRole("guest");
        setUser(null);
        return;
      }

      const response = await authAPI.verifyToken();
      if (response.valid && response.user) {
        setRole(response.user.role);
        setUser(response.user);
      } else {
        localStorage.removeItem('auth_token');
        setRole("guest");
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setRole("guest");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string, loginRole: 'responder' | 'admin') => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password, loginRole);
      setRole(response.user.role);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setRole("guest");
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      role,
      user,
      isLoading,
      login,
      logout,
      checkAuth,
    }),
    [role, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const ProtectedRoute = ({ roles }: { roles: Exclude<Role, "guest">[] }) => {
  const { role, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!roles.includes(role as Exclude<Role, "guest">)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};
