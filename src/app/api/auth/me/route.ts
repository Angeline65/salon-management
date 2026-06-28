import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, createAccessToken, setAuthCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("auth-token")?.value;
    const refreshToken = req.cookies.get("refresh-token")?.value;

    let userId: string | undefined;
    let needsRefresh = false;

    // 1. Try the access token first
    if (accessToken) {
      const payload = await verifyToken(accessToken);
      if (payload && payload.type === "access") {
        userId = payload.userId;
      }
    }

    // 2. If access token is missing/expired, try refresh token
    if (!userId && refreshToken) {
      const refreshPayload = await verifyToken(refreshToken);
      if (refreshPayload && refreshPayload.type === "refresh") {
        // Verify user is still active before issuing new token
        const user = await prisma.user.findUnique({
          where: { id: refreshPayload.userId, deletedAt: null, isActive: true },
          select: { id: true, role: true },
        });
        if (user) {
          userId = user.id;
          needsRefresh = true;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 3. Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: user,
    });

    // 4. If we fell back to refresh token, issue a new access token cookie
    if (needsRefresh) {
      const newAccessToken = await createAccessToken(user.id, user.role);
      setAuthCookies(response, newAccessToken);
    }

    return response;
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
