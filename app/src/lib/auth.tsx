import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export type Role = "guest" | "citizen" | "responder" | "admin";

type AuthContextValue = {
  role: Role;
  login: (role: Exclude<Role, "guest">) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("guest");

  const value = useMemo(
    () => ({
      role,
      login: (r: Exclude<Role, "guest">) => setRole(r),
      logout: () => setRole("guest"),
    }),
    [role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const ProtectedRoute = ({ roles }: { roles: Exclude<Role, "guest">[] }) => {
  const { role } = useAuth();
  const location = useLocation();
  if (!roles.includes(role as Exclude<Role, "guest">)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};
