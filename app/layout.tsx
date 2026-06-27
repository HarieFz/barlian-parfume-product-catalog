import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Konfigurasi Viewport untuk optimasi mobile (mencegah auto-zoom pada input iOS)
export const viewport: Viewport = {
  themeColor: "#09090b", // Menyesuaikan warna zinc-900 biar browser mobile serasi
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // 1. Root / Base URL (Ganti dengan domain asli kamu nanti)
  metadataBase: new URL("https://barlian-parfume-product-catalog.vercel.app"),

  // 2. SEO Dasar
  title: {
    default: "Barlian Parfume | Bau Adalah Kata, Parfum Adalah Sastra",
    template: "%s | Barlian Parfume",
  },
  description:
    "Temukan koleksi sastra aroma terbaik dari Barlian Parfume. Katalog parfum eksklusif dengan pilihan ukuran dan variasi premium untuk menemani setiap cerita perjalanan Anda.",
  keywords: [
    "barlian parfume",
    "parfum premium",
    "katalog parfum",
    "parfum original",
    "parfum lokal terbaik",
    "beli parfum via whatsapp",
    "parfum garut",
  ],
  authors: [{ name: "Barlian Parfume Team" }],
  creator: "Barlian Parfume",
  publisher: "Barlian Parfume",

  // 3. OpenGraph (Optimasi Share ke WhatsApp, FB, IG, dll)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://barlian-parfume-product-catalog.vercel.app",
    title: "Barlian Parfume | Bau Adalah Kata, Parfum Adalah Sastra",
    description:
      "Jelajahi dunia wewangian premium eksklusif. Pesan mudah, instan, dan aman langsung terhubung ke WhatsApp.",
    siteName: "Barlian Parfume",
    images: [
      {
        url: "/og-image.webp", // Taruh file foto cover web ukuran 1200x630px di dalam folder public/
        width: 1200,
        height: 630,
        alt: "Barlian Parfume Official Catalog Cover Image",
      },
    ],
  },

  // 4. Twitter Cards (Optimasi Share ke X/Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Barlian Parfume | Varian Aroma Premium",
    description: "Katalog digital resmi wewangian eksklusif Barlian Parfume. Pesan instan langsung ke WhatsApp.",
    images: ["/og-image.webp"], // Menggunakan gambar yang sama dengan OG Image
  },

  // 5. Icons (Favicon & Device Icons)
  icons: {
    icon: [
      { url: "/favicon.ico" }, // Favicon standar
      { url: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icons/icon-512.webp", sizes: "512x512", type: "image/webp" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.webp", sizes: "180x180", type: "image/webp" }, // Untuk shortcut di iOS/iPhone
    ],
  },

  // 6. Robot Crawler (Instruksi untuk Google Search Engine)
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 7. Keamanan & Verifikasi (Opsional, isi jika sudah mendaftar Google Search Console)
  verification: {
    google: "kode-verifikasi-google-search-console-kamu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full bg-white",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        cormorant.variable,
        "font-sans",
      )}
    >
      <body className="font-inter" cz-shortcut-listen="false">
        <div vaul-drawer-wrapper="" className="w-full max-w-sm min-h-dvh h-full mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
