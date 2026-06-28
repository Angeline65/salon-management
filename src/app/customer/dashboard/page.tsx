"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CustomerRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const sidebarLinks = [
  { href: "/customer/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/customer/appointments", label: "My Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/customer/profile", label: "My Profile", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { href: "/customer/reviews", label: "My Reviews", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { href: "/customer/membership", label: "Membership", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
  { href: "/customer/coupons", label: "Coupons", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
];

interface DashboardData {
  customer: {
    loyaltyPoints: number;
    totalVisits: number;
    totalSpent: number;
  } | null;
  upcomingAppointments: Array<{
    id: string;
    startTime: string;
    status: string;
    stylist?: { user: { firstName: string; lastName: string } };
    services: Array<{ service: { name: string } }>;
  }>;
  recentAppointments: Array<{
    id: string;
    date: string;
    stylist?: { user: { firstName: string; lastName: string } };
    services: Array<{ service: { name: string } }>;
  }>;
  stats: {
    totalVisits: number;
    totalSpent: number;
    loyaltyPoints: number;
    upcomingCount: number;
  };
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/customer/dashboard", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load dashboard");
        }
      } catch {
        setError("Network error loading dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <CustomerRoute>
      <div className="flex min-h-screen bg-cream">
        <DashboardSidebar
          title="Luxe"
          links={sidebarLinks}
          user={{
            name: user ? `${user.firstName} ${user.lastName}` : "Customer",
            role: "Customer",
          }}
          onLogout={logout}
        />
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4">
            <h1 className="font-display text-xl font-semibold text-charcoal">
              Welcome back, {user?.firstName || "Customer"}
            </h1>
            <p className="text-xs text-charcoal-lighter">
              {loading ? "Loading..." : `You have ${data?.stats.upcomingCount || 0} upcoming appointment${data?.stats.upcomingCount !== 1 ? "s" : ""}`}
            </p>
          </header>

          <div className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Upcoming Appointments"
                value={loading ? "..." : String(data?.stats.upcomingCount || 0)}
              />
              <StatCard
                label="Total Visits"
                value={loading ? "..." : String(data?.stats.totalVisits || 0)}
              />
              <StatCard
                label="Loyalty Points"
                value={loading ? "..." : String(data?.stats.loyaltyPoints || 0)}
              />
              <StatCard
                label="Total Spent"
                value={loading ? "..." : formatCurrency(data?.stats.totalSpent || 0)}
              />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-charcoal">Upcoming Appointments</h2>
                <Link href="/booking" className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
                  Book New
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-cream rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !data?.upcomingAppointments?.length ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-charcoal-lighter mb-3">No upcoming appointments</p>
                  <Link href="/booking" className="inline-block px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
                    Book Your Next Visit
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-sm">
                          {apt.services.map((s) => s.service.name).join(", ")}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {apt.stylist && `${apt.stylist.user.firstName} ${apt.stylist.user.lastName} · `}
                          {formatDate(apt.startTime)} ·{" "}
                          {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        apt.status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Visits */}
            {data?.recentAppointments && data.recentAppointments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-lg font-semibold text-charcoal mb-6">Recent Visits</h2>
                <div className="space-y-3">
                  {data.recentAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-sm">
                          {apt.services.map((s) => s.service.name).join(", ")}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {apt.stylist && `${apt.stylist.user.firstName} ${apt.stylist.user.lastName} · `}
                          {formatDate(apt.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </CustomerRoute>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      <p className="text-2xl font-display font-semibold text-charcoal">{value}</p>
      <p className="text-xs text-charcoal-lighter mt-1">{label}</p>
    </div>
  );
}
