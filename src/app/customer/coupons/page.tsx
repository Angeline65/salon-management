"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CustomerRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";

const sidebarLinks = [
  { href: "/customer/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/customer/appointments", label: "My Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/customer/profile", label: "My Profile", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { href: "/customer/reviews", label: "My Reviews", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { href: "/customer/membership", label: "Membership", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
  { href: "/customer/coupons", label: "Coupons", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
];

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function CustomerCoupons() {
  const { user, logout } = useAuth();
  const [available, setAvailable] = useState<Coupon[]>([]);
  const [used, setUsed] = useState<Coupon[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [tab, setTab] = useState<"available" | "used">("available");

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch("/api/customer/coupons", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setAvailable(json.data.available);
          setUsed(json.data.used);
          setLoyaltyPoints(json.data.loyaltyPoints);
        } else {
          setError(json.error || "Failed to load coupons");
        }
      } catch {
        setError("Network error loading coupons");
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/customer/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Coupon "${json.data.code}" applied successfully!`);
        setCouponCode("");
        // Refresh coupons list
        const refreshRes = await fetch("/api/customer/coupons", { credentials: "include" });
        const refreshJson = await refreshRes.json();
        if (refreshJson.success) {
          setAvailable(refreshJson.data.available);
        }
      } else {
        setError(json.error || "Invalid coupon code");
      }
    } catch {
      setError("Network error validating coupon");
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% off`;
    }
    return `$${coupon.discountValue} off`;
  };

  const isExpired = (coupon: Coupon) => new Date(coupon.validUntil) < new Date();

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
            <h1 className="font-display text-xl font-semibold text-charcoal">Coupons & Rewards</h1>
            <p className="text-xs text-charcoal-lighter">Exclusive offers and loyalty rewards</p>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Loyalty Points */}
            <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-white shadow-gold">
              <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Your Loyalty Points</p>
              <p className="text-4xl font-display font-bold">{loyaltyPoints}</p>
              <p className="text-xs text-white/70 mt-2">Earn points with every visit. Redeem for exclusive rewards.</p>
            </div>

            {/* Apply Coupon Code */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Apply Coupon Code</h2>
              <form onSubmit={handleApplyCode} className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={validating || !couponCode.trim()}
                  className="px-6 py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full disabled:opacity-50"
                >
                  {validating ? "Validating..." : "Apply"}
                </button>
              </form>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-soft w-fit">
              <button
                onClick={() => setTab("available")}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                  tab === "available" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-cream"
                }`}
              >
                Available ({available.length})
              </button>
              <button
                onClick={() => setTab("used")}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
                  tab === "used" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-cream"
                }`}
              >
                Used ({used.length})
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tab === "available" ? (
              available.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                  <svg className="w-12 h-12 mx-auto mb-3 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className="text-sm text-charcoal-lighter">No available coupons</p>
                  <p className="text-xs text-charcoal-lighter mt-1">Check back later or enter a code above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {available.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`bg-white rounded-2xl shadow-soft p-5 border-l-4 ${
                        isExpired(coupon) ? "border-l-red-400 opacity-60" : "border-l-gold"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-lg font-bold text-charcoal">{coupon.code}</p>
                          <p className="text-sm font-semibold text-gold">{getDiscountDisplay(coupon)}</p>
                        </div>
                        <span className="text-2xl">&#x1F3AB;</span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-charcoal-lighter mb-3">{coupon.description}</p>
                      )}
                      <div className="text-xs text-charcoal-lighter space-y-1">
                        {coupon.minPurchase && (
                          <p>Min. purchase: ${coupon.minPurchase}</p>
                        )}
                        {coupon.maxDiscount && (
                          <p>Max discount: ${coupon.maxDiscount}</p>
                        )}
                        <p>Valid until {formatDate(coupon.validUntil)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              used.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                  <p className="text-sm text-charcoal-lighter">No used coupons yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {used.map((coupon) => (
                    <div key={coupon.id} className="bg-white rounded-2xl shadow-soft p-5 opacity-60">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-lg font-bold text-charcoal">{coupon.code}</p>
                          <p className="text-sm text-charcoal-lighter">{getDiscountDisplay(coupon)}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Used</span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-charcoal-lighter">{coupon.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </CustomerRoute>
  );
}
