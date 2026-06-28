import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/customer/appointments
 * Returns all appointments for the logged-in customer.
 * Supports filtering by status and pagination.
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
      return NextResponse.json({ success: true, data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming") === "true";

    const where: Record<string, unknown> = {
      customerId: customer.id,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (upcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.startTime = { gte: today };
      where.status = { notIn: ["CANCELLED"] };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          stylist: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          services: {
            include: {
              service: { select: { name: true, duration: true, price: true } },
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
    console.error("Get customer appointments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customer/appointments
 * Cancel or reschedule an appointment.
 * Customers can only modify their own appointments.
 */
export async function PATCH(req: NextRequest) {
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
    const { appointmentId, action, reason, newDate, newTime } = body;

    if (!appointmentId || !action) {
      return NextResponse.json(
        { success: false, error: "appointmentId and action are required" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId, deletedAt: null },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Permission check
    if (appointment.customerId !== customer.id) {
      return forbiddenResponse();
    }

    // Can only modify upcoming appointments
    const now = new Date();
    if (appointment.startTime < now) {
      return NextResponse.json(
        { success: false, error: "Cannot modify past appointments" },
        { status: 400 }
      );
    }

    // Can only modify pending or confirmed appointments
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { success: false, error: "Cannot modify appointments in current status" },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};

    if (action === "cancel") {
      updateData = {
        status: "CANCELLED",
        cancellationReason: reason || "Customer requested cancellation",
      };
    } else if (action === "reschedule") {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { success: false, error: "newDate and newTime are required for rescheduling" },
          { status: 400 }
        );
      }

      const appointmentDate = new Date(newDate);
      const [hours, minutes] = newTime.split(":").map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      // Calculate duration from existing appointment
      const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
      const endTime = new Date(startTime.getTime() + durationMs);

      updateData = {
        date: appointmentDate,
        startTime,
        endTime,
        status: "PENDING", // Reset to pending after reschedule
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'cancel' or 'reschedule'" },
        { status: 400 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        stylist: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        services: {
          include: { service: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update customer appointment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
