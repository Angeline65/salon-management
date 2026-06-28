import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/staff/schedule
 * Returns the stylist's availability slots and appointments for a given week.
 * Query params: weekStart (ISO date string, defaults to current Monday)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();
    if (!user.stylist) {
      return NextResponse.json({
        success: true,
        data: { availability: [], appointments: [], blockedDates: [] },
      });
    }

    const { searchParams } = new URL(req.url);
    const weekStartParam = searchParams.get("weekStart");

    // Calculate the start of the requested week (Monday)
    let weekStart: Date;
    if (weekStartParam) {
      weekStart = new Date(weekStartParam);
    } else {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
      weekStart = new Date(today.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Fetch availability, appointments, and blocked dates in parallel
    const [availability, appointments, blockedDates] = await Promise.all([
      // Weekly availability template
      prisma.availability.findMany({
        where: { stylistId: user.stylist.id },
        orderBy: { dayOfWeek: "asc" },
      }),

      // Appointments for the week
      prisma.appointment.findMany({
        where: {
          stylistId: user.stylist.id,
          deletedAt: null,
          startTime: { gte: weekStart, lt: weekEnd },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
          services: {
            include: {
              service: { select: { name: true, duration: true, price: true } },
            },
          },
        },
        orderBy: { startTime: "asc" },
      }),

      // Blocked dates for the week
      prisma.blockedDate.findMany({
        where: {
          stylistId: user.stylist.id,
          date: { gte: weekStart, lt: weekEnd },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        availability,
        appointments,
        blockedDates,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error("Staff schedule error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
