import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const subscribeSchema = z.object({
  planId: z.string(),
});

/**
 * GET /api/customer/memberships
 * Returns the customer's current and past memberships.
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
      return NextResponse.json({ success: true, data: { current: null, history: [], availablePlans: [] } });
    }

    // Fetch memberships and available plans in parallel
    const [memberships, availablePlans] = await Promise.all([
      prisma.customerMembership.findMany({
        where: { customerId: customer.id },
        include: { plan: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      }),
    ]);

    // Separate current (active) from history
    const current = memberships.find((m) => m.isActive && new Date(m.endDate) > new Date()) || null;
    const history = memberships.filter((m) => !m.isActive || new Date(m.endDate) <= new Date());

    return NextResponse.json({
      success: true,
      data: { current, history, availablePlans },
    });
  } catch (error) {
    console.error("Get customer memberships error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/memberships
 * Subscribe to a membership plan.
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
    const data = subscribeSchema.parse(body);

    // Check if customer already has an active membership
    const existingActive = await prisma.customerMembership.findFirst({
      where: {
        customerId: customer.id,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });

    if (existingActive) {
      return NextResponse.json(
        { success: false, error: "You already have an active membership. Please wait for it to expire before subscribing to a new plan." },
        { status: 409 }
      );
    }

    // Verify the plan exists and is active
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: data.planId, isActive: true },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Membership plan not found or inactive" },
        { status: 404 }
      );
    }

    // Create membership
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const membership = await prisma.customerMembership.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        startDate,
        endDate,
        isActive: true,
      },
      include: { plan: true },
    });

    return NextResponse.json({ success: true, data: membership }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Subscribe to membership error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe to membership" },
      { status: 500 }
    );
  }
}
