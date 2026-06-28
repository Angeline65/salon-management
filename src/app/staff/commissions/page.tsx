"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { StaffRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const sidebarLinks = [
  { href: "/staff/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/staff/schedule", label: "My Schedule", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/staff/clients", label: "My Clients", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/staff/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: "/staff/commissions", label: "Commissions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/staff/leave", label: "Leave Requests", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface CommissionData {
  commissionRate: number;
  totalCommission: number;
  totalRevenue: number;
  summary: {
    totalEarnings: number;
    totalAppointments: number;
    totalRevenue: number;
    averagePerAppointment: number;
  };
  completedAppointments: Array<{
    id: string;
    date: string;
    customer: string;
    services: Array<{ name: string; price: number }>;
    revenue: number;
    commission: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    appointments: number;
    commission: number;
  }>;
}

export default function StaffCommissions() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, pageSize: "100" });
      const res = await fetch(`/api/staff/commissions?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError("");
      } else {
        setError(json.error || "Failed to load commissions");
      }
    } catch {
      setError("Network error loading commissions");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <StaffRoute>
      <div className="flex min-h-screen bg-cream">
        <DashboardSidebar
          title="Staff Portal"
          links={sidebarLinks}
          user={{ name: user ? `${user.firstName} ${user.lastName}` : "Staff Member", role: user?.role || "Staff" }}
          onLogout={logout}
        />
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-charcoal">Commissions</h1>
              <p className="text-xs text-charcoal-lighter">
                {data ? `${(data.commissionRate * 100).toFixed(0)}% commission rate` : "Track your earnings"}
              </p>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Period Filter */}
            <div className="flex gap-2">
              {[
                { value: "month", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                { value: "quarter", label: "This Quarter" },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : data ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-2xl font-display font-semibold text-charcoal">
                      {formatCurrency(data.summary.totalEarnings)}
                    </p>
                    <p className="text-xs text-charcoal-lighter mt-1">Total Commission</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-2xl font-display font-semibold text-charcoal">
                      {formatCurrency(data.summary.totalRevenue)}
                    </p>
                    <p className="text-xs text-charcoal-lighter mt-1">Total Revenue Generated</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-2xl font-display font-semibold text-charcoal">
                      {data.summary.totalAppointments}
                    </p>
                    <p className="text-xs text-charcoal-lighter mt-1">Completed Appointments</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-2xl font-display font-semibold text-charcoal">
                      {formatCurrency(data.summary.averagePerAppointment)}
                    </p>
                    <p className="text-xs text-charcoal-lighter mt-1">Avg. per Appointment</p>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                {data.monthlyBreakdown.length > 1 && (
                  <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Monthly Breakdown</h2>
                    <div className="space-y-3">
                      {data.monthlyBreakdown.map((m) => {
                        const maxCommission = Math.max(...data.monthlyBreakdown.map((x) => x.commission));
                        const barWidth = maxCommission > 0 ? (m.commission / maxCommission) * 100 : 0;
                        return (
                          <div key={m.month} className="flex items-center gap-4">
                            <p className="text-sm text-charcoal min-w-[80px]">{formatMonth(m.month)}</p>
                            <div className="flex-1">
                              <div className="h-6 bg-cream rounded-full overflow-hidden">
                                <div
                                  className="h-full gold-gradient rounded-full transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right min-w-[80px]">
                              <p className="text-sm font-medium text-charcoal">{formatCurrency(m.commission)}</p>
                              <p className="text-xs text-charcoal-lighter">{m.appointments} appts</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Appointments Detail */}
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="font-display text-lg font-semibold text-charcoal mb-4">
                    Completed Appointments ({data.completedAppointments.length})
                  </h2>
                  {data.completedAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-charcoal-lighter">No completed appointments in this period</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-cream border-b border-cream-dark">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Client</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Services</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Revenue</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Commission</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-dark">
                          {data.completedAppointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-cream/50">
                              <td className="px-4 py-3 text-sm text-charcoal">
                                {new Date(apt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-charcoal">{apt.customer}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {apt.services.map((s, i) => (
                                    <span key={i} className="text-xs text-charcoal-lighter">{s.name}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-charcoal">
                                {formatCurrency(apt.revenue)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-gold">
                                {formatCurrency(apt.commission)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-cream border-t border-cream-dark">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-sm font-medium text-charcoal">Total</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-charcoal">
                              {formatCurrency(data.totalRevenue)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gold">
                              {formatCurrency(data.totalCommission)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </StaffRoute>
  );
}
