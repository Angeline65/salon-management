import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - Single customer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: true,
        appointments: {
          include: {
            stylist: { include: { user: true } },
            services: { include: { service: true } },
            payment: true,
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        memberships: { include: { plan: true } },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        favoriteStylist: { include: { user: true } },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Admin customer GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customer" }, { status: 500 });
  }
}

// PATCH - Update customer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { z } = await import("zod");
    const schema = z.object({
      notes: z.string().optional(),
      loyaltyPoints: z.number().int().min(0).optional(),
      totalVisits: z.number().int().min(0).optional(),
      totalSpent: z.number().min(0).optional(),
      favoriteStylistId: z.string().nullable().optional(),
    });
    const data = schema.parse(body);

    const customer = await prisma.customer.update({
      where: { id, deletedAt: null },
      data,
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    if (error instanceof (await import("zod")).ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin customer PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE - Soft delete customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("Admin customer DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete customer" }, { status: 500 });
  }
}
