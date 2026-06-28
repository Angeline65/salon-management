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

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
  isPopular: boolean;
  category?: { name: string };
}

export default function AdminServices() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?includeInactive=true");
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(services.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      }
    } catch (err) {
      console.error("Failed to toggle service:", err);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setServices(services.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete service:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Services</h1>
              <p className="text-xs text-charcoal-lighter">Manage salon services and pricing</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Add Service
            </button>
          </header>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">Loading services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-charcoal-lighter">No services found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-cream/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-charcoal text-sm">{service.name}</p>
                              {service.isPopular && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gold/10 text-gold rounded-full">Popular</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{service.category?.name || "-"}</td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{formatCurrency(service.price)}</td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{service.duration} min</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(service.id, service.isActive)}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              service.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteService(service.id)}
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
