"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const faqs = [
  { q: "How do I book an appointment?", a: "You can book online through our website, call us at (310) 555-0199, or walk in. Online booking is available 24/7 and you'll receive instant confirmation via email and SMS." },
  { q: "What is your cancellation policy?", a: "We require 24 hours notice for cancellations. Late cancellations or no-shows may be charged 50% of the service price. Members enjoy flexible cancellation up to 4 hours before." },
  { q: "Do you offer parking?", a: "Yes, we have complimentary valet parking for all clients. There is also a public parking garage one block away." },
  { q: "What products do you use?", a: "We use premium, cruelty-free products from brands like Oribe, Kerastase, Olaplex, and Dermalogica." },
  { q: "How do membership plans work?", a: "Our membership plans are monthly subscriptions that include services and discounts. You can upgrade, downgrade, or cancel at any time." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Common Questions</p>
            <h1 className="font-display text-5xl font-semibold text-charcoal mb-4">FAQ</h1>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-charcoal">{faq.q}</span>
                  <span className={`text-gold text-2xl font-light transition-transform duration-300 ${openIndex === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-6">
                    <p className="text-charcoal-lighter text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
