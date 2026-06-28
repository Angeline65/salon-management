"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { StaffRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const sidebarLinks = [
  { href: "/staff/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/staff/schedule", label: "My Schedule", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/staff/clients", label: "My Clients", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/staff/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: "/staff/commissions", label: "Commissions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/staff/leave", label: "Leave Requests", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface StaffAppointment {
  id: string;
  bookingRef: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  customer: {
    user: { firstName: string; lastName: string; email: string; phone?: string };
  };
  services: Array<{
    service: { name: string; price: number; duration: number };
  }>;
  payment?: {
    status: string;
    totalAmount: number;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
};

export default function StaffAppointments() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (statusFilter) params.set("status", statusFilter);
      if (dateFilter) {
        const date = new Date(dateFilter);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        params.set("dateFrom", date.toISOString());
        params.set("dateTo", nextDay.toISOString());
      }

      const res = await fetch(`/api/staff/appointments?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data);
        setTotalPages(json.pagination.totalPages);
        setError("");
      } else {
        setError(json.error || "Failed to load appointments");
      }
    } catch {
      setError("Network error loading appointments");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/staff/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appointmentId: id, status }),
      });
      const json = await res.json();
      if (json.success) {
        setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      }
    } catch {
      setError("Failed to update appointment");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusActions = (status: string): Array<{ label: string; value: string }> => {
    switch (status) {
      case "PENDING":
        return [
          { label: "Confirm", value: "CONFIRMED" },
          { label: "Cancel", value: "CANCELLED" },
        ];
      case "CONFIRMED":
        return [
          { label: "Start", value: "IN_PROGRESS" },
          { label: "Cancel", value: "CANCELLED" },
          { label: "No Show", value: "NO_SHOW" },
        ];
      case "IN_PROGRESS":
        return [{ label: "Complete", value: "COMPLETED" }];
      default:
        return [];
    }
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Appointments</h1>
              <p className="text-xs text-charcoal-lighter">View and manage your appointments</p>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-wrap gap-2">
                {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setPage(1); }}
                    className={`px-4 py-2 text-xs font-medium rounded-full transition ${
                      statusFilter === status
                        ? "bg-charcoal text-white"
                        : "bg-white text-charcoal-lighter hover:bg-cream-dark"
                    }`}
                  >
                    {status || "All"}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-white rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>

            {/* Appointment Cards */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-1">No appointments found</h3>
                <p className="text-sm text-charcoal-lighter">
                  {statusFilter || dateFilter ? "Try adjusting your filters" : "Your appointments will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const actions = getStatusActions(apt.status);
                  const totalDuration = apt.services.reduce((s, sv) => s + sv.service.duration, 0);
                  const totalPrice = apt.services.reduce((s, sv) => s + sv.service.price, 0);

                  return (
                    <div key={apt.id} className="bg-white rounded-2xl shadow-soft p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Time Column */}
                        <div className="sm:min-w-[100px] text-center sm:text-left">
                          <p className="text-sm font-medium text-charcoal">
                            {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-xs text-charcoal-lighter">
                            {new Date(apt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-xs text-charcoal-lighter mt-1">
                            {formatDate(apt.date)}
                          </p>
                          <p className="text-xs text-charcoal-lighter">{totalDuration} min</p>
                        </div>

                        <div className="w-px h-16 bg-gold/30 hidden sm:block" />

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-charcoal">
                                {apt.customer.user.firstName} {apt.customer.user.lastName}
                              </p>
                              <p className="text-xs text-charcoal-lighter">{apt.customer.user.email}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[apt.status]}`}>
                              {apt.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {apt.services.map((s, i) => (
                              <span key={i} className="text-xs bg-cream text-charcoal px-3 py-1 rounded-full">
                                {s.service.name} — {formatCurrency(s.service.price)}
                              </span>
                            ))}
                          </div>

                          {apt.notes && (
                            <p className="mt-2 text-xs text-charcoal-lighter italic">Note: {apt.notes}</p>
                          )}

                          {/* Action Buttons */}
                          {actions.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {actions.map((action) => (
                                <button
                                  key={action.value}
                                  onClick={() => updateStatus(apt.id, action.value)}
                                  disabled={updating === apt.id}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                    action.value === "CANCELLED"
                                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                                      : action.value === "COMPLETED"
                                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      : "bg-gold/10 text-gold hover:bg-gold/20"
                                  } disabled:opacity-50`}
                                >
                                  {updating === apt.id ? "..." : action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Revenue */}
                        <div className="text-right">
                          <p className="text-sm font-semibold text-charcoal">
                            {apt.payment?.status === "COMPLETED" ? formatCurrency(apt.payment.totalAmount) : formatCurrency(totalPrice)}
                          </p>
                          <p className="text-xs text-charcoal-lighter">
                            {apt.payment?.status === "COMPLETED" ? "Paid" : apt.payment?.status || "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-xs font-medium bg-white rounded-lg shadow-soft disabled:opacity-50 hover:bg-cream transition"
                >
                  Previous
                </button>
                <span className="text-xs text-charcoal-lighter">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-xs font-medium bg-white rounded-lg shadow-soft disabled:opacity-50 hover:bg-cream transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </StaffRoute>
  );
}
