import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const updateCustomerSchema = z.object({
  notes: z.string().optional(),
  loyaltyPoints: z.number().int().min(0).optional(),
  totalVisits: z.number().int().min(0).optional(),
  totalSpent: z.number().min(0).optional(),
  favoriteStylistId: z.string().nullable().optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - List customers with pagination, search, and filtering
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
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
          appointments: {
            select: { id: true, status: true, date: true },
            orderBy: { date: "desc" },
            take: 1,
          },
          memberships: {
            where: { isActive: true },
            include: { plan: true },
            take: 1,
          },
        },
        orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin customers GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}

// POST - Create customer (admin-created)
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const schema = z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
      notes: z.string().optional(),
    });
    const data = schema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    // Create user + customer
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: "pending-setup",
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "CUSTOMER",
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        notes: data.notes,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin customers POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 });
  }
}
