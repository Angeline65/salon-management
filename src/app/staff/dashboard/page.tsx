"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { StaffRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const links = [
  { href: "/staff/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/staff/schedule", label: "My Schedule", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/staff/clients", label: "My Clients", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/staff/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: "/staff/commissions", label: "Commissions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/staff/leave", label: "Leave Requests", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
];

interface DashboardData {
  todayAppointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    customer: { user: { firstName: string; lastName: string } };
    services: Array<{ service: { name: string; duration: number } }>;
  }>;
  todayRevenue: number;
  monthCommission: number;
  clientRating: number;
  reviewCount: number;
  upcomingAppointments: Array<{
    id: string;
    startTime: string;
    customer: { user: { firstName: string; lastName: string } };
    services: Array<{ service: { name: string } }>;
  }>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/staff/dashboard", { credentials: "include" });
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

  const todayCount = data?.todayAppointments?.length ?? 0;

  return (
    <StaffRoute>
      <div className="flex min-h-screen bg-cream">
        <DashboardSidebar
          title="Staff Portal"
          links={links}
          user={{
            name: user ? `${user.firstName} ${user.lastName}` : "Staff Member",
            role: user?.role || "Staff",
          }}
          onLogout={logout}
        />
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-charcoal">
                {getGreeting()}, {user?.firstName || "Staff Member"}
              </h1>
              <p className="text-xs text-charcoal-lighter">
                {loading ? "Loading..." : `You have ${todayCount} appointment${todayCount !== 1 ? "s" : ""} today`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-charcoal-lighter">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
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
                label="Today's Appointments"
                value={loading ? "..." : String(todayCount)}
              />
              <StatCard
                label="Client Rating"
                value={loading ? "..." : data ? `${data.clientRating.toFixed(1)}\u2605` : "N/A"}
                subtitle={data && data.reviewCount > 0 ? `${data.reviewCount} reviews` : undefined}
              />
              <StatCard
                label="Commission This Month"
                value={loading ? "..." : formatCurrency(data?.monthCommission ?? 0)}
              />
              <StatCard
                label="Today's Revenue"
                value={loading ? "..." : formatCurrency(data?.todayRevenue ?? 0)}
              />
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="font-display text-lg font-semibold text-charcoal mb-6">
                Today&apos;s Schedule
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-cream rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !data?.todayAppointments?.length ? (
                <EmptyState message="No appointments scheduled for today" />
              ) : (
                <div className="space-y-3">
                  {data.todayAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 bg-cream rounded-xl">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium text-charcoal">
                          {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {new Date(apt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-gold/30" />
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-sm">
                          {apt.customer.user.firstName} {apt.customer.user.lastName}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {apt.services.map((s) => s.service.name).join(", ")}
                        </p>
                      </div>
                      <div className="text-xs text-charcoal-lighter">
                        {apt.services.reduce((sum, s) => sum + s.service.duration, 0)} min
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="font-display text-lg font-semibold text-charcoal mb-6">
                Upcoming Appointments
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 bg-cream rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !data?.upcomingAppointments?.length ? (
                <EmptyState message="No upcoming appointments" />
              ) : (
                <div className="space-y-3">
                  {data.upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 bg-cream rounded-xl">
                      <div className="text-center min-w-[80px]">
                        <p className="text-sm font-medium text-charcoal">
                          {new Date(apt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-gold/30" />
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-sm">
                          {apt.customer.user.firstName} {apt.customer.user.lastName}
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {apt.services.map((s) => s.service.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </StaffRoute>
  );
}

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft">
      <p className="text-2xl font-display font-semibold text-charcoal">{value}</p>
      <p className="text-xs text-charcoal-lighter mt-1">{label}</p>
      {subtitle && <p className="text-xs text-charcoal-lighter mt-0.5">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <svg className="w-12 h-12 mx-auto mb-3 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-sm text-charcoal-lighter">{message}</p>
    </div>
  );
}
