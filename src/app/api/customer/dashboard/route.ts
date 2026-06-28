import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/customer/dashboard
 * Returns aggregated stats for the customer dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (user.role !== "CUSTOMER") return forbiddenResponse();

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: {
          customer: null,
          upcomingAppointments: [],
          recentAppointments: [],
          stats: {
            totalVisits: 0,
            totalSpent: 0,
            loyaltyPoints: 0,
            upcomingCount: 0,
          },
        },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch data in parallel
    const [upcomingAppointments, recentAppointments] = await Promise.all([
      // Upcoming appointments (future, not cancelled)
      prisma.appointment.findMany({
        where: {
          customerId: customer.id,
          deletedAt: null,
          startTime: { gte: today },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          stylist: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          services: {
            include: { service: { select: { name: true, duration: true, price: true } } },
          },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      // Recent completed appointments
      prisma.appointment.findMany({
        where: {
          customerId: customer.id,
          deletedAt: null,
          status: "COMPLETED",
        },
        include: {
          stylist: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          services: {
            include: { service: { select: { name: true, price: true } } },
          },
        },
        orderBy: { endTime: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customer,
        upcomingAppointments,
        recentAppointments,
        stats: {
          totalVisits: customer.totalVisits,
          totalSpent: customer.totalSpent,
          loyaltyPoints: customer.loyaltyPoints,
          upcomingCount: upcomingAppointments.length,
        },
      },
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
