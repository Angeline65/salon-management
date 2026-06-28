import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const createInventorySchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(5),
  unitPrice: z.number().min(0),
  supplierName: z.string().optional(),
  supplierEmail: z.string().email().optional(),
  supplierPhone: z.string().optional(),
  imageUrl: z.string().optional(),
});

const updateInventorySchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  minQuantity: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  supplierName: z.string().optional(),
  supplierEmail: z.string().email().optional(),
  supplierPhone: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - List inventory items
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.isActive = true;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (lowStock) {
      where.quantity = { lte: prisma.inventoryItem.fields.minQuantity };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const lowStockCount = await prisma.inventoryItem.count({
      where: {
        isActive: true,
        quantity: { lte: prisma.inventoryItem.fields.minQuantity },
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
      lowStockCount,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// POST - Create inventory item
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createInventorySchema.parse(body);

    // Check if SKU exists
    const existing = await prisma.inventoryItem.findUnique({ where: { sku: data.sku } });
    if (existing) {
      return NextResponse.json({ success: false, error: "SKU already exists" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.create({ data });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin inventory POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create inventory item" }, { status: 500 });
  }
}
