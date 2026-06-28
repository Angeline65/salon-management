import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Luxe Salon — Premium Beauty & Wellness",
    template: "%s | Luxe Salon",
  },
  description:
    "Experience luxury beauty services. Book appointments with top stylists for hair, skincare, nails, and wellness treatments in Beverly Hills.",
  keywords: [
    "best salon near me",
    "hair salon in beverly hills",
    "beauty salon appointments",
    "luxury salon",
    "premium hair salon",
    "facial treatments",
    "bridal salon",
  ],
  authors: [{ name: "Luxe Salon" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://luxesalon.com",
    title: "Luxe Salon — Premium Beauty & Wellness",
    description: "Where elegance meets artistry. Premium beauty services crafted for the modern individual.",
    siteName: "Luxe Salon",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Salon — Premium Beauty & Wellness",
    description: "Where elegance meets artistry.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://luxesalon.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${body.variable} font-body`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
