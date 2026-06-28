import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/customer/profile
 * Returns the customer's full profile including user data.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER") return forbiddenResponse();

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        memberships: {
          where: { isActive: true },
          include: { plan: true },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Get customer profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customer/profile
 * Updates the customer's profile information.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER") return forbiddenResponse();

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer profile not found" },
        { status: 404 }
      );
    }

    // Update user fields
    const userUpdate: Record<string, unknown> = {};
    if (data.firstName) userUpdate.firstName = data.firstName;
    if (data.lastName) userUpdate.lastName = data.lastName;
    if (data.phone !== undefined) userUpdate.phone = data.phone;

    // Update customer fields
    const customerUpdate: Record<string, unknown> = {};
    if (data.dateOfBirth) customerUpdate.dateOfBirth = new Date(data.dateOfBirth);
    if (data.notes !== undefined) customerUpdate.notes = data.notes;

    // Perform updates
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdate,
      });
    }

    if (Object.keys(customerUpdate).length > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: customerUpdate,
      });
    }

    // Fetch updated profile
    const updated = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Update customer profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
