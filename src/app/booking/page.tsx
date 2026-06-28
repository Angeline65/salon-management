"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const steps = ["Service", "Stylist", "Date", "Time", "Details", "Confirm"];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const next = () => setCurrentStep((s) => Math.min(s + 1, 6));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 bg-cream min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-semibold text-charcoal mb-2">Book Your Appointment</h1>
            <p className="text-charcoal-lighter text-sm">Complete the steps below to schedule your visit.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-0">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i < currentStep ? "bg-gold text-white" : "bg-cream-dark text-charcoal-lighter"}`}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 ${i < currentStep - 1 ? "bg-gold" : "bg-cream-deeper"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-10">
            {currentStep === 1 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Select a Service</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {["Precision Cut & Style · 60 min · $85", "Color & Highlights · 120 min · $150+", "Blowout & Style · 45 min · $65", "Luxury Facial · 90 min · $150", "Gel Manicure · 45 min · $65", "Deep Tissue Massage · 60 min · $120"].map((s, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 border border-cream-dark rounded-xl cursor-pointer hover:border-gold transition">
                      <input type="checkbox" className="w-4 h-4 accent-[#C4A265]" />
                      <span className="text-sm text-charcoal">{s}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={next} className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Choose Your Stylist</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {["Any Available · Earliest appointment", "Sophia Laurent · Creative Director · 4.9★", "Marcus Chen · Senior Stylist · 4.8★", "Isabella Rose · Color Specialist · 4.9★"].map((s, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 border border-cream-dark rounded-xl cursor-pointer hover:border-gold transition">
                      <input type="radio" name="stylist" className="w-4 h-4 accent-[#C4A265]" />
                      <span className="text-sm text-charcoal">{s}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={prev} className="px-6 py-3 text-charcoal-lighter text-sm">Back</button>
                  <button onClick={next} className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Select a Date</h2>
                <div className="bg-cream rounded-xl p-6 mb-6 text-center">
                  <p className="text-charcoal mb-4">June 2025</p>
                  <p className="text-sm text-charcoal-lighter">Calendar component loads here</p>
                  <div className="mt-4 text-xs text-charcoal-lighter">Selected: June 18, 2025</div>
                </div>
                <div className="flex justify-between">
                  <button onClick={prev} className="px-6 py-3 text-charcoal-lighter text-sm">Back</button>
                  <button onClick={next} className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Select a Time</h2>
                <p className="text-sm text-charcoal-lighter mb-4">Available slots for June 18, 2025</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                  {["9:00 AM", "10:00 AM", "10:30 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].map((t, i) => (
                    <button key={i} className={`py-3 text-sm border rounded-xl transition ${i === 1 ? "border-gold bg-gold/5 text-gold font-medium" : "border-cream-dark text-charcoal-lighter hover:border-gold hover:text-gold"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={prev} className="px-6 py-3 text-charcoal-lighter text-sm">Back</button>
                  <button onClick={next} className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Your Details</h2>
                <div className="space-y-5 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">First Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-cream rounded-xl text-sm" placeholder="Jane" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Last Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-cream rounded-xl text-sm" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 bg-cream rounded-xl text-sm" placeholder="jane@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 bg-cream rounded-xl text-sm" placeholder="(310) 555-0000" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={prev} className="px-6 py-3 text-charcoal-lighter text-sm">Back</button>
                  <button onClick={next} className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">Confirm Booking</button>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-display text-3xl font-semibold text-charcoal mb-2">Booking Confirmed!</h2>
                <p className="text-charcoal-lighter mb-2">Your appointment has been booked successfully.</p>
                <p className="text-sm text-charcoal-lighter mb-6">Booking ID: <span className="font-mono font-medium text-charcoal">LX-A7K9M2P4</span></p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/customer/dashboard" className="px-6 py-3 gold-gradient text-charcoal font-semibold rounded-xl text-sm">View My Appointments</a>
                  <a href="/" className="px-6 py-3 border border-charcoal/15 text-charcoal text-sm font-medium rounded-xl">Back to Home</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
