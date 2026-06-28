import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Our Story</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-6">
              Redefining Beauty Since 2010
            </h1>
            <p className="text-charcoal-lighter text-lg leading-relaxed">
              Luxe Salon was born from a simple belief: that every person deserves to feel extraordinary.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="rounded-2xl overflow-hidden shadow-medium aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80" alt="Salon interior" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold text-charcoal mb-6">A Vision of Timeless Elegance</h2>
              <p className="text-charcoal-lighter leading-relaxed mb-4">
                Founded by Sophia Laurent, a visionary stylist with over 15 years of international experience, Luxe Salon represents the pinnacle of beauty craftsmanship.
              </p>
              <p className="text-charcoal-lighter leading-relaxed">
                Every detail in our salon has been thoughtfully designed to create an experience that transcends a typical salon visit.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6"><p className="font-display text-4xl font-semibold text-gold mb-2">14+</p><p className="text-charcoal-lighter text-sm">Years of Excellence</p></div>
            <div className="p-6"><p className="font-display text-4xl font-semibold text-gold mb-2">15K+</p><p className="text-charcoal-lighter text-sm">Happy Clients</p></div>
            <div className="p-6"><p className="font-display text-4xl font-semibold text-gold mb-2">12</p><p className="text-charcoal-lighter text-sm">Expert Stylists</p></div>
            <div className="p-6"><p className="font-display text-4xl font-semibold text-gold mb-2">50+</p><p className="text-charcoal-lighter text-sm">Awards Won</p></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
