import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerUser, isStaffRole, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

/**
 * GET /api/staff/clients
 * Returns the stylist's unique clients (customers who have booked this stylist).
 * Supports search, pagination, and sorting.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) return unauthorizedResponse();
    if (!isStaffRole(user.role)) return forbiddenResponse();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "recent"; // recent | name | visits

    if (!user.stylist) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { total: 0, page, pageSize, totalPages: 0 },
      });
    }

    // Find unique customers who have appointments with this stylist
    // We use a subquery approach: find all customer IDs from appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        stylistId: user.stylist.id,
        deletedAt: null,
      },
      select: { customerId: true },
      distinct: ["customerId"],
    });

    const customerIds = [...new Set(appointments.map((a) => a.customerId))];

    if (customerIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { total: 0, page, pageSize, totalPages: 0 },
      });
    }

    // Build where clause for customers
    const where: Record<string, unknown> = {
      id: { in: customerIds },
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
      ];
    }

    // Determine sort order
    let orderBy: Record<string, unknown> = { createdAt: "desc" };
    if (sortBy === "name") {
      orderBy = { user: { firstName: "asc" } };
    } else if (sortBy === "visits") {
      orderBy = { totalVisits: "desc" };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
          appointments: {
            where: {
              stylistId: user.stylist.id,
              deletedAt: null,
            },
            select: {
              id: true,
              date: true,
              status: true,
              services: {
                include: {
                  service: { select: { name: true } },
                },
              },
            },
            orderBy: { date: "desc" },
            take: 3, // Last 3 appointments for preview
          },
          _count: {
            select: {
              appointments: {
                where: {
                  stylistId: user.stylist.id,
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: orderBy as any,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    // Enrich with visit count and last visit date
    const enriched = customers.map((customer) => ({
      ...customer,
      visitCount: customer._count.appointments,
      lastVisit: customer.appointments[0]?.date || null,
      _count: undefined, // remove raw count from response
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Staff clients error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
