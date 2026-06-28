"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AdminRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/admin/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/admin/services", label: "Services", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { href: "/admin/stylists", label: "Stylists", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: "/admin/customers", label: "Customers", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface OverviewData {
  todayAppointments: number;
  revenueToday: number;
  revenueMonth: number;
  newCustomers: number;
  totalAppointments: number;
  completedAppointments: number;
  retention: number;
}

export default function AdminReports() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState("month");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?period=${period}&type=overview`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      } else {
        setError(data.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-cream">
        <DashboardSidebar 
          title="Luxe Admin" 
          links={links} 
          variant="dark" 
          user={{ 
            name: user ? `${user.firstName} ${user.lastName}` : "Admin User", 
            role: user?.role || "Admin" 
          }}
          onLogout={logout}
        />
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-charcoal">Reports</h1>
              <p className="text-xs text-charcoal-lighter">Business intelligence and analytics</p>
            </div>
          </header>
          <div className="p-6 space-y-8">
            <div className="flex gap-2">
              {[
                { value: "day", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 text-xs font-medium rounded-full transition ${
                    period === p.value
                      ? "bg-charcoal text-white"
                      : "bg-white text-charcoal-lighter hover:bg-cream-dark"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">Loading reports...</p></div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-red-600">{error}</p></div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-xs text-charcoal-lighter mb-1">Today's Appointments</p>
                    <p className="text-2xl font-display font-semibold text-charcoal">{overview.todayAppointments}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-xs text-charcoal-lighter mb-1">Revenue Today</p>
                    <p className="text-2xl font-display font-semibold text-charcoal">{formatCurrency(overview.revenueToday)}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-xs text-charcoal-lighter mb-1">Revenue (Period)</p>
                    <p className="text-2xl font-display font-semibold text-charcoal">{formatCurrency(overview.revenueMonth)}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-xs text-charcoal-lighter mb-1">New Customers</p>
                    <p className="text-2xl font-display font-semibold text-charcoal">{overview.newCustomers}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal mb-6">Appointments Overview</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-charcoal font-medium">Total Appointments</span>
                          <span className="text-charcoal-lighter">{overview.totalAppointments}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-charcoal font-medium">Completed</span>
                          <span className="text-charcoal-lighter">{overview.completedAppointments}</span>
                        </div>
                        <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                          <div
                            className="h-full gold-gradient rounded-full"
                            style={{ width: `${overview.totalAppointments > 0 ? (overview.completedAppointments / overview.totalAppointments) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-charcoal font-medium">Completion Rate</span>
                          <span className="text-charcoal-lighter">{overview.retention.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                          <div className="h-full gold-gradient rounded-full" style={{ width: `${overview.retention}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal mb-6">Revenue Breakdown</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal font-medium">Today</span>
                        <span className="text-charcoal font-semibold">{formatCurrency(overview.revenueToday)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal font-medium">Period Total</span>
                        <span className="text-charcoal font-semibold">{formatCurrency(overview.revenueMonth)}</span>
                      </div>
                      <div className="pt-4 border-t border-cream-dark">
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal font-medium">Avg per Appointment</span>
                          <span className="text-charcoal font-semibold">
                            {overview.totalAppointments > 0
                              ? formatCurrency(overview.revenueMonth / overview.totalAppointments)
                              : formatCurrency(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12"><p className="text-charcoal-lighter">No data available</p></div>
            )}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
