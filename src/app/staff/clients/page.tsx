"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { StaffRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";

const sidebarLinks = [
  { href: "/staff/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/staff/schedule", label: "My Schedule", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/staff/clients", label: "My Clients", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/staff/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: "/staff/commissions", label: "Commissions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/staff/leave", label: "Leave Requests", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface ClientData {
  id: string;
  user: { firstName: string; lastName: string; email: string; phone?: string };
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: string | null;
  appointments: Array<{
    id: string;
    date: string;
    status: string;
    services: Array<{ service: { name: string } }>;
  }>;
}

export default function StaffClients() {
  const { user, logout } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
        sortBy,
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/staff/clients?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
        setError("");
      } else {
        setError(json.error || "Failed to load clients");
      }
    } catch {
      setError("Network error loading clients");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients();
    }, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [fetchClients, search]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
              <h1 className="font-display text-xl font-semibold text-charcoal">My Clients</h1>
              <p className="text-xs text-charcoal-lighter">{total} total clients</p>
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
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-lighter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-4 py-2.5 bg-white rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                <option value="recent">Most Recent</option>
                <option value="name">By Name</option>
                <option value="visits">By Visits</option>
              </select>
            </div>

            {/* Client List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-1">No clients found</h3>
                <p className="text-sm text-charcoal-lighter">
                  {search ? "Try a different search term" : "Your clients will appear here after their first appointment"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => {
                  const isExpanded = expandedClient === client.id;
                  return (
                    <div key={client.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                      <button
                        onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-cream/50 transition text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gold-muted text-gold flex items-center justify-center text-sm font-display font-bold">
                          {client.user.firstName[0]}{client.user.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-charcoal text-sm">
                            {client.user.firstName} {client.user.lastName}
                          </p>
                          <p className="text-xs text-charcoal-lighter truncate">{client.user.email}</p>
                        </div>
                        <div className="hidden sm:flex gap-6 text-center">
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{client.visitCount}</p>
                            <p className="text-xs text-charcoal-lighter">Visits</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{formatCurrency(client.totalSpent)}</p>
                            <p className="text-xs text-charcoal-lighter">Total Spent</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-charcoal">
                              {client.lastVisit ? formatDate(client.lastVisit) : "N/A"}
                            </p>
                            <p className="text-xs text-charcoal-lighter">Last Visit</p>
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-charcoal-lighter transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-4 border-t border-cream-dark pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="bg-cream rounded-xl p-3">
                              <p className="text-xs text-charcoal-lighter">Phone</p>
                              <p className="text-sm font-medium text-charcoal">{client.user.phone || "Not provided"}</p>
                            </div>
                            <div className="bg-cream rounded-xl p-3">
                              <p className="text-xs text-charcoal-lighter">Loyalty Points</p>
                              <p className="text-sm font-medium text-charcoal">{client.loyaltyPoints}</p>
                            </div>
                            <div className="bg-cream rounded-xl p-3">
                              <p className="text-xs text-charcoal-lighter">Member Since</p>
                              <p className="text-sm font-medium text-charcoal">
                                {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          <h4 className="text-sm font-medium text-charcoal mb-3">Recent Appointments</h4>
                          {client.appointments.length === 0 ? (
                            <p className="text-xs text-charcoal-lighter">No appointment history</p>
                          ) : (
                            <div className="space-y-2">
                              {client.appointments.map((apt) => (
                                <div key={apt.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                                  <div className="text-center min-w-[60px]">
                                    <p className="text-xs font-medium text-charcoal">{formatDate(apt.date)}</p>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-charcoal-lighter">
                                      {apt.services.map((s) => s.service.name).join(", ")}
                                    </p>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                    apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                                    "bg-yellow-100 text-yellow-700"
                                  }`}>
                                    {apt.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
                <span className="text-xs text-charcoal-lighter">
                  Page {page} of {totalPages}
                </span>
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
