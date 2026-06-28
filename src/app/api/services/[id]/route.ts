import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  depositAmount: z.number().min(0).optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// GET - Single service
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        stylists: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error("Service GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch service" }, { status: 500 });
  }
}

// PATCH - Update service (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateServiceSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const service = await prisma.service.update({
      where: { id, deletedAt: null },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Service PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE - Soft delete service (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Service deleted" });
  } catch (error) {
    console.error("Service DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete service" }, { status: 500 });
  }
}
