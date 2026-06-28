import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createAccessToken, ACCESS_TOKEN_MAX_AGE } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in httpOnly cookie
  const authToken = request.cookies.get("auth-token")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/unauthorized", "/about", "/services", "/pricing", "/team", "/gallery", "/testimonials", "/contact", "/faq", "/blog", "/booking"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/admin", "/staff", "/customer"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If no auth token at all, redirect to login
  if (!authToken) {
    const refreshToken = request.cookies.get("refresh-token")?.value;
    // If there's also no refresh token, definitely redirect
    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If there's a refresh token but no access token, let it through —
    // the /api/auth/me call on the client will auto-refresh.
  }

  let userRole: string | undefined;
  let needsTokenRefresh = false;

  // Verify JWT signature and check expiry
  const payload = await verifyToken(authToken || "");

  if (payload && payload.type === "access") {
    userRole = payload.role;
  } else {
    // Access token is invalid/expired — try the refresh token
    const refreshToken = request.cookies.get("refresh-token")?.value;

    if (refreshToken) {
      const refreshPayload = await verifyToken(refreshToken);

      if (refreshPayload && refreshPayload.type === "refresh") {
        // We need to look up the user's role from the DB since the refresh
        // token doesn't carry a role claim.  Because middleware cannot do
        // async DB calls in the Edge runtime without a driver, we instead
        // let the request through and rely on the client-side `/api/auth/me`
        // call (which *can* refresh and set a new cookie).
        needsTokenRefresh = true;
      }
    }

    if (!needsTokenRefresh) {
      // Both tokens are invalid — redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Token is valid, check role-based access
  if (userRole) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isStaffRoute = pathname.startsWith("/staff");
    const isCustomerRoute = pathname.startsWith("/customer");

    if (isAdminRoute && userRole !== "SUPER_ADMIN" && userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (isStaffRoute && !["STYLIST", "RECEPTIONIST", "MANAGER", "SUPER_ADMIN"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (isCustomerRoute && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  const response = NextResponse.next();

  // When we detected a valid refresh token but no valid access token,
  // we cannot look up the user's role from middleware (Edge runtime).
  // Instead, we let the request through — the client-side useAuth hook
  // will call /api/auth/me which handles the refresh transparently.
  // This prevents a redirect loop while still protecting the route.
  if (needsTokenRefresh) {
    // Add a header so client-side code knows a refresh is pending
    response.headers.set("x-auth-refresh-needed", "true");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately with their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
