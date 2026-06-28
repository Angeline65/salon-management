import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-semibold text-charcoal mb-3">Access Denied</h1>
          <p className="text-charcoal-lighter text-lg mb-2">You don't have permission to view this page.</p>
          <p className="text-charcoal-lighter text-sm">
            Please sign in with an account that has the appropriate permissions.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-3 gold-gradient text-charcoal font-semibold rounded-xl hover:shadow-gold transition-all duration-300 text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-charcoal/15 text-charcoal text-sm font-medium rounded-xl hover:border-gold hover:text-gold transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
