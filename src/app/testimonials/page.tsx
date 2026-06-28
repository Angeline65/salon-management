import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TestimonialsPage() {
  const testimonials = [
    { name: "Emma Mitchell", role: "Regular client · 3 years", initials: "EM", text: "Sophia transformed my hair into something I never thought possible. The attention to detail and the luxurious atmosphere made it an unforgettable experience." },
    { name: "Jessica Wang", role: "VIP member · 5 years", initials: "JW", text: "The best salon experience I've ever had. From the moment you walk in, you feel like royalty. Marcus is a true artist with color." },
    { name: "Rachel Park", role: "Luxe member · 2 years", initials: "RP", text: "I've been a member for two years now. The consistency of quality is remarkable. Every visit feels like the first — special and rejuvenating." },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Client Love</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Testimonials</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">Don't just take our word for it — hear from our cherished clients.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-soft">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-charcoal-light leading-relaxed mb-6 italic font-light">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-muted flex items-center justify-center text-gold font-display font-bold text-sm">{t.initials}</div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{t.name}</p>
                    <p className="text-xs text-charcoal-lighter">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
