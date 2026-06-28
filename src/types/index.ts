// ──────────────────────────────────────────────
// Core Types for Luxe Salon Platform
// ──────────────────────────────────────────────

export type UserRole = "CUSTOMER" | "STYLIST" | "RECEPTIONIST" | "MANAGER" | "SUPER_ADMIN";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "STRIPE" | "RAZORPAY";

export type NotificationType = "BOOKING_CONFIRMATION" | "APPOINTMENT_REMINDER" | "RESCHEDULE" | "CANCELLATION" | "PAYMENT_RECEIVED" | "PROMOTIONAL" | "REVIEW_REQUEST";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

// ──────────────────────────────────────────────
// User & Auth
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ──────────────────────────────────────────────
// Customer
// ──────────────────────────────────────────────

export interface Customer {
  id: string;
  userId: string;
  user: User;
  dateOfBirth?: string;
  notes?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  referralCode?: string;
  favoriteStylistId?: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Stylist
// ──────────────────────────────────────────────

export interface Stylist {
  id: string;
  userId: string;
  user: User;
  bio?: string;
  specialties: string[];
  commissionRate: number;
  rating: number;
  reviewCount: number;
  sortOrder: number;
  isFeatured: boolean;
  instagramUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  isActive: boolean;
  isPopular: boolean;
  depositAmount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
  isActive: boolean;
  items: ServicePackageItem[];
}

export interface ServicePackageItem {
  id: string;
  packageId: string;
  serviceId: string;
  service: Service;
  quantity: number;
}

// ──────────────────────────────────────────────
// Appointments
// ──────────────────────────────────────────────

export interface Appointment {
  id: string;
  bookingRef: string;
  customerId: string;
  customer?: Customer;
  stylistId?: string;
  stylist?: Stylist;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  cancellationReason?: string;
  isWalkIn: boolean;
  services: AppointmentService[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  service: Service;
  price: number;
  duration: number;
  notes?: string;
}

// ──────────────────────────────────────────────
// Booking Flow
// ──────────────────────────────────────────────

export interface BookingState {
  step: number;
  categoryId?: string;
  serviceIds: string[];
  stylistId?: string;
  date?: string;
  timeSlot?: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  totalAmount: number;
  depositAmount: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  stylistId?: string;
}

// ──────────────────────────────────────────────
// Payments
// ──────────────────────────────────────────────

export interface Payment {
  id: string;
  appointmentId: string;
  customerId: string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  stripePaymentId?: string;
  invoiceNumber: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Reviews
// ──────────────────────────────────────────────

export interface Review {
  id: string;
  customerId: string;
  customer?: Customer;
  stylistId?: string;
  stylist?: Stylist;
  appointmentId?: string;
  rating: number;
  comment?: string;
  response?: string;
  respondedAt?: string;
  isPublic: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Coupons & Memberships
// ──────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration: number;
  services: string[];
  discount: number;
  isActive: boolean;
}

// ──────────────────────────────────────────────
// Scheduling
// ──────────────────────────────────────────────

export interface Availability {
  id: string;
  stylistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isAvailable: boolean;
}

export interface LeaveRequest {
  id: string;
  stylistId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  stylistId: string;
  date: string;
  reason?: string;
}

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  sentAt?: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Inventory
// ──────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category?: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export interface DashboardStats {
  todayAppointments: number;
  revenueToday: number;
  revenueMonth: number;
  newCustomers: number;
  occupancyRate: number;
  topServices: { name: string; count: number }[];
  upcomingAppointments: Appointment[];
}

export interface ReportData {
  period: string;
  revenue: number;
  appointments: number;
  customers: number;
  retention: number;
  growth: number;
}

// ──────────────────────────────────────────────
// API Response Types
// ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ──────────────────────────────────────────────
// Form Validation Schemas (Zod)
// ──────────────────────────────────────────────

export interface BookingFormData {
  services: string[];
  stylistId?: string;
  date: string;
  timeSlot: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
