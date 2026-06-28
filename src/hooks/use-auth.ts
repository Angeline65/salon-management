"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types";

/**
 * Primary auth hook. Wraps the context provider with router-aware
 * redirects (login → dashboard, logout → /login, etc.).
 */
export function useAuth() {
  const router = useRouter();
  const ctx = useAuthContext();
  const { user, isAuthenticated, isLoading, hasRole, login, register, logout } = ctx;

  // Track whether we've already performed the post-login redirect
  const didRedirectRef = useRef(false);

  // ── Role helpers (convenience) ──
  const isCustomer = hasRole(["CUSTOMER"]);
  const isStylist = hasRole(["STYLIST"]);
  const isReceptionist = hasRole(["RECEPTIONIST"]);
  const isManager = hasRole(["MANAGER", "SUPER_ADMIN"]);
  const isSuperAdmin = hasRole(["SUPER_ADMIN"]);
  const isStaff = hasRole(["STYLIST", "RECEPTIONIST", "MANAGER", "SUPER_ADMIN"]);

  // ── Login with role-based redirect ──
  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      // Fetch the user to get the role for redirection
      // (context user state won't be updated until the next render)
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const meData = await meRes.json();
          const role = meData.data?.role;
          didRedirectRef.current = true;

          if (role === "SUPER_ADMIN" || role === "MANAGER") {
            router.push("/admin/dashboard");
          } else if (role === "STYLIST" || role === "RECEPTIONIST") {
            router.push("/staff/dashboard");
          } else {
            router.push("/customer/dashboard");
          }
        }
      } catch {
        // If /me fails, still redirect to customer dashboard as fallback
        didRedirectRef.current = true;
        router.push("/customer/dashboard");
      }
    }
    return result;
  };

  // ── Register with redirect ──
  const handleRegister = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const result = await register(data);
    if (result.success) {
      didRedirectRef.current = true;
      router.push("/customer/dashboard");
    }
    return result;
  };

  // ── Logout with redirect ──
  const handleLogout = async () => {
    await logout();
    didRedirectRef.current = false;
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isCustomer,
    isStylist,
    isReceptionist,
    isManager,
    isSuperAdmin,
    isStaff,
    hasRole: (roles: UserRole[]) => hasRole(roles),
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
