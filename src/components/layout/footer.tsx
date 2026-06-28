import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-white font-display text-lg font-bold">L</span>
              </div>
              <span className="font-display text-2xl font-semibold">Luxe</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Where elegance meets artistry. Premium beauty services crafted for the modern individual.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:bg-white/15 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Services</Link></li>
              <li><Link href="/pricing" className="text-white/50 text-sm hover:text-gold transition">Pricing</Link></li>
              <li><Link href="/team" className="text-white/50 text-sm hover:text-gold transition">Our Team</Link></li>
              <li><Link href="/gallery" className="text-white/50 text-sm hover:text-gold transition">Gallery</Link></li>
              <li><Link href="/blog" className="text-white/50 text-sm hover:text-gold transition">Blog</Link></li>
              <li><Link href="/booking" className="text-white/50 text-sm hover:text-gold transition">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Hair Cutting & Styling</Link></li>
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Color & Highlights</Link></li>
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Facials & Skincare</Link></li>
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Nail Services</Link></li>
              <li><Link href="/services" className="text-white/50 text-sm hover:text-gold transition">Massage & Wellness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <p className="text-white/50 text-sm">
                123 Elegance Avenue<br />
                Beverly Hills, CA 90210
              </p>
              <p className="text-white/50 text-sm">(310) 555-0199</p>
              <p className="text-white/50 text-sm">hello@luxesalon.com</p>
              <p className="text-white/50 text-sm">
                Mon–Fri: 9AM – 8PM<br />
                Sat: 9AM – 6PM · Sun: 10AM – 5PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">&copy; 2025 Luxe Salon. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 text-xs hover:text-white/60 transition">Privacy Policy</a>
            <a href="#" className="text-white/30 text-xs hover:text-white/60 transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
