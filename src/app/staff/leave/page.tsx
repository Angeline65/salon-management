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

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  reviewedAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-50" },
  APPROVED: { label: "Approved", color: "text-green-700", bgColor: "bg-green-50" },
  REJECTED: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-50" },
};

export default function StaffLeave() {
  const { user, logout } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // New request form
  const [showForm, setShowForm] = useState(false);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/staff/leave?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setLeaveRequests(json.data);
        setError("");
      } else {
        setError(json.error || "Failed to load leave requests");
      }
    } catch {
      setError("Network error loading leave requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formStartDate || !formEndDate || !formReason.trim()) {
      setFormError("All fields are required");
      return;
    }

    if (new Date(formStartDate) > new Date(formEndDate)) {
      setFormError("Start date must be before end date");
      return;
    }

    if (new Date(formStartDate) < new Date()) {
      setFormError("Cannot request leave for past dates");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/staff/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          startDate: formStartDate,
          endDate: formEndDate,
          reason: formReason.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLeaveRequests((prev) => [json.data, ...prev]);
        setShowForm(false);
        setFormStartDate("");
        setFormEndDate("");
        setFormReason("");
      } else {
        setFormError(json.error || "Failed to submit request");
      }
    } catch {
      setFormError("Network error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (id: string) => {
    try {
      const res = await fetch("/api/staff/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setLeaveRequests((prev) => prev.filter((lr) => lr.id !== id));
      }
    } catch {
      setError("Failed to cancel request");
    }
  };

  const getDaysCount = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Count stats
  const pendingCount = leaveRequests.filter((lr) => lr.status === "PENDING").length;
  const approvedCount = leaveRequests.filter((lr) => lr.status === "APPROVED").length;
  const totalDaysApproved = leaveRequests
    .filter((lr) => lr.status === "APPROVED")
    .reduce((sum, lr) => sum + getDaysCount(lr.startDate, lr.endDate), 0);

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
              <h1 className="font-display text-xl font-semibold text-charcoal">Leave Requests</h1>
              <p className="text-xs text-charcoal-lighter">Request time off and track your leave history</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full"
            >
              {showForm ? "Cancel" : "+ New Request"}
            </button>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <p className="text-2xl font-display font-semibold text-charcoal">{pendingCount}</p>
                <p className="text-xs text-charcoal-lighter mt-1">Pending Requests</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <p className="text-2xl font-display font-semibold text-charcoal">{approvedCount}</p>
                <p className="text-xs text-charcoal-lighter mt-1">Approved Requests</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <p className="text-2xl font-display font-semibold text-charcoal">{totalDaysApproved}</p>
                <p className="text-xs text-charcoal-lighter mt-1">Total Days Approved</p>
              </div>
            </div>

            {/* New Request Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-lg font-semibold text-charcoal mb-4">New Leave Request</h2>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        min={formStartDate || new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Reason</label>
                    <textarea
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      placeholder="Please provide a reason for your leave request..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                      required
                    />
                  </div>
                  {formStartDate && formEndDate && new Date(formStartDate) <= new Date(formEndDate) && (
                    <p className="text-xs text-charcoal-lighter">
                      Duration: {getDaysCount(formStartDate, formEndDate)} day{getDaysCount(formStartDate, formEndDate) !== 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full disabled:opacity-50 transition"
                    >
                      {submitting ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter */}
            <div className="flex gap-2">
              {["", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
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

            {/* Leave Request List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-1">No leave requests</h3>
                <p className="text-sm text-charcoal-lighter">
                  {statusFilter ? "No requests with this status" : "Click \"New Request\" to submit a leave request"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((lr) => {
                  const config = statusConfig[lr.status] || statusConfig.PENDING;
                  const days = getDaysCount(lr.startDate, lr.endDate);

                  return (
                    <div key={lr.id} className="bg-white rounded-2xl shadow-soft p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-charcoal-lighter">{days} day{days !== 1 ? "s" : ""}</span>
                          </div>
                          <p className="text-sm font-medium text-charcoal">
                            {formatDate(lr.startDate)} — {formatDate(lr.endDate)}
                          </p>
                          {lr.reason && (
                            <p className="text-xs text-charcoal-lighter mt-1">{lr.reason}</p>
                          )}
                          {lr.reviewedAt && lr.status !== "PENDING" && (
                            <p className="text-xs text-charcoal-lighter mt-1">
                              Reviewed on {formatDate(lr.reviewedAt)}
                            </p>
                          )}
                        </div>
                        {lr.status === "PENDING" && (
                          <button
                            onClick={() => cancelRequest(lr.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </StaffRoute>
  );
}
