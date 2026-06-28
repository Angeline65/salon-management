"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (allowedRoles && !hasRole(allowedRoles)) {
        // Authenticated but wrong role, redirect to unauthorized
        router.push("/unauthorized");
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, hasRole, router]);

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center animate-pulse">
            <span className="text-white font-display text-lg font-bold">L</span>
          </div>
          <p className="text-charcoal-lighter text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Role-specific route guards
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "MANAGER"]}>
      {children}
    </ProtectedRoute>
  );
}

export function StaffRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["STYLIST", "RECEPTIONIST", "MANAGER", "SUPER_ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
}

export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      {children}
    </ProtectedRoute>
  );
}
