"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AdminRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { href: "/admin/appointments", label: "Appointments", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { href: "/admin/services", label: "Services", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { href: "/admin/stylists", label: "Stylists", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { href: "/admin/customers", label: "Customers", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { href: "/admin/notifications", label: "Notifications", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface Notification {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  BOOKING_CONFIRMATION: "bg-green-50 text-green-700",
  APPOINTMENT_REMINDER: "bg-blue-50 text-blue-700",
  RESCHEDULE: "bg-yellow-50 text-yellow-700",
  CANCELLATION: "bg-red-50 text-red-700",
  PAYMENT_RECEIVED: "bg-green-50 text-green-700",
  PROMOTIONAL: "bg-purple-50 text-purple-700",
  REVIEW_REQUEST: "bg-orange-50 text-orange-700",
  LOW_INVENTORY: "bg-red-50 text-red-700",
};

export default function AdminNotifications() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications?pageSize=100");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setError(data.error || "Failed to fetch notifications");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Notifications</h1>
              <p className="text-xs text-charcoal-lighter">{unreadCount} unread notifications</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Send Notification
            </button>
          </header>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">Loading notifications...</p></div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-red-600">{error}</p></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">No notifications</p></div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl shadow-soft p-6 ${!notification.isRead ? "border-l-4 border-gold" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeColors[notification.type]}`}>
                          {notification.type.replace(/_/g, " ")}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full">
                          {notification.channel}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-charcoal-lighter hover:text-gold font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-charcoal mb-2">{notification.title}</h3>
                    <p className="text-sm text-charcoal-lighter mb-3">{notification.message}</p>
                    <p className="text-xs text-charcoal-lighter">{formatDate(notification.createdAt)}</p>
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
