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
  { href: "/admin/inventory", label: "Inventory", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplierName?: string;
  isActive: boolean;
}

export default function AdminInventory() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [showLowStockOnly]);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (showLowStockOnly) params.set("lowStock", "true");

      const res = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setLowStockCount(data.lowStockCount || 0);
      } else {
        setError(data.error || "Failed to fetch inventory");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map(item => item.id === id ? { ...item, quantity } : item));
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
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
              <h1 className="font-display text-xl font-semibold text-charcoal">Inventory</h1>
              <p className="text-xs text-charcoal-lighter">Track products and supplies</p>
            </div>
            <button className="px-4 py-2 text-xs font-medium gold-gradient text-charcoal rounded-full">
              + Add Item
            </button>
          </header>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-charcoal-lighter">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded"
                />
                Show low stock only ({lowStockCount} items)
              </label>
            </div>

            {loading ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">Loading inventory...</p></div>
            ) : error ? (
              <div className="text-center py-12"><p className="text-red-600">{error}</p></div>
            ) : items.length === 0 ? (
              <div className="text-center py-12"><p className="text-charcoal-lighter">No inventory items found</p></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <table className="w-full">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Min Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-cream/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-charcoal text-sm">{item.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-charcoal-lighter">{item.sku}</td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{item.category || "-"}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            onBlur={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className={`w-20 px-2 py-1 text-sm border rounded ${
                              item.quantity <= item.minQuantity
                                ? "border-red-300 bg-red-50 text-red-700"
                                : "border-cream-dark bg-white text-charcoal"
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{item.minQuantity}</td>
                        <td className="px-6 py-4 text-sm font-medium text-charcoal">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-sm text-charcoal-lighter">{item.supplierName || "-"}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-charcoal hover:text-gold text-sm font-medium">Edit</button>
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
