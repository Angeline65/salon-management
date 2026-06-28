import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  isAvailable: z.boolean(),
});

/**
 * GET /api/staff/availability
 * Returns all availability slots for the logged-in stylist.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    if (!user.stylist) {
      return NextResponse.json({ success: true, data: [] });
    }

    const availability = await prisma.availability.findMany({
      where: { stylistId: user.stylist.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/staff/availability
 * Upsert availability for a specific day of the week.
 * Can accept a single object or an array for bulk update.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    if (!user.stylist) {
      return NextResponse.json(
        { success: false, error: "Stylist profile not found" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const entries = Array.isArray(body) ? body : [body];

    // Validate all entries
    const validated = entries.map((entry) => availabilitySchema.parse(entry));

    // Upsert each availability entry
    const results = await Promise.all(
      validated.map((data) =>
        prisma.availability.upsert({
          where: {
            stylistId_dayOfWeek: {
              stylistId: user.stylist!.id,
              dayOfWeek: data.dayOfWeek,
            },
          },
          update: {
            startTime: data.startTime,
            endTime: data.endTime,
            breakStart: data.breakStart || null,
            breakEnd: data.breakEnd || null,
            isAvailable: data.isAvailable,
          },
          create: {
            stylistId: user.stylist!.id,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            breakStart: data.breakStart || null,
            breakEnd: data.breakEnd || null,
            isAvailable: data.isAvailable,
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Update availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
