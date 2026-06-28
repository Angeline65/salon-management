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

interface ProfileData {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  dateOfBirth?: string;
  notes?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  referralCode?: string;
  memberships?: Array<{
    plan: { name: string; discount: number };
    endDate: string;
  }>;
}

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/customer/profile", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          const data = json.data;
          setProfile(data);
          setFirstName(data.user.firstName);
          setLastName(data.user.lastName);
          setPhone(data.user.phone || "");
          setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "");
          setNotes(data.notes || "");
        } else {
          setError(json.error || "Failed to load profile");
        }
      } catch {
        setError("Network error loading profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || undefined,
          dateOfBirth: dateOfBirth || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setEditing(false);
        setSuccess("Profile updated successfully");
      } else {
        setError(json.error || "Failed to update profile");
      }
    } catch {
      setError("Network error updating profile");
    } finally {
      setSaving(false);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">My Profile</h1>
              <p className="text-xs text-charcoal-lighter">Manage your personal information</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full"
              >
                Edit Profile
              </button>
            )}
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

            {loading ? (
              <div className="bg-white rounded-2xl shadow-soft p-8 space-y-4">
                <div className="h-8 bg-cream rounded animate-pulse w-1/3" />
                <div className="h-4 bg-cream rounded animate-pulse w-1/2" />
                <div className="h-4 bg-cream rounded animate-pulse w-2/3" />
              </div>
            ) : editing ? (
              <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profile?.user.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 bg-cream/50 rounded-xl border border-cream-dark text-sm text-charcoal-lighter cursor-not-allowed"
                  />
                  <p className="text-xs text-charcoal-lighter mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any preferences or notes for your stylist..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                    }}
                    className="px-6 py-2.5 text-sm font-medium bg-white text-charcoal border border-cream-dark rounded-full hover:bg-cream"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Personal Information</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-charcoal-lighter">Name</p>
                        <p className="text-sm font-medium text-charcoal">
                          {profile?.user.firstName} {profile?.user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-lighter">Email</p>
                        <p className="text-sm font-medium text-charcoal">{profile?.user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-lighter">Phone</p>
                        <p className="text-sm font-medium text-charcoal">{profile?.user.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-lighter">Date of Birth</p>
                        <p className="text-sm font-medium text-charcoal">
                          {profile?.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    {profile?.notes && (
                      <div>
                        <p className="text-xs text-charcoal-lighter mb-1">Notes</p>
                        <p className="text-sm text-charcoal">{profile.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft p-6">
                  <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Loyalty & Stats</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-cream rounded-xl p-4">
                      <p className="text-xs text-charcoal-lighter">Loyalty Points</p>
                      <p className="text-2xl font-display font-semibold text-gold">{profile?.loyaltyPoints || 0}</p>
                    </div>
                    <div className="bg-cream rounded-xl p-4">
                      <p className="text-xs text-charcoal-lighter">Total Visits</p>
                      <p className="text-2xl font-display font-semibold text-charcoal">{profile?.totalVisits || 0}</p>
                    </div>
                    <div className="bg-cream rounded-xl p-4">
                      <p className="text-xs text-charcoal-lighter">Total Spent</p>
                      <p className="text-2xl font-display font-semibold text-charcoal">
                        ${((profile?.totalSpent || 0).toFixed(2))}
                      </p>
                    </div>
                  </div>
                  {profile?.referralCode && (
                    <div className="mt-4 p-4 bg-gold/10 rounded-xl">
                      <p className="text-xs text-charcoal-lighter mb-1">Your Referral Code</p>
                      <p className="text-sm font-mono font-semibold text-gold">{profile.referralCode}</p>
                      <p className="text-xs text-charcoal-lighter mt-1">Share with friends to earn rewards</p>
                    </div>
                  )}
                </div>

                {profile?.memberships && profile.memberships.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-soft p-6">
                    <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Active Membership</h2>
                    {profile.memberships.map((m, i) => (
                      <div key={i} className="bg-gold/10 rounded-xl p-4">
                        <p className="text-sm font-medium text-charcoal">{m.plan.name}</p>
                        <p className="text-xs text-charcoal-lighter mt-1">
                          {m.plan.discount}% discount on services · Expires{" "}
                          {new Date(m.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    ))}
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
