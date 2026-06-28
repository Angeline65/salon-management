import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/staff/dashboard
 * Returns aggregated stats for the staff dashboard.
 * Works for all staff roles — shows role-appropriate data.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    // Today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Month boundaries
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (!user.stylist) {
      // For non-stylist staff (receptionists, managers), return basic stats
      const [todayAppointments, monthAppointments] = await Promise.all([
        prisma.appointment.count({
          where: {
            deletedAt: null,
            startTime: { gte: today, lt: tomorrow },
            status: { notIn: ["CANCELLED"] },
          },
        }),
        prisma.appointment.count({
          where: {
            deletedAt: null,
            startTime: { gte: monthStart, lt: tomorrow },
            status: "COMPLETED",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          todayAppointments,
          monthAppointments,
          todayRevenue: 0,
          monthCommission: 0,
          clientRating: 0,
          reviewCount: 0,
          upcomingAppointments: [],
        },
      });
    }

    // Fetch all stats in parallel for stylist
    const [
      todayAppointments,
      todayRevenue,
      monthCompleted,
      stylistData,
      upcomingAppointments,
    ] = await Promise.all([
      // Today's appointments
      prisma.appointment.findMany({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          startTime: { gte: today, lt: tomorrow },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          customer: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          services: {
            include: { service: { select: { name: true, duration: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      }),

      // Today's revenue (completed payments)
      prisma.payment.aggregate({
        where: {
          appointment: {
            stylistId: user.stylist.id,
            deletedAt: null,
            startTime: { gte: today, lt: tomorrow },
          },
          status: "COMPLETED",
        },
        _sum: { totalAmount: true },
      }),

      // This month's completed appointments for commission calculation
      prisma.appointment.findMany({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          status: "COMPLETED",
          endTime: { gte: monthStart },
        },
        include: {
          payment: { select: { totalAmount: true, status: true } },
        },
      }),

      // Stylist data (rating, commission rate)
      prisma.stylist.findUnique({
        where: { id: user.stylist.id },
        select: { commissionRate: true, rating: true, reviewCount: true },
      }),

      // Upcoming appointments (next 5)
      prisma.appointment.findMany({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          startTime: { gte: tomorrow },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: {
          customer: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          services: {
            include: { service: { select: { name: true, duration: true } } },
          },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
    ]);

    // Calculate month commission
    const monthRevenue = monthCompleted.reduce((sum, apt) => {
      if (apt.payment?.status === "COMPLETED") {
        return sum + apt.payment.totalAmount;
      }
      return sum;
    }, 0);

    const commissionRate = stylistData?.commissionRate ?? 0.4;
    const monthCommission = monthRevenue * commissionRate;

    return NextResponse.json({
      success: true,
      data: {
        todayAppointments,
        todayRevenue: todayRevenue._sum.totalAmount ?? 0,
        monthAppointments: monthCompleted.length,
        monthCommission,
        clientRating: stylistData?.rating ?? 0,
        reviewCount: stylistData?.reviewCount ?? 0,
        upcomingAppointments,
      },
    });
  } catch (error) {
    console.error("Staff dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
