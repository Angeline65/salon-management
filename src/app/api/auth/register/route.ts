import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-password";
import { createAccessToken, createRefreshToken, setAuthCookies } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user and customer profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phone,
          role: "CUSTOMER",
          isActive: true,
          emailVerified: false,
        },
      });

      // Create associated customer profile
      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          loyaltyPoints: 0,
          totalVisits: 0,
          totalSpent: 0,
          referralCode: `LX${user.id.slice(-6).toUpperCase()}`,
        },
      });

      return { user, customer };
    });

    const accessToken = await createAccessToken(result.user.id, result.user.role);
    const refreshToken = await createRefreshToken(result.user.id);

    const { passwordHash: _, ...userWithoutPassword } = result.user;

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens: { accessToken, refreshToken },
      },
    });

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
