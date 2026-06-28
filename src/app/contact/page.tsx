import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-3">Get in Touch</p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-charcoal mb-4">Contact Us</h1>
            <p className="text-charcoal-lighter max-w-xl mx-auto">We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-white border border-cream-dark rounded-xl text-sm" placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 bg-white border border-cream-dark rounded-xl text-sm" placeholder="you@email.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Subject</label>
                  <select className="w-full px-4 py-3 bg-white border border-cream-dark rounded-xl text-sm text-charcoal-lighter">
                    <option>General Inquiry</option>
                    <option>Book an Appointment</option>
                    <option>Membership Information</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 bg-white border border-cream-dark rounded-xl text-sm resize-none" placeholder="How can we help you?" required />
                </div>
                <button type="submit" className="w-full py-3.5 gold-gradient text-charcoal font-semibold rounded-xl hover:shadow-gold transition-all duration-300 text-sm">Send Message</button>
              </form>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <h3 className="font-display text-xl font-semibold text-charcoal mb-4">Visit Our Salon</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div><p className="font-medium text-charcoal text-sm">123 Elegance Avenue</p><p className="text-charcoal-lighter text-sm">Beverly Hills, CA 90210</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <div><p className="font-medium text-charcoal text-sm">(310) 555-0199</p><p className="text-charcoal-lighter text-sm">hello@luxesalon.com</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
