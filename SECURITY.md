# Security Implementation Guide

## Overview

This document outlines the authentication and authorization security measures implemented in the Luxe Salon Platform.

## Authentication Flow

### 1. Login Process

The login page (`/login`) provides a standard authentication form:
- Users enter email and password
- Credentials are validated against the database
- Upon successful authentication, a JWT token is generated
- Users are automatically redirected based on their role

**No quick access buttons are visible to end users.**

### 2. Role-Based Redirection

After successful login, users are automatically redirected to their appropriate dashboard:

```typescript
// From use-auth.ts
const handleLogin = async (email: string, password: string) => {
  // ... authentication logic ...
  
  if (data.success) {
    login(data.data.user, data.data.tokens);
    
    // Role-based redirection
    const userRole = data.data.user.role;
    if (userRole === "SUPER_ADMIN" || userRole === "MANAGER") {
      router.push("/admin/dashboard");
    } else if (userRole === "STYLIST" || userRole === "RECEPTIONIST") {
      router.push("/staff/dashboard");
    } else {
      router.push("/customer/dashboard");
    }
  }
};
```

### 3. User Roles

The system supports five user roles:

- **CUSTOMER**: Can book appointments, view their profile
- **STYLIST**: Can view their schedule, manage availability
- **RECEPTIONIST**: Can manage appointments, process walk-ins
- **MANAGER**: Can access admin dashboard, manage services and staff
- **SUPER_ADMIN**: Full system access

## Protected Routes

### Client-Side Protection

All dashboard pages are wrapped with role-specific route guards:

```typescript
// Admin Dashboard
<AdminRoute>
  {/* Admin content */}
</AdminRoute>

// Staff Dashboard
<StaffRoute>
  {/* Staff content */}
</StaffRoute>

// Customer Dashboard
<CustomerRoute>
  {/* Customer content */}
</CustomerRoute>
```

### Server-Side Protection (Middleware)

The `middleware.ts` file provides additional server-side protection:

- Checks for authentication token on protected routes
- Validates user role against route permissions
- Redirects unauthorized users to login or unauthorized page

### Route Access Matrix

| Route | CUSTOMER | STYLIST | RECEPTIONIST | MANAGER | SUPER_ADMIN |
|-------|----------|---------|--------------|---------|-------------|
| `/admin/*` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/staff/*` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/customer/*` | ✅ | ❌ | ❌ | ❌ | ❌ |

## Security Features

### 1. JWT Authentication

- Tokens are signed with HS256 algorithm
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- Tokens are stored in httpOnly cookies

### 2. Password Security

- Passwords are hashed using bcrypt (12 rounds)
- Minimum password length: 8 characters
- Passwords are never stored in plain text

### 3. Route Protection

- **Client-side**: Route guard components check authentication before rendering
- **Server-side**: Middleware validates tokens and roles on every request
- **API routes**: Require valid authentication token in headers

### 4. Unauthorized Access Handling

When a user tries to access a restricted route:
1. If not authenticated → Redirect to `/login`
2. If authenticated but wrong role → Redirect to `/unauthorized`
3. Unauthorized page provides options to sign in with correct credentials or return home

## Implementation Details

### Protected Route Component

```typescript
// src/components/layout/protected-route.tsx

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (allowedRoles && !hasRole(allowedRoles)) {
        router.push("/unauthorized");
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, hasRole, router]);

  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

### Middleware

```typescript
// src/middleware.ts

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Role validation
  const tokenPayload = JSON.parse(atob(authToken.split(".")[1]));
  const userRole = tokenPayload.role;
  
  if (isAdminRoute && !isAdmin(userRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  return NextResponse.next();
}
```

## Testing the Security

### Test Cases

1. **Unauthenticated Access**
   - Try accessing `/admin/dashboard` without logging in
   - Expected: Redirect to `/login`

2. **Wrong Role Access**
   - Login as CUSTOMER, try accessing `/admin/dashboard`
   - Expected: Redirect to `/unauthorized`

3. **Valid Access**
   - Login as MANAGER, access `/admin/dashboard`
   - Expected: Dashboard loads successfully

4. **Token Expiration**
   - Wait for token to expire
   - Try accessing any protected route
   - Expected: Redirect to `/login`

## Best Practices

### For Development

1. Always test with different user roles
2. Verify route protection in browser DevTools
3. Check network requests for proper token handling
4. Test token expiration scenarios

### For Production

1. Use HTTPS for all communications
2. Set secure cookie flags (httpOnly, secure, sameSite)
3. Implement rate limiting on login endpoint
4. Add CSRF protection
5. Regular security audits
6. Monitor for suspicious login attempts

## Files Modified

- `src/app/login/page.tsx` - Removed quick access buttons, added proper form submission
- `src/hooks/use-auth.ts` - Added role-based redirection after login
- `src/app/admin/dashboard/page.tsx` - Wrapped with AdminRoute
- `src/app/staff/dashboard/page.tsx` - Wrapped with StaffRoute
- `src/app/customer/dashboard/page.tsx` - Wrapped with CustomerRoute
- `src/components/layout/protected-route.tsx` - New file with route guards
- `src/app/unauthorized/page.tsx` - New unauthorized access page
- `src/middleware.ts` - New server-side route protection

## Conclusion

The authentication system now follows security best practices:
- No authentication bypass options visible to users
- Proper role-based access control
- Both client-side and server-side protection
- Clear unauthorized access handling
- Secure token management

All protected routes require proper authentication and appropriate role permissions.
