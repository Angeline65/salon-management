import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Transparent Pricing</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Service Menu</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">Premium services at fair prices. All prices include a complimentary consultation.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-charcoal mb-6 pb-4 border-b border-cream-dark">Hair Services</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Women's Cut & Style</p><p className="text-sm text-charcoal-lighter">Includes consultation, shampoo, cut & blowdry</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$85</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Men's Cut</p><p className="text-sm text-charcoal-lighter">Precision cut with hot towel finish</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$55</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Full Color</p><p className="text-sm text-charcoal-lighter">Single-process color with gloss</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$150+</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Balayage / Ombré</p><p className="text-sm text-charcoal-lighter">Hand-painted highlights</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$250+</p></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="font-display text-2xl font-semibold text-charcoal mb-6 pb-4 border-b border-cream-dark">Skincare & Facials</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Classic Facial</p><p className="text-sm text-charcoal-lighter">Deep cleanse, exfoliation, mask</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$95</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Luxury Facial</p><p className="text-sm text-charcoal-lighter">Advanced treatment with LED therapy</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$150</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Chemical Peel</p><p className="text-sm text-charcoal-lighter">AHA/BHA resurfacing treatment</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$175</p></div>
              </div>
              <h2 className="font-display text-2xl font-semibold text-charcoal mt-10 mb-6 pb-4 border-b border-cream-dark">Nails</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Classic Manicure</p><p className="text-sm text-charcoal-lighter">Shape, buff, cuticle care, polish</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$40</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Gel Manicure</p><p className="text-sm text-charcoal-lighter">Long-lasting gel polish</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$65</p></div>
                <div className="flex justify-between items-start"><div><p className="font-medium text-charcoal">Luxury Pedicure</p><p className="text-sm text-charcoal-lighter">Soak, scrub, mask, massage, polish</p></div><p className="text-gold font-semibold whitespace-nowrap ml-4">$75</p></div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/booking" className="px-8 py-3 gold-gradient text-charcoal font-semibold rounded-full hover:shadow-gold transition-all duration-300 text-sm">Book an Appointment</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
