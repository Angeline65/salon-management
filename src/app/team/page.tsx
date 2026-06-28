import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const team = [
  { name: "Sophia Laurent", role: "Creative Director · 15 yrs", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&q=80", specialties: ["Precision Cuts", "Editorial", "Bridal"] },
  { name: "Marcus Chen", role: "Senior Stylist · 10 yrs", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80", specialties: ["Color", "Balayage", "Men's Cuts"] },
  { name: "Isabella Rose", role: "Color Specialist · 8 yrs", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80", specialties: ["Creative Color", "Vivid", "Corrections"] },
  { name: "Aria Nakamura", role: "Skin Therapist · 12 yrs", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80", specialties: ["Facials", "Peels", "Anti-Aging"] },
  { name: "James Okafor", role: "Texture Expert · 7 yrs", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80", specialties: ["Natural Hair", "Locs", "Texture"] },
  { name: "Elena Vasquez", role: "Nail Artist · 6 yrs", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80", specialties: ["Nail Art", "Gel", "Extensions"] },
];

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">The Artists</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Meet Our Team</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">Each stylist brings a unique perspective and years of dedicated expertise.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500">
                <div className="overflow-hidden aspect-[3/4]">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-semibold text-charcoal">{member.name}</h3>
                  <p className="text-gold text-sm mt-1 mb-3">{member.role}</p>
                  <div className="flex gap-2 flex-wrap">
                    {member.specialties.map((s, j) => (
                      <span key={j} className="px-3 py-1 text-xs bg-cream text-charcoal-lighter rounded-full">{s}</span>
                    ))}
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
