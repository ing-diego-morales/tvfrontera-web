import type { Metadata, Viewport } from "next";
import { SITIO } from "@/lib/sitio";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { AuthProvider } from "@/components/AuthProvider";
import EfectosScroll from "@/components/EfectosScroll";
import VisitorCounter from "@/components/VisitorCounter";
import RadioWidget from "@/components/RadioWidget";
import RadioProvider from "@/components/radio/RadioProvider";
import BotonArriba from "@/components/BotonArriba";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} | La gran tienda virtual de ${SITIO.empresa}`,
    template: `%s | ${SITIO.nombre}`,
  },
  description: `${SITIO.descripcion} Noticias de Cúcuta y la frontera, Puntos Aliados y el sorteo anual de ${SITIO.empresa}.`,
  applicationName: SITIO.nombre,
  openGraph: {
    title: SITIO.nombre,
    description: SITIO.descripcion,
    url: SITIO.url,
    siteName: SITIO.nombre,
    images: [{ url: "/marca/og.png", width: 1200, height: 630, alt: SITIO.nombre }],
    locale: "es_CO",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/marca/icono-32.png", sizes: "32x32", type: "image/png" },
      { url: "/marca/icono-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/marca/icono-180.png",
  },
};

// Barra del navegador en el celular con el naranja de la marca
export const viewport: Viewport = { themeColor: "#f26b1d" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITIO.nombre,
  alternateName: SITIO.empresa,
  url: SITIO.url,
  logo: `${SITIO.url}${SITIO.icono}`,
  sameAs: Object.values(SITIO.redes),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}
      >
          <AuthProvider>
          <RadioProvider>
            <Header />
            <AnnouncementTicker />
            {children}
            <Footer />
            <WhatsAppButton />
            <VisitorCounter />
            <RadioWidget />
            <BotonArriba />
            <CookieConsent />
            <EfectosScroll />
          </RadioProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
