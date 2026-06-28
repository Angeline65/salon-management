import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

const createLeaveSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1, "Reason is required").max(500),
});

/**
 * GET /api/staff/leave
 * Returns leave requests for the logged-in stylist.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    if (!user.stylist) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      stylistId: user.stylist.id,
    };
    if (status) where.status = status;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ success: true, data: leaveRequests });
  } catch (error) {
    console.error("Get leave requests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/leave
 * Submit a new leave request.
 */
export async function POST(req: NextRequest) {
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
    const data = createLeaveSchema.parse(body);

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validation
    if (startDate > endDate) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { success: false, error: "Cannot request leave for past dates" },
        { status: 400 }
      );
    }

    // Check for overlapping leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        stylistId: user.stylist.id,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: "You already have a leave request that overlaps with these dates" },
        { status: 409 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        stylistId: user.stylist.id,
        startDate,
        endDate,
        reason: data.reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: leaveRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create leave request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/staff/leave
 * Cancel a pending leave request (stylist can only cancel their own PENDING requests).
 */
export async function PATCH(req: NextRequest) {
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
    const { leaveId, action } = body;

    if (!leaveId) {
      return NextResponse.json(
        { success: false, error: "leaveId is required" },
        { status: 400 }
      );
    }

    // Only managers/admins can approve/reject
    if (action && !["MANAGER", "SUPER_ADMIN"].includes(user.role)) {
      return forbiddenResponse();
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    // Stylists can only cancel their own pending requests
    if (leaveRequest.stylistId !== user.stylist.id && !["MANAGER", "SUPER_ADMIN"].includes(user.role)) {
      return forbiddenResponse();
    }

    let updateData: Record<string, unknown> = {};

    if (action === "approve") {
      updateData = {
        status: "APPROVED",
        reviewedById: user.id,
        reviewedAt: new Date(),
      };
    } else if (action === "reject") {
      updateData = {
        status: "REJECTED",
        reviewedById: user.id,
        reviewedAt: new Date(),
      };
    } else if (leaveRequest.status === "PENDING") {
      // Stylist cancelling their own request
      await prisma.leaveRequest.delete({ where: { id: leaveId } });
      return NextResponse.json({ success: true, data: { deleted: true } });
    } else {
      return NextResponse.json(
        { success: false, error: "Cannot modify a non-pending leave request" },
        { status: 400 }
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update leave request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}
