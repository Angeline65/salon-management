import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, createAccessToken, setAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh-token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token not found" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(refreshToken);

    if (!payload || payload.type !== "refresh") {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null, isActive: true },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found or deactivated" },
        { status: 401 }
      );
    }

    const newAccessToken = await createAccessToken(user.id, user.role);

    const response = NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken },
    });

    // Update only the access token cookie (refresh token stays the same)
    setAuthCookies(response, newAccessToken);

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
