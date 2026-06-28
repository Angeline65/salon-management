import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * Extracts and validates the current user from request cookies.
 * Returns the user with their stylist profile (if they have one).
 * Use this in all staff API routes to ensure authenticated access.
 */
export async function getServerUser(req: NextRequest) {
  const accessToken = req.cookies.get("auth-token")?.value;
  const refreshToken = req.cookies.get("refresh-token")?.value;

  let userId: string | undefined;

  // 1. Try access token
  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload && payload.type === "access") {
      userId = payload.userId;
    }
  }

  // 2. Fall back to refresh token
  if (!userId && refreshToken) {
    const payload = await verifyToken(refreshToken);
    if (payload && payload.type === "refresh") {
      userId = payload.userId;
    }
  }

  if (!userId) {
    return null;
  }

  // 3. Fetch user with stylist profile
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null, isActive: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      stylist: {
        select: {
          id: true,
          bio: true,
          specialties: true,
          commissionRate: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });

  return user;
}

/**
 * Checks if the user has one of the allowed staff roles.
 */
export function isStaffRole(role: string): boolean {
  return ["STYLIST", "RECEPTIONIST", "MANAGER", "SUPER_ADMIN"].includes(role);
}

/**
 * Error response for unauthorized requests.
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ success: false, error: "Not authenticated" }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Error response for forbidden requests (wrong role).
 */
export function forbiddenResponse() {
  return new Response(
    JSON.stringify({ success: false, error: "Insufficient permissions" }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
