import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production-min-32-chars-long"
);

// Access token: short-lived (15 min). Refresh token handles persistence.
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

// Cookie maxAge in seconds
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function createAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ userId, role, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string; type: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string; type: string };
  } catch {
    return null;
  }
}

export function getRolePermissions(role: string) {
  const permissions: Record<string, string[]> = {
    CUSTOMER: ["book", "view_own_appointments", "cancel_own_appointments", "view_own_profile"],
    STYLIST: ["view_schedule", "manage_availability", "view_clients", "request_leave", "view_commissions"],
    RECEPTIONIST: ["manage_appointments", "manage_walk_ins", "view_customers", "process_payments", "manage_waitlist"],
    MANAGER: ["manage_services", "manage_stylists", "manage_customers", "view_reports", "manage_inventory", "manage_coupons", "manage_appointments"],
    SUPER_ADMIN: ["*"],
  };
  return permissions[role] || [];
}

export function hasPermission(role: string, permission: string): boolean {
  const perms = getRolePermissions(role);
  return perms.includes("*") || perms.includes(permission);
}

/**
 * Helper to set standard auth cookies on a NextResponse.
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string,
) {
  const isProd = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set("auth-token", accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  if (refreshToken) {
    response.cookies.set("refresh-token", refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

/**
 * Helper to clear auth cookies on a NextResponse.
 */
export function clearAuthCookies(response: NextResponse) {
  const isProd = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set("auth-token", "", base);
  response.cookies.set("refresh-token", "", base);
}
