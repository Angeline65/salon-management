import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80"
              alt="Luxury salon interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 to-charcoal/30" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="max-w-2xl">
              <p className="text-gold-light font-body text-sm tracking-[0.3em] uppercase mb-6">
                Premium Beauty & Wellness
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6">
                Where Elegance Meets{" "}
                <em className="text-gold-light font-light">Artistry</em>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                Indulge in a sanctuary of beauty. Our master stylists craft personalized experiences that reveal your most radiant self.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/booking"
                  className="px-8 py-4 gold-gradient text-charcoal font-semibold rounded-full hover:shadow-gold transition-all duration-300 text-sm tracking-wide"
                >
                  Book Your Experience
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 text-sm tracking-wide"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">
                Our Expertise
              </p>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-charcoal mb-4">
                Signature Services
              </h2>
              <p className="text-charcoal-lighter max-w-xl mx-auto">
                Each treatment is a curated experience, designed to nurture your beauty from within.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Precision Cut & Style",
                  category: "Hair",
                  duration: "60 min",
                  price: "$85",
                  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
                },
                {
                  title: "Luxury Facial",
                  category: "Skincare",
                  duration: "90 min",
                  price: "$150",
                  image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
                },
                {
                  title: "Gel Manicure",
                  category: "Nails",
                  duration: "45 min",
                  price: "$65",
                  image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
                },
              ].map((service, i) => (
                <Link
                  key={i}
                  href="/services"
                  className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500"
                >
                  <div className="overflow-hidden h-64">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gold font-medium tracking-wider uppercase">
                        {service.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-charcoal/20" />
                      <span className="text-xs text-charcoal-lighter">{service.duration}</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-charcoal mb-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-semibold text-lg">{service.price}</span>
                      <span className="text-xs text-charcoal-lighter group-hover:text-gold transition">
                        Learn more →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/services"
                className="px-8 py-3 border border-charcoal/15 text-charcoal text-sm font-medium rounded-full hover:border-gold hover:text-gold transition-all duration-300"
              >
                View All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Booking CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Ready?</p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold text-charcoal mb-6">
              Begin Your Transformation
            </h2>
            <p className="text-charcoal-lighter max-w-lg mx-auto mb-10">
              Book your appointment today and let our expert team craft a personalized beauty experience just for you.
            </p>
            <Link
              href="/booking"
              className="px-10 py-4 gold-gradient text-charcoal font-semibold rounded-full hover:shadow-gold transition-all duration-300 text-sm tracking-wide"
            >
              Book Your Appointment
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
