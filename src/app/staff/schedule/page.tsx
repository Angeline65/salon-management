"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { StaffRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { getDayName } from "@/lib/utils";

const sidebarLinks = [
  { href: "/staff/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/staff/schedule", label: "My Schedule", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/staff/clients", label: "My Clients", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/staff/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { href: "/staff/commissions", label: "Commissions", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { href: "/staff/leave", label: "Leave Requests", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: { user: { firstName: string; lastName: string; phone?: string } };
  services: Array<{ service: { name: string; duration: number; price: number } }>;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-600",
};

export default function StaffSchedule() {
  const { user, logout } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Week navigation
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ weekStart: weekStart.toISOString() });
      const res = await fetch(`/api/staff/schedule?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setAvailability(json.data.availability);
        setAppointments(json.data.appointments);
        setBlockedDates(json.data.blockedDates);
        setError("");
      } else {
        setError(json.error || "Failed to load schedule");
      }
    } catch {
      setError("Network error loading schedule");
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
      return d;
    });
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date): Appointment[] => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Get availability for a day
  const getAvailabilityForDay = (dayOfWeek: number): AvailabilitySlot | undefined => {
    return availability.find((a) => a.dayOfWeek === dayOfWeek);
  };

  // Check if a day is blocked
  const isDayBlocked = (date: Date): boolean => {
    return blockedDates.some((bd) => new Date(bd.date).toDateString() === date.toDateString());
  };

  // Toggle availability for a day
  const toggleDayAvailability = async (dayOfWeek: number) => {
    const existing = getAvailabilityForDay(dayOfWeek);
    const isAvailable = existing ? !existing.isAvailable : true;

    try {
      setSaving(true);
      const res = await fetch("/api/staff/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dayOfWeek,
          startTime: existing?.startTime || "09:00",
          endTime: existing?.endTime || "18:00",
          breakStart: existing?.breakStart || null,
          breakEnd: existing?.breakEnd || null,
          isAvailable,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchSchedule();
      }
    } catch {
      setError("Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

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
              <h1 className="font-display text-xl font-semibold text-charcoal">My Schedule</h1>
              <p className="text-xs text-charcoal-lighter">Manage your weekly availability and view appointments</p>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-2 rounded-lg bg-white shadow-soft hover:bg-cream transition"
                >
                  <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-display text-lg font-semibold text-charcoal">
                  {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
                  {new Date(weekEnd.getTime() - 1).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h2>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-2 rounded-lg bg-white shadow-soft hover:bg-cream transition"
                >
                  <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={goToCurrentWeek}
                className="px-4 py-2 text-xs font-medium bg-white text-charcoal rounded-full shadow-soft hover:bg-cream transition"
              >
                Today
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((date, index) => {
                  const dayOfWeek = (index + 1) % 7; // Convert to 0=Sunday format
                  const dayName = getDayName(date.getDay());
                  const dayAppts = getAppointmentsForDay(date);
                  const slot = getAvailabilityForDay(date.getDay());
                  const blocked = isDayBlocked(date);

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-xl shadow-soft overflow-hidden ${isToday(date) ? "ring-2 ring-gold" : ""}`}
                    >
                      {/* Day Header */}
                      <div className={`px-3 py-2 text-center border-b border-cream-dark ${isToday(date) ? "bg-gold/10" : "bg-cream"}`}>
                        <p className="text-xs text-charcoal-lighter font-medium">{dayName.slice(0, 3)}</p>
                        <p className={`text-lg font-display font-semibold ${isToday(date) ? "text-gold" : "text-charcoal"}`}>
                          {date.getDate()}
                        </p>
                      </div>

                      {/* Availability Toggle */}
                      <div className="px-3 py-2 border-b border-cream-dark">
                        <button
                          onClick={() => toggleDayAvailability(date.getDay())}
                          disabled={saving}
                          className={`w-full text-xs font-medium py-1.5 rounded-lg transition ${
                            slot?.isAvailable !== false
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {slot?.isAvailable !== false ? "Available" : "Off"}
                        </button>
                        {slot && slot.isAvailable && (
                          <p className="text-xs text-charcoal-lighter mt-1 text-center">
                            {slot.startTime} – {slot.endTime}
                          </p>
                        )}
                      </div>

                      {/* Blocked indicator */}
                      {blocked && (
                        <div className="px-3 py-2 bg-red-50 border-b border-red-100">
                          <p className="text-xs text-red-600 font-medium">Blocked</p>
                        </div>
                      )}

                      {/* Appointments */}
                      <div className="p-2 space-y-1.5 min-h-[80px]">
                        {dayAppts.length === 0 ? (
                          <p className="text-xs text-charcoal-lighter/50 text-center py-4">No bookings</p>
                        ) : (
                          dayAppts.map((apt) => (
                            <div
                              key={apt.id}
                              className={`p-2 rounded-lg text-xs ${statusColors[apt.status] || "bg-gray-50 text-gray-600"}`}
                            >
                              <p className="font-medium">
                                {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              <p className="truncate">
                                {apt.customer.user.firstName} {apt.customer.user.lastName}
                              </p>
                              <p className="truncate text-[10px] opacity-75">
                                {apt.services[0]?.service.name}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="font-display text-lg font-semibold text-charcoal mb-4">Weekly Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-display font-semibold text-charcoal">{appointments.length}</p>
                  <p className="text-xs text-charcoal-lighter">Total Appointments</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold text-charcoal">
                    {appointments.reduce((sum, a) => sum + a.services.reduce((s, sv) => s + sv.service.price, 0), 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-charcoal-lighter">Expected Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold text-charcoal">
                    {appointments.reduce((sum, a) => sum + a.services.reduce((s, sv) => s + sv.service.duration, 0), 0)} min
                  </p>
                  <p className="text-xs text-charcoal-lighter">Total Hours</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold text-charcoal">
                    {new Set(appointments.map((a) => a.customer.user.firstName + a.customer.user.lastName)).size}
                  </p>
                  <p className="text-xs text-charcoal-lighter">Unique Clients</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </StaffRoute>
  );
}
