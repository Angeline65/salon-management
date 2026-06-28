"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AdminRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatCurrency } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/admin/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/admin/services", label: "Services", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { href: "/admin/stylists", label: "Stylists", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: "/admin/customers", label: "Customers", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface Appointment {
  id: string;
  bookingRef: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  customer: {
    user: { firstName: string; lastName: string; email: string };
  };
  stylist?: {
    user: { firstName: string; lastName: string };
  };
  services: Array<{
    service: { name: string; price: number };
  }>;
  payment?: {
    status: string;
    totalAmount: number;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-green-50 text-green-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-gray-50 text-gray-700",
  CANCELLED: "bg-red-50 text-red-700",
  NO_SHOW: "bg-red-50 text-red-700",
};

export default function AdminAppointments() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/appointments?${params}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError(data.error || "Failed to fetch appointments");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Appointments</h1>
              <p className="text-xs text-charcoal-lighter">Manage all salon appointments</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + New Appointment
            </button>
          </header>
          <div className="p-6 space-y-6">
            <div className="flex gap-2">
              {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
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

            {loading ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">No appointments found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Booking Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Stylist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-cream/50">
                        <td className="px-6 py-4 text-sm font-mono text-charcoal">{apt.bookingRef}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-charcoal">{apt.customer.user.firstName} {apt.customer.user.lastName}</p>
                          <p className="text-xs text-charcoal-lighter">{apt.customer.user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">
                          {apt.stylist ? `${apt.stylist.user.firstName} ${apt.stylist.user.lastName}` : "Unassigned"}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal">{formatDate(apt.date)}</p>
                          <p className="text-xs text-charcoal-lighter">
                            {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {apt.services.map((s, i) => (
                              <span key={i} className="text-xs text-charcoal-lighter">{s.service.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">
                          {apt.payment ? formatCurrency(apt.payment.totalAmount) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={apt.status}
                            onChange={(e) => updateStatus(apt.id, e.target.value)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border-0 ${statusColors[apt.status]}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="NO_SHOW">No Show</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-charcoal hover:text-gold text-sm font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
