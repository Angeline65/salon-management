"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AdminRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/admin/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/admin/services", label: "Services", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { href: "/admin/stylists", label: "Stylists", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: "/admin/customers", label: "Customers", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface Stylist {
  id: string;
  bio?: string;
  specialties: string[];
  commissionRate: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
  };
  appointments?: Array<{ id: string }>;
}

export default function AdminStylists() {
  const { user, logout } = useAuth();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      const res = await fetch("/api/admin/stylists");
      const data = await res.json();
      if (data.success) {
        setStylists(data.data);
      } else {
        setError(data.error || "Failed to fetch stylists");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/stylists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStylists(stylists.map(s => s.id === id ? { ...s, isFeatured: !currentStatus } : s));
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Stylists</h1>
              <p className="text-xs text-charcoal-lighter">Manage your team</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Add Stylist
            </button>
          </header>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">Loading stylists...</p></div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-red-600">{error}</p></div>
            ) : stylists.length === 0 ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">No stylists found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stylists.map((stylist) => (
                  <div key={stylist.id} className="bg-white rounded-2xl shadow-soft p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-display font-bold text-gold">
                          {stylist.user.firstName[0]}{stylist.user.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-semibold text-charcoal truncate">
                            {stylist.user.firstName} {stylist.user.lastName}
                          </h3>
                          {stylist.isFeatured && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gold/10 text-gold rounded-full">Featured</span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-lighter truncate">{stylist.user.email}</p>
                      </div>
                    </div>

                    {stylist.bio && (
                      <p className="text-sm text-charcoal-lighter mb-4 line-clamp-2">{stylist.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-4">
                      {stylist.specialties.slice(0, 3).map((spec, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-cream text-charcoal-lighter rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-cream-dark">
                      <div>
                        <p className="text-lg font-display font-semibold text-charcoal">{stylist.rating.toFixed(1)}★</p>
                        <p className="text-xs text-charcoal-lighter">Rating</p>
                      </div>
                      <div>
                        <p className="text-lg font-display font-semibold text-charcoal">{stylist.reviewCount}</p>
                        <p className="text-xs text-charcoal-lighter">Reviews</p>
                      </div>
                      <div>
                        <p className="text-lg font-display font-semibold text-charcoal">{(stylist.commissionRate * 100).toFixed(0)}%</p>
                        <p className="text-xs text-charcoal-lighter">Commission</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFeatured(stylist.id, stylist.isFeatured)}
                        className="flex-1 px-3 py-2 text-xs font-medium border border-cream-dark rounded-xl hover:bg-cream transition"
                      >
                        {stylist.isFeatured ? "Remove Featured" : "Make Featured"}
                      </button>
                      <button className="flex-1 px-3 py-2 text-xs font-medium gold-gradient text-charcoal rounded-xl">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
