import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/staff/appointments
 * Returns appointments for the logged-in stylist (or all if manager/admin).
 * Supports filtering by status, date range, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const stylistId = searchParams.get("stylistId");

    // Build where clause
    const where: Record<string, unknown> = { deletedAt: null };

    // Staff members can only see their own appointments (unless manager/admin)
    if (user.role === "STYLIST" || user.role === "RECEPTIONIST") {
      if (user.stylist) {
        where.stylistId = user.stylist.id;
      } else {
        // Stylist profile not found — return empty
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page, pageSize, totalPages: 0 },
        });
      }
    } else if (stylistId) {
      // Manager/Admin can filter by specific stylist
      where.stylistId = stylistId;
    }

    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) (where.startTime as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.startTime as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true },
              },
            },
          },
          stylist: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          services: {
            include: {
              service: {
                select: { name: true, price: true, duration: true },
              },
            },
          },
          payment: {
            select: { status: true, totalAmount: true },
          },
        },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Staff appointments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/staff/appointments
 * Update appointment status (e.g. check-in, complete, no-show).
 * Only the assigned stylist or a manager/admin can update.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, error: "appointmentId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId, deletedAt: null },
      include: { payment: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Permission check: stylists can only update their own appointments
    if (user.role === "STYLIST" && appointment.stylistId !== user.stylist?.id) {
      return forbiddenResponse();
    }

    // Update
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        customer: { include: { user: { select: { firstName: true, lastName: true } } } },
        services: { include: { service: true } },
        payment: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
