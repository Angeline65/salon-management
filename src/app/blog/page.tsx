import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const posts = [
  { title: "The Art of Balayage: What You Need to Know", category: "Hair Care", date: "Jan 15, 2025", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80" },
  { title: "Winter Skincare: Protecting Your Glow", category: "Skincare", date: "Jan 8, 2025", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80" },
  { title: "2025 Beauty Trends to Watch", category: "Trends", date: "Dec 28, 2024", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80" },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Beauty Journal</p>
            <h1 className="font-display text-5xl font-semibold text-charcoal mb-4">Blog</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">Tips, trends, and insights from our expert team.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 cursor-pointer">
                <div className="overflow-hidden h-52">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-gold font-medium">{post.category}</span>
                    <span className="text-xs text-charcoal-lighter">{post.date}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-charcoal mb-2">{post.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
