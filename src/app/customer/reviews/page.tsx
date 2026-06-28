"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CustomerRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";

// Wrap the page content in Suspense for useSearchParams
export default function CustomerReviews() {
  return (
    <CustomerRoute>
      <Suspense fallback={<div className="flex min-h-screen bg-cream"><div className="flex-1 lg:ml-64 p-6"><div className="h-32 bg-white rounded-xl animate-pulse" /></div></div>}>
        <CustomerReviewsContent />
      </Suspense>
    </CustomerRoute>
  );
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  response?: string;
  respondedAt?: string;
  stylist?: { user: { firstName: string; lastName: string } };
  createdAt: string;
}

function CustomerReviewsContent() {
  const sidebarLinks = [
    { href: "/customer/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { href: "/customer/appointments", label: "My Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { href: "/customer/profile", label: "My Profile", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { href: "/customer/reviews", label: "My Reviews", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
    { href: "/customer/membership", label: "Membership", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
    { href: "/customer/coupons", label: "Coupons", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
  ];

  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-fill from URL params (when coming from appointments page)
  const prefillAppointment = searchParams.get("appointment") || "";
  const prefillStylist = searchParams.get("stylist") || "";

  // New review form
  const [showForm, setShowForm] = useState(!!prefillAppointment);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/customer/reviews", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setReviews(json.data);
        } else {
          setError(json.error || "Failed to load reviews");
        }
      } catch {
        setError("Network error loading reviews");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!prefillAppointment) {
      setFormError("Appointment ID is required");
      return;
    }

    if (comment.length < 10) {
      setFormError("Comment must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appointmentId: prefillAppointment,
          rating,
          comment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) => [json.data, ...prev]);
        setShowForm(false);
        setComment("");
        setSuccess("Review submitted successfully!");
      } else {
        setFormError(json.error || "Failed to submit review");
      }
    } catch {
      setFormError("Network error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false, onClick?: (n: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && onClick?.(n)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${n <= count ? "text-gold" : "text-charcoal-lighter/30"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
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
              <h1 className="font-display text-xl font-semibold text-charcoal">My Reviews</h1>
              <p className="text-xs text-charcoal-lighter">{reviews.length} review{reviews.length !== 1 ? "s" : ""} written</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full"
              >
                + Write Review
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

            {/* New Review Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Write a Review</h2>
                {prefillStylist && (
                  <p className="text-sm text-charcoal-lighter mb-4">Reviewing your visit with {prefillStylist}</p>
                )}
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-lighter mb-2">Rating</label>
                    {renderStars(rating, true, setRating)}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-lighter mb-1.5">Your Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience (minimum 10 characters)..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-cream-dark text-sm text-charcoal placeholder:text-charcoal-lighter focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-sm font-medium gold-gradient text-charcoal rounded-full disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                      className="px-6 py-2.5 text-sm font-medium text-charcoal border border-cream-dark rounded-full hover:bg-cream"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-lighter/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="font-display text-lg font-semibold text-charcoal mb-1">No reviews yet</h3>
                <p className="text-sm text-charcoal-lighter">
                  Share your experience after your next visit
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl shadow-soft p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        {review.stylist && (
                          <p className="font-medium text-charcoal text-sm">
                            {review.stylist.user.firstName} {review.stylist.user.lastName}
                          </p>
                        )}
                        <p className="text-xs text-charcoal-lighter">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-charcoal mb-3">{review.comment}</p>
                    )}
                    {review.response && (
                      <div className="mt-3 p-3 bg-cream rounded-xl">
                        <p className="text-xs font-medium text-charcoal mb-1">Response from salon</p>
                        <p className="text-xs text-charcoal-lighter">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </CustomerRoute>
  );
}