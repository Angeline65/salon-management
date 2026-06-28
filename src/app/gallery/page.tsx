import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function GalleryPage() {
  const images = [
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db872?w=500&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500&q=80",
  ];

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Our Work</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Gallery</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">A curated collection of our finest transformations.</p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden cursor-pointer group">
                <img src={img} alt={`Gallery ${i + 1}`} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
