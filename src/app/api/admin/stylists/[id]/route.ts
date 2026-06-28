import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const updateStylistSchema = z.object({
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  isFeatured: z.boolean().optional(),
  instagramUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  rating: z.number().min(0).max(5).optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - Single stylist
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
    const stylist = await prisma.stylist.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: true,
        appointments: {
          include: {
            customer: { include: { user: true } },
            services: { include: { service: true } },
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        reviews: {
          include: { customer: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        availability: { orderBy: { dayOfWeek: "asc" } },
        leaveRequests: { orderBy: { startDate: "desc" }, take: 10 },
      },
    });

    if (!stylist) {
      return NextResponse.json({ success: false, error: "Stylist not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: stylist });
  } catch (error) {
    console.error("Admin stylist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stylist" }, { status: 500 });
  }
}

// PATCH - Update stylist
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
    const data = updateStylistSchema.parse(body);

    const stylist = await prisma.stylist.update({
      where: { id, deletedAt: null },
      data,
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: stylist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin stylist PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update stylist" }, { status: 500 });
  }
}

// DELETE - Soft delete stylist
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
    await prisma.stylist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Stylist deleted" });
  } catch (error) {
    console.error("Admin stylist DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete stylist" }, { status: 500 });
  }
}
