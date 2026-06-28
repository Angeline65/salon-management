import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const updatePaymentSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
  method: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "STRIPE", "RAZORPAY"]).optional(),
  notes: z.string().optional(),
  refundAmount: z.number().min(0).optional(),
});

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER", "RECEPTIONIST"].includes(payload.role)) return null;
  return payload;
}

// GET - Single payment
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
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            customer: { include: { user: true } },
            stylist: { include: { user: true } },
            services: { include: { service: true } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Admin payment GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payment" }, { status: 500 });
  }
}

// PATCH - Update payment
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
    const data = updatePaymentSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === "COMPLETED") updateData.paidAt = new Date();
      if (data.status === "REFUNDED" || data.status === "PARTIALLY_REFUNDED") {
        updateData.refundedAt = new Date();
      }
    }
    if (data.method) updateData.method = data.method;
    if (data.notes) updateData.notes = data.notes;
    if (data.refundAmount !== undefined) updateData.refundAmount = data.refundAmount;

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: { appointment: { include: { customer: { include: { user: true } } } } },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Admin payment PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update payment" }, { status: 500 });
  }
}
