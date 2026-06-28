import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/staff/commissions
 * Returns commission data for the logged-in stylist.
 * Supports period filtering (this month, last month, custom range).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    if (!user.stylist) {
      return NextResponse.json({
        success: true,
        data: {
          totalCommission: 0,
          commissionRate: 0,
          completedAppointments: [],
          monthlyBreakdown: [],
          summary: { totalEarnings: 0, totalAppointments: 0, averagePerAppointment: 0 },
        },
      });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // month | lastMonth | quarter | year
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Find completed appointments for this stylist in the period
    const [completedAppointments, total, stylist] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          status: "COMPLETED",
          endTime: { gte: startDate, lte: endDate },
        },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          services: {
            include: {
              service: { select: { name: true, price: true } },
            },
          },
          payment: {
            select: { totalAmount: true, status: true },
          },
        },
        orderBy: { endTime: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          status: "COMPLETED",
          endTime: { gte: startDate, lte: endDate },
        },
      }),
      prisma.stylist.findUnique({
        where: { id: user.stylist.id },
        select: { commissionRate: true },
      }),
    ]);

    const commissionRate = stylist?.commissionRate ?? 0.4;

    // Calculate total revenue from completed appointments
    const totalRevenue = completedAppointments.reduce((sum, apt) => {
      const paidAmount = apt.payment?.status === "COMPLETED" ? apt.payment.totalAmount : 0;
      return sum + paidAmount;
    }, 0);

    const totalCommission = totalRevenue * commissionRate;

    // Calculate monthly breakdown for the period
    const monthlyMap = new Map<string, { revenue: number; appointments: number; commission: number }>();

    // Get all completed appointments for the full period (no pagination) for breakdown
    const allAppointments = await prisma.appointment.findMany({
      where: {
        stylistId: user.stylist.id,
        deletedAt: null,
        status: "COMPLETED",
        endTime: { gte: startDate, lte: endDate },
      },
      select: {
        endTime: true,
        payment: { select: { totalAmount: true, status: true } },
      },
    });

    for (const apt of allAppointments) {
      const monthKey = `${apt.endTime.getFullYear()}-${String(apt.endTime.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || { revenue: 0, appointments: 0, commission: 0 };
      const paidAmount = apt.payment?.status === "COMPLETED" ? apt.payment.totalAmount : 0;
      existing.revenue += paidAmount;
      existing.appointments += 1;
      existing.commission += paidAmount * commissionRate;
      monthlyMap.set(monthKey, existing);
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Format appointments for response
    const formattedAppointments = completedAppointments.map((apt) => ({
      id: apt.id,
      date: apt.endTime,
      customer: `${apt.customer.user.firstName} ${apt.customer.user.lastName}`,
      services: apt.services.map((s) => ({
        name: s.service.name,
        price: s.service.price,
      })),
      revenue: apt.payment?.status === "COMPLETED" ? apt.payment.totalAmount : 0,
      commission: (apt.payment?.status === "COMPLETED" ? apt.payment.totalAmount : 0) * commissionRate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        commissionRate,
        totalCommission,
        totalRevenue,
        summary: {
          totalEarnings: totalCommission,
          totalAppointments: total,
          totalRevenue,
          averagePerAppointment: total > 0 ? totalCommission / total : 0,
        },
        completedAppointments: formattedAppointments,
        monthlyBreakdown,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("Staff commissions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch commission data" },
      { status: 500 }
    );
  }
}
