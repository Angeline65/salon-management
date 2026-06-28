import { useBookingStore } from "@/store";
import { useCallback } from "react";
import type { ApiResponse, Appointment } from "@/types";

export function useBooking() {
  const store = useBookingStore();

  const submitBooking = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds: store.serviceIds,
          stylistId: store.stylistId,
          date: store.date,
          timeSlot: store.timeSlot,
          customerDetails: store.customerDetails,
          paymentMethod: store.paymentMethod,
          couponCode: store.couponCode,
        }),
      });
      const data: ApiResponse<Appointment> = await res.json();
      if (data.success) {
        store.reset();
      }
      return data;
    } catch {
      return { success: false, error: "Failed to create booking" };
    }
  }, [store]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", cancellationReason: reason }),
      });
      return await res.json();
    } catch {
      return { success: false, error: "Failed to cancel appointment" };
    }
  }, []);

  const rescheduleAppointment = useCallback(
    async (appointmentId: string, newDate: string, newTime: string) => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: newDate, timeSlot: newTime }),
        });
        return await res.json();
      } catch {
        return { success: false, error: "Failed to reschedule appointment" };
      }
    },
    []
  );

  return {
    ...store,
    submitBooking,
    cancelAppointment,
    rescheduleAppointment,
  };
}
