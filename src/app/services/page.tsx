import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const services = [
  { title: "Precision Cut & Style", category: "Hair", duration: "60 min", price: "$85", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80" },
  { title: "Color & Highlights", category: "Hair", duration: "120 min", price: "$150–$350", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=80" },
  { title: "Blowout & Style", category: "Hair", duration: "45 min", price: "$65", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80" },
  { title: "Luxury Facial", category: "Skincare", duration: "90 min", price: "$150", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80" },
  { title: "Gel Manicure", category: "Nails", duration: "45 min", price: "$65", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80" },
  { title: "Deep Tissue Massage", category: "Wellness", duration: "60 min", price: "$120", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db872?w=500&q=80" },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">What We Offer</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Our Services</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">Explore our comprehensive range of beauty and wellness services.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500">
                <div className="overflow-hidden h-52">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gold font-medium tracking-wider uppercase">{service.category}</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/20" />
                    <span className="text-xs text-charcoal-lighter">{service.duration}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-charcoal mb-2">{service.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gold font-semibold">{service.price}</span>
                    <Link href="/booking" className="text-xs font-medium text-charcoal hover:text-gold transition">Book Now →</Link>
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
