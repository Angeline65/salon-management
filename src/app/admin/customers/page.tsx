"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AdminRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/admin/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/admin/services", label: "Services", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { href: "/admin/stylists", label: "Stylists", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: "/admin/customers", label: "Customers", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface Customer {
  id: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: string;
  };
  appointments?: Array<{ id: string; status: string; date: string }>;
  memberships?: Array<{ plan: { name: string } }>;
}

export default function AdminCustomers() {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery = "") => {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (searchQuery) params.set("search", searchQuery);
      
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        setError(data.error || "Failed to fetch customers");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setLoading(true);
    fetchCustomers(value);
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Customers</h1>
              <p className="text-xs text-charcoal-lighter">Manage customer relationships</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Add Customer
            </button>
          </header>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-cream-dark rounded-xl text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">No customers found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Visits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Loyalty Points</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-cream/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                              <span className="text-sm font-display font-bold text-gold">
                                {customer.user.firstName[0]}{customer.user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-charcoal text-sm">{customer.user.firstName} {customer.user.lastName}</p>
                              <p className="text-xs text-charcoal-lighter">Since {formatDate(customer.user.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{customer.user.email}</td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{customer.user.phone || "-"}</td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{customer.totalVisits}</td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{formatCurrency(customer.totalSpent)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{customer.loyaltyPoints}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
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
