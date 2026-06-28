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
  { href: "/admin/payments", label: "Payments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface Payment {
  id: string;
  invoiceNumber: string;
  status: string;
  method?: string;
  amount: number;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  paidAt?: string;
  appointment: {
    bookingRef: string;
    customer: { user: { firstName: string; lastName: string } };
    stylist?: { user: { firstName: string; lastName: string } };
    services: Array<{ service: { name: string } }>;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700",
};

export default function AdminPayments() {
  const { user, logout } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      } else {
        setError(data.error || "Failed to fetch payments");
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
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4">
            <div>
              <h1 className="font-display text-xl font-semibold text-charcoal">Payments</h1>
              <p className="text-xs text-charcoal-lighter">Track and manage all transactions</p>
            </div>
          </header>
          <div className="p-6 space-y-6">
            <div className="flex gap-2">
              {["", "PENDING", "COMPLETED", "FAILED", "REFUNDED"].map((status) => (
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
              <div className="text-center py-12"><p className="text-charcoal-lighter">Loading payments...</p></div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-red-600">{error}</p></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">No payments found</p></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Stylist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-cream/50">
                        <td className="px-6 py-4 text-sm font-mono text-charcoal">{payment.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-charcoal">
                          {payment.appointment.customer.user.firstName} {payment.appointment.customer.user.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">
                          {payment.appointment.stylist ? `${payment.appointment.stylist.user.firstName} ${payment.appointment.stylist.user.lastName}` : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {payment.appointment.services.map((s, i) => (
                              <span key={i} className="text-xs text-charcoal-lighter">{s.service.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{formatCurrency(payment.totalAmount)}</td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{payment.method || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[payment.status]}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">
                          {formatDate(payment.paidAt || payment.createdAt)}
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
