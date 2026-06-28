import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !["SUPER_ADMIN", "MANAGER"].includes(payload.role)) return null;
  return payload;
}

// GET - Reports data
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year
    const type = searchParams.get("type") || "overview"; // overview, revenue, appointments, customers

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    if (type === "overview") {
      const [
        todayAppointments,
        revenueToday,
        revenueMonth,
        newCustomers,
        totalAppointments,
        completedAppointments,
      ] = await Promise.all([
        prisma.appointment.count({
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            deletedAt: null,
          },
        }),
        prisma.payment.aggregate({
          where: {
            paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: "COMPLETED",
          },
          _sum: { totalAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            paidAt: { gte: startDate },
            status: "COMPLETED",
          },
          _sum: { totalAmount: true },
        }),
        prisma.customer.count({
          where: {
            createdAt: { gte: startDate },
            deletedAt: null,
          },
        }),
        prisma.appointment.count({
          where: {
            createdAt: { gte: startDate },
            deletedAt: null,
          },
        }),
        prisma.appointment.count({
          where: {
            createdAt: { gte: startDate },
            deletedAt: null,
            status: "COMPLETED",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          todayAppointments,
          revenueToday: revenueToday._sum.totalAmount || 0,
          revenueMonth: revenueMonth._sum.totalAmount || 0,
          newCustomers,
          totalAppointments,
          completedAppointments,
          retention: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
        },
      });
    }

    if (type === "revenue") {
      const payments = await prisma.payment.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true, amount: true },
        _count: true,
      });

      const byMethod = await prisma.payment.groupBy({
        by: ["method"],
        where: {
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
        _sum: { totalAmount: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          byStatus: payments,
          byMethod,
          total: payments.reduce((sum, p) => sum + (p._sum.totalAmount || 0), 0),
        },
      });
    }

    if (type === "appointments") {
      const byStatus = await prisma.appointment.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
        },
        _count: true,
      });

      const byStylist = await prisma.appointment.groupBy({
        by: ["stylistId"],
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
          stylistId: { not: null },
        },
        _count: true,
      });

      const topServices = await prisma.appointmentService.groupBy({
        by: ["serviceId"],
        where: {
          appointment: {
            createdAt: { gte: startDate },
            deletedAt: null,
          },
        },
        _count: true,
        orderBy: { _count: { serviceId: "desc" } },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        data: { byStatus, byStylist, topServices },
      });
    }

    if (type === "customers") {
      const newCustomers = await prisma.customer.count({
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
        },
      });

      const totalCustomers = await prisma.customer.count({
        where: { deletedAt: null },
      });

      const topCustomers = await prisma.customer.findMany({
        where: { deletedAt: null },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { appointments: true } },
        },
        orderBy: { totalSpent: "desc" },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        data: { newCustomers, totalCustomers, topCustomers },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    console.error("Admin reports GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
}
