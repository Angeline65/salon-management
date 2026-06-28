import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const applyCouponSchema = z.object({
  code: z.string().min(1),
});

/**
 * GET /api/customer/coupons
 * Returns the customer's available coupons.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER") return forbiddenResponse();

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (!customer) {
      return NextResponse.json({ success: true, data: { available: [], used: [] } });
    }

    const now = new Date();

    // Fetch customer coupons and active promotions in parallel
    const [customerCoupons, activeCoupons] = await Promise.all([
      prisma.customerCoupon.findMany({
        where: { customerId: customer.id },
        include: { coupon: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.findMany({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
        orderBy: { validUntil: "asc" },
      }),
    ]);

    // Separate used from available
    const assignedCouponIds = new Set(customerCoupons.map((cc) => cc.couponId));
    const available = activeCoupons.filter((c) => !assignedCouponIds.has(c.id));

    // Mark used coupons
    const used = customerCoupons.filter((cc) => cc.usedAt !== null).map((cc) => cc.coupon);
    const unused = customerCoupons.filter((cc) => cc.usedAt === null).map((cc) => cc.coupon);

    return NextResponse.json({
      success: true,
      data: {
        available: [...available, ...unused],
        used,
        loyaltyPoints: customer.loyaltyPoints,
      },
    });
  } catch (error) {
    console.error("Get customer coupons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/coupons
 * Validate and apply a coupon code.
 * Returns the coupon details if valid, or an error if invalid/expired.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER") return forbiddenResponse();

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const data = applyCouponSchema.parse(body);

    const now = new Date();

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code not found" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check validity dates
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { success: false, error: "This coupon is not yet valid" },
        { status: 400 }
      );
    }

    if (coupon.validUntil < now) {
      return NextResponse.json(
        { success: false, error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check if customer already has this coupon
    const existingCustomerCoupon = await prisma.customerCoupon.findUnique({
      where: {
        customerId_couponId: {
          customerId: customer.id,
          couponId: coupon.id,
        },
      },
    });

    // If not already assigned, assign it to the customer
    if (!existingCustomerCoupon) {
      await prisma.customerCoupon.create({
        data: {
          customerId: customer.id,
          couponId: coupon.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Apply coupon error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
