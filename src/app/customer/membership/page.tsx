"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CustomerRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const sidebarLinks = [
  { href: "/customer/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/customer/appointments", label: "My Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/customer/profile", label: "My Profile", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { href: "/customer/reviews", label: "My Reviews", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { href: "/customer/membership", label: "Membership", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
  { href: "/customer/coupons", label: "Coupons", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
];

interface MembershipData {
  current: {
    id: string;
    startDate: string;
    endDate: string;
    plan: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      price: number;
      duration: number;
      services: string[];
      discount: number;
    };
  } | null;
  history: Array<{
    id: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    plan: { name: string; price: number };
  }>;
  availablePlans: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    services: string[];
    discount: number;
  }>;
}

export default function CustomerMembership() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemberships() {
      try {
        const res = await fetch("/api/customer/memberships", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load memberships");
        }
      } catch {
        setError("Network error loading memberships");
      } finally {
        setLoading(false);
      }
    }
    fetchMemberships();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    setError("");
    try {
      const res = await fetch("/api/customer/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh data
        const refreshRes = await fetch("/api/customer/memberships", { credentials: "include" });
        const refreshJson = await refreshRes.json();
        if (refreshJson.success) setData(refreshJson.data);
      } else {
        setError(json.error || "Failed to subscribe");
      }
    } catch {
      setError("Network error subscribing to plan");
    } finally {
      setSubscribing(null);
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
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
          <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-cream-dark px-6 py-4">
            <h1 className="font-display text-xl font-semibold text-charcoal">Membership</h1>
            <p className="text-xs text-charcoal-lighter">Exclusive benefits for our members</p>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Current Membership */}
                {data?.current && (
                  <div className="bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl p-8 text-white shadow-elevated">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Active Membership</p>
                        <h2 className="font-display text-2xl font-bold">{data.current.plan.name}</h2>
                      </div>
                      <div className="bg-gold/20 px-4 py-2 rounded-full">
                        <p className="text-sm font-semibold text-gold">
                          {getDaysRemaining(data.current.endDate)} days left
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-white/60">Member Since</p>
                        <p className="text-sm font-medium">
                          {new Date(data.current.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Expires</p>
                        <p className="text-sm font-medium">
                          {new Date(data.current.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-white/60 uppercase tracking-wider">Benefits</p>
                      <div className="flex flex-wrap gap-2">
                        {data.current.plan.services.map((service, i) => (
                          <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs">
                            {service}
                          </span>
                        ))}
                        {data.current.plan.discount > 0 && (
                          <span className="px-3 py-1 bg-gold/30 text-gold rounded-full text-xs font-semibold">
                            {data.current.plan.discount}% off all services
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Available Plans */}
                <div>
                  <h2 className="font-display text-lg font-semibold text-charcoal mb-4">
                    {data?.current ? "Other Plans" : "Available Plans"}
                  </h2>
                  {data?.availablePlans?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                      <p className="text-sm text-charcoal-lighter">No membership plans available at this time</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {data?.availablePlans
                        .filter((p) => p.id !== data?.current?.plan?.id)
                        .map((plan) => (
                          <div key={plan.id} className="bg-white rounded-2xl shadow-soft p-6 flex flex-col">
                            <h3 className="font-display text-lg font-semibold text-charcoal mb-2">{plan.name}</h3>
                            {plan.description && (
                              <p className="text-xs text-charcoal-lighter mb-4">{plan.description}</p>
                            )}
                            <div className="mb-4">
                              <span className="text-3xl font-display font-bold text-charcoal">
                                {formatCurrency(plan.price)}
                              </span>
                              <span className="text-xs text-charcoal-lighter">/{plan.duration} month{plan.duration > 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex-1 space-y-2 mb-6">
                              {plan.services.map((service, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-charcoal">{service}</span>
                                </div>
                              ))}
                              {plan.discount > 0 && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-charcoal font-semibold">{plan.discount}% discount on services</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={subscribing === plan.id}
                              className="w-full py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full disabled:opacity-50 transition"
                            >
                              {subscribing === plan.id ? "Subscribing..." : "Subscribe Now"}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Membership History */}
                {data?.history && data.history.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Membership History</h2>
                    <div className="space-y-2">
                      {data.history.map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-3 bg-cream rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-charcoal">{h.plan.name}</p>
                            <p className="text-xs text-charcoal-lighter">
                              {new Date(h.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} —{" "}
                              {new Date(h.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <span className="text-xs text-charcoal-lighter">{formatCurrency(h.plan.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </CustomerRoute>
  );
}
