import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const createReviewSchema = z.object({
  appointmentId: z.string(),
  stylistId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * GET /api/customer/reviews
 * Returns all reviews written by the logged-in customer.
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
      return NextResponse.json({ success: true, data: [] });
    }

    const reviews = await prisma.review.findMany({
      where: { customerId: customer.id },
      include: {
        stylist: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get customer reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/reviews
 * Create a review for a completed appointment.
 */
export async function POST(req: NextRequest) {
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
    const data = createReviewSchema.parse(body);

    // Verify the appointment belongs to this customer and is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId, deletedAt: null },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.customerId !== customer.id) {
      return forbiddenResponse();
    }

    if (appointment.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Can only review completed appointments" },
        { status: 400 }
      );
    }

    // Check if review already exists for this appointment
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "Review already exists for this appointment" },
        { status: 409 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        customerId: customer.id,
        appointmentId: data.appointmentId,
        stylistId: data.stylistId || appointment.stylistId,
        rating: data.rating,
        comment: data.comment,
        isPublic: true,
      },
      include: {
        stylist: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Update stylist's average rating
    if (review.stylistId) {
      const stats = await prisma.review.aggregate({
        where: { stylistId: review.stylistId, isPublic: true },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.stylist.update({
        where: { id: review.stylistId },
        data: {
          rating: stats._avg.rating || 0,
          reviewCount: stats._count,
        },
      });
    }

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
