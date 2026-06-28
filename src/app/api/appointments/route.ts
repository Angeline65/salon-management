import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateBookingRef } from "@/lib/utils";

const createAppointmentSchema = z.object({
  serviceIds: z.array(z.string()).min(1),
  stylistId: z.string().optional(),
  date: z.string(),
  timeSlot: z.string(),
  customerDetails: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    notes: z.string().optional(),
  }),
  paymentMethod: z.string().optional(),
  couponCode: z.string().optional(),
});

// GET - List appointments (with filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const stylistId = searchParams.get("stylistId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (stylistId) where.stylistId = stylistId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: { include: { user: true } },
          stylist: { include: { user: true } },
          services: { include: { service: true } },
          payment: true,
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
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createAppointmentSchema.parse(body);

    // Get services
    const services = await prisma.service.findMany({
      where: { id: { in: data.serviceIds }, isActive: true },
    });

    if (services.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid services found" },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalDeposit = services.reduce((sum, s) => sum + s.depositAmount, 0);

    // Parse date and time
    const appointmentDate = new Date(data.date);
    const [hours, minutes] = data.timeSlot.split(":").map(Number);
    const startTime = new Date(appointmentDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { user: { email: data.customerDetails.email } },
    });

    if (!customer) {
      const user = await prisma.user.create({
        data: {
          email: data.customerDetails.email,
          passwordHash: "pending-setup",
          firstName: data.customerDetails.firstName,
          lastName: data.customerDetails.lastName,
          phone: data.customerDetails.phone,
          role: "CUSTOMER",
        },
      });
      customer = await prisma.customer.create({
        data: { userId: user.id },
      });
    }

    // Create appointment
    const bookingRef = generateBookingRef();
    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        customerId: customer.id,
        stylistId: data.stylistId || null,
        date: appointmentDate,
        startTime,
        endTime,
        notes: data.customerDetails.notes,
        status: "PENDING",
        services: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.price,
            duration: s.duration,
          })),
        },
        payment: {
          create: {
            customerId: customer.id,
            amount: totalPrice,
            totalAmount: totalPrice,
            depositAmount: totalDeposit,
            invoiceNumber: `INV-${Date.now()}`,
            status: "PENDING",
          },
        },
      },
      include: {
        customer: { include: { user: true } },
        stylist: { include: { user: true } },
        services: { include: { service: true } },
        payment: true,
      },
    });

    // TODO: Send confirmation email/SMS
    // await sendBookingConfirmation(appointment);

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
