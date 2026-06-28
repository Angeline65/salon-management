import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(["BOOKING_CONFIRMATION", "APPOINTMENT_REMINDER", "RESCHEDULE", "CANCELLATION", "PAYMENT_RECEIVED", "PROMOTIONAL", "REVIEW_REQUEST", "LOW_INVENTORY"]),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "IN_APP"]),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - List notifications
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin notifications GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST - Create notification
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        title: data.title,
        message: data.message,
        metadata: data.metadata ? (data.metadata as any) : undefined,
        sentAt: data.channel === "IN_APP" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin notifications POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 });
  }
}
