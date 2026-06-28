"use client";

import { useEffect, useState, useCallback } from "react";
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

interface Appointment {
  id: string;
  bookingRef: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  cancellationReason?: string;
  stylist?: { user: { firstName: string; lastName: string } };
  services: Array<{ service: { name: string; duration: number; price: number } }>;
  payment?: { status: string; totalAmount: number };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-green-50 text-green-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-700",
  NO_SHOW: "bg-red-50 text-red-700",
};

export default function CustomerAppointments() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
      });
      if (tab === "upcoming") {
        params.set("upcoming", "true");
      } else {
        params.set("status", "COMPLETED");
      }

      const res = await fetch(`/api/customer/appointments?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data);
        setTotalPages(json.pagination.totalPages);
      } else {
        setError(json.error || "Failed to load appointments");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/customer/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appointmentId: id,
          action: "cancel",
          reason: cancelReason || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        setShowCancelModal(null);
        setCancelReason("");
      } else {
        setError(json.error || "Failed to cancel");
      }
    } catch {
      setError("Failed to cancel appointment");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <CustomerRoute>
      <div className="flex min-h-screen bg-cream">
        <DashboardSidebar
          title="Luxe"
          links={sidebarLinks}
          user={{ name: user ? `${user.firstName} ${user.lastName}` : "Customer", role: "Customer" }}
          onLogout={logout}
        />
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-semibold text-charcoal">My Appointments</h1>
              <p className="text-xs text-charcoal-lighter">View and manage your appointments</p>
            </div>
            <Link href="/booking" className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Book New
            </Link>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-soft w-fit">
              <button
                onClick={() => { setTab("upcoming"); setPage(1); }}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                  tab === "upcoming" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-cream"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => { setTab("past"); setPage(1); }}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                  tab === "past" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-cream"
                }`}
              >
                Past
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-1">
                  {tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
                </h3>
                <p className="text-sm text-charcoal-lighter mb-4">
                  {tab === "upcoming" ? "Book your next visit to see it here" : "Your completed appointments will appear here"}
                </p>
                {tab === "upcoming" && (
                  <Link href="/booking" className="inline-block px-6 py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full">
                    Book Now
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const totalPrice = apt.services.reduce((s, sv) => s + sv.service.price, 0);
                  const canModify = tab === "upcoming" && ["PENDING", "CONFIRMED"].includes(apt.status);

                  return (
                    <div key={apt.id} className="bg-white rounded-2xl shadow-soft p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="sm:min-w-[100px]">
                          <p className="text-sm font-medium text-charcoal">
                            {formatDate(apt.date)}
                          </p>
                          <p className="text-xs text-charcoal-lighter">
                            {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        <div className="w-px h-12 bg-gold/30 hidden sm:block" />

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              {apt.services.map((s, i) => (
                                <p key={i} className="font-medium text-charcoal text-sm">{s.service.name}</p>
                              ))}
                              {apt.stylist && (
                                <p className="text-xs text-charcoal-lighter">
                                  with {apt.stylist.user.firstName} {apt.stylist.user.lastName}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[apt.status]}`}>
                              {apt.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-charcoal-lighter">
                            <span>{apt.services.reduce((s, sv) => s + sv.service.duration, 0)} min</span>
                            <span>{formatCurrency(apt.payment?.totalAmount || totalPrice)}</span>
                            <span className="font-mono text-[10px]">#{apt.bookingRef}</span>
                          </div>

                          {apt.cancellationReason && (
                            <p className="mt-2 text-xs text-red-600">Cancelled: {apt.cancellationReason}</p>
                          )}

                          {canModify && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => setShowCancelModal(apt.id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                              >
                                Cancel
                              </button>
                              <Link
                                href="/booking"
                                className="px-3 py-1.5 text-xs font-medium bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition"
                              >
                                Reschedule
                              </Link>
                            </div>
                          )}

                          {apt.status === "COMPLETED" && tab === "past" && (
                            <div className="mt-3">
                              <Link
                                href={`/customer/reviews?appointment=${apt.id}&stylist=${apt.stylist?.user.firstName || ""}`}
                                className="px-3 py-1.5 text-xs font-medium bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition"
                              >
                                Write a Review
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-xs font-medium bg-white rounded-lg shadow-soft disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-charcoal-lighter">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-xs font-medium bg-white rounded-lg shadow-soft disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-elevated">
            <h3 className="font-display text-lg font-semibold text-charcoal mb-2">Cancel Appointment</h3>
            <p className="text-sm text-charcoal-lighter mb-4">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCancelModal(null); setCancelReason(""); }}
                className="px-4 py-2 text-sm font-medium text-charcoal border border-cream-dark rounded-full hover:bg-cream"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => cancelAppointment(showCancelModal)}
                disabled={actionLoading === showCancelModal}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === showCancelModal ? "Cancelling..." : "Cancel Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerRoute>
  );
}
