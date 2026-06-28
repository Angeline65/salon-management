import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  cancellationReason: z.string().optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  stylistId: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: { include: { user: true } },
        stylist: { include: { user: true } },
        services: { include: { service: true } },
        payment: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateAppointmentSchema.parse(body);

    const existing = await prisma.appointment.findUnique({
      where: { id: id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (data.cancellationReason) updateData.cancellationReason = data.cancellationReason;
    if (data.notes) updateData.notes = data.notes;
    if (data.stylistId) updateData.stylistId = data.stylistId;

    if (data.date && data.timeSlot) {
      const appointmentDate = new Date(data.date);
      const [hours, minutes] = data.timeSlot.split(":").map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);

      // Calculate duration from existing services
      const services = await prisma.appointmentService.findMany({
        where: { appointmentId: id },
      });
      const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);

      updateData.date = appointmentDate;
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }

    const appointment = await prisma.appointment.update({
      where: { id: id },
      data: updateData,
      include: {
        customer: { include: { user: true } },
        stylist: { include: { user: true } },
        services: { include: { service: true } },
        payment: true,
      },
    });

    // TODO: Send notification based on status change
    // if (data.status === 'CANCELLED') await sendCancellationNotification(appointment);
    // if (data.date) await sendRescheduleNotification(appointment);

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
