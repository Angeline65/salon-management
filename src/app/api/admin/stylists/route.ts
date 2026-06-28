import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-password";
import { z } from "zod";

const createStylistSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  commissionRate: z.number().min(0).max(1).default(0.4),
  isFeatured: z.boolean().default(false),
  instagramUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
});

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

// GET - List stylists
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
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.deletedAt = null;

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [stylists, total] = await Promise.all([
      prisma.stylist.findMany({
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
              isActive: true,
            },
          },
          appointments: {
            where: { deletedAt: null, status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
            take: 5,
            orderBy: { date: "asc" },
          },
          reviews: {
            select: { rating: true },
            take: 50,
          },
        },
        orderBy: [{ sortOrder: "asc" }, { rating: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stylist.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: stylists,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin stylists GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stylists" }, { status: 500 });
  }
}

// POST - Create stylist
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createStylistSchema.parse(body);

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
    }

    // Create user with STYLIST role
    const passwordHash = await hashPassword("temp-password-" + Date.now());
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "STYLIST",
        emailVerified: true,
      },
    });

    // Create stylist profile
    const stylist = await prisma.stylist.create({
      data: {
        userId: user.id,
        bio: data.bio,
        specialties: data.specialties,
        commissionRate: data.commissionRate,
        isFeatured: data.isFeatured,
        instagramUrl: data.instagramUrl,
        portfolioUrl: data.portfolioUrl,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: stylist }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin stylists POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create stylist" }, { status: 500 });
  }
}
