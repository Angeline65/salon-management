"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/team", label: "Team" },
    { href: "/gallery", label: "Gallery" },
    { href: "/testimonials", label: "Reviews" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-white font-display text-lg font-bold">L</span>
            </div>
            <span className="font-display text-2xl font-semibold tracking-wide text-charcoal">
              Luxe
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-charcoal-light hover:text-charcoal transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/booking"
              className="px-5 py-2.5 text-sm font-semibold text-charcoal gold-gradient rounded-full hover:shadow-gold transition-all"
            >
              Book Now
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-charcoal-light border border-charcoal/10 rounded-full hover:border-charcoal/30 transition"
            >
              Sign In
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-charcoal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-cream-dark">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-charcoal-light rounded-lg hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-cream-dark flex gap-2">
              <Link href="/booking" className="flex-1 px-5 py-2.5 text-sm font-semibold text-charcoal gold-gradient rounded-full text-center">
                Book Now
              </Link>
              <Link href="/login" className="flex-1 px-5 py-2.5 text-sm font-medium text-charcoal border border-charcoal/10 rounded-full text-center">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
