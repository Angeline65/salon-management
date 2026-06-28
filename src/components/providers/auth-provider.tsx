"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User, AuthTokens, UserRole } from "@/types";

// ──────────────────────────────────────────────
// Context shape
// ──────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Role helpers */
  hasRole: (roles: UserRole[]) => boolean;
  isCustomer: boolean;
  isStylist: boolean;
  isReceptionist: boolean;
  isManager: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  /** Actions */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restoredRef = useRef(false);

  // ── Session restoration (runs once) ──
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 2;

    const restore = async () => {
      while (retries <= MAX_RETRIES) {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });

          if (cancelled) return;

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setUser(data.data);
              setIsLoading(false);
              return;
            }
          }

          // 401 means genuinely not authenticated (no valid tokens)
          if (res.status === 401) {
            setUser(null);
            setIsLoading(false);
            return;
          }

          // Server error — retry
          throw new Error(`Unexpected status ${res.status}`);
        } catch {
          retries++;
          if (retries > MAX_RETRIES) {
            // Give up — treat as not authenticated
            setUser(null);
            setIsLoading(false);
            return;
          }
          // Wait before retry (exponential backoff: 500ms, 1000ms)
          await new Promise((r) => setTimeout(r, 250 * retries));
        }
      }
    };

    restore();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Role helpers ──
  const hasRole = useCallback(
    (roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const isCustomer = hasRole(["CUSTOMER"]);
  const isStylist = hasRole(["STYLIST"]);
  const isReceptionist = hasRole(["RECEPTIONIST"]);
  const isManager = hasRole(["MANAGER", "SUPER_ADMIN"]);
  const isSuperAdmin = hasRole(["SUPER_ADMIN"]);
  const isStaff = hasRole(["STYLIST", "RECEPTIONIST", "MANAGER", "SUPER_ADMIN"]);

  // ── Login ──
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setTokens(data.data.tokens);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  // ── Register ──
  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setUser(result.data.user);
        setTokens(result.data.tokens);
        return { success: true };
      }
      return { success: false, error: result.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore — continue with client-side cleanup
    }
    setUser(null);
    setTokens(null);
  }, []);

  const value: AuthContextValue = {
    user,
    tokens,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    isCustomer,
    isStylist,
    isReceptionist,
    isManager,
    isSuperAdmin,
    isStaff,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an <AuthProvider>");
  }
  return ctx;
}
