// ──────────────────────────────────────────────
// Booking Store
// ──────────────────────────────────────────────

import { create } from "zustand";
import type { BookingState } from "@/types";

interface BookingStore extends BookingState {
  setStep: (step: number) => void;
  setCategory: (categoryId: string) => void;
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  setStylist: (stylistId: string) => void;
  setDate: (date: string) => void;
  setTimeSlot: (timeSlot: string) => void;
  setCustomerDetails: (details: BookingState["customerDetails"]) => void;
  setPaymentMethod: (method: BookingState["paymentMethod"]) => void;
  setCouponCode: (code: string) => void;
  setTotalAmount: (amount: number) => void;
  setDepositAmount: (amount: number) => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialBookingState: BookingState = {
  step: 1,
  categoryId: undefined,
  serviceIds: [],
  stylistId: undefined,
  date: undefined,
  timeSlot: undefined,
  customerDetails: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  },
  paymentMethod: undefined,
  couponCode: undefined,
  totalAmount: 0,
  depositAmount: 0,
};

export const useBookingStore = create<BookingStore>()((set, get) => ({
  ...initialBookingState,

  setStep: (step) => set({ step }),

  setCategory: (categoryId) => set({ categoryId, serviceIds: [] }),

  addService: (serviceId) =>
    set((state) => ({
      serviceIds: [...state.serviceIds, serviceId],
    })),

  removeService: (serviceId) =>
    set((state) => ({
      serviceIds: state.serviceIds.filter((id) => id !== serviceId),
    })),

  setStylist: (stylistId) => set({ stylistId }),

  setDate: (date) => set({ date, timeSlot: undefined }),

  setTimeSlot: (timeSlot) => set({ timeSlot }),

  setCustomerDetails: (details) => set({ customerDetails: details }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  setCouponCode: (couponCode) => set({ couponCode }),

  setTotalAmount: (totalAmount) => set({ totalAmount }),

  setDepositAmount: (depositAmount) => set({ depositAmount }),

  reset: () => set(initialBookingState),

  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 7) })),

  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
}));

// ──────────────────────────────────────────────
// Notification Store
// ──────────────────────────────────────────────

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrement: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));

// ──────────────────────────────────────────────
// UI Store
// ──────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
