import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "CCE Game Guide - Professional Gaming Guides & Resource Recommendations",
    template: "%s | CCE Game Guide",
  },
  description:
    "Professional gaming guide website providing the latest and most comprehensive game guides, strategy tips and resource recommendations. Including game currency, game items, game accounts and other professional service recommendations.",
  keywords: [
    "game guides",
    "gaming strategies",
    "game currency",
    "GMYGM",
    "game resources",
    "gaming tips",
    "CCE Game Guide",
  ],
  authors: [{ name: "CCE Game Guide Team" }],
  creator: "CCE Game Guide",
  publisher: "CCE Game Guide",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://game-seo-links.netlify.app",
    siteName: "CCE Game Guide",
    title:
      "CCE Game Guide - Professional Gaming Guides & Resource Recommendations",
    description:
      "Professional gaming guide website providing the latest and most comprehensive game guides, strategy tips and resource recommendations",
    images: [
      {
        url: "https://game-seo-links.netlify.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CCE Game Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "CCE Game Guide - Professional Gaming Guides & Resource Recommendations",
    description:
      "Professional gaming guide website providing the latest and most comprehensive game guides, strategy tips and resource recommendations",
    images: ["https://game-seo-links.netlify.app/og-image.jpg"],
  },
  alternates: {
    canonical: "https://game-seo-links.netlify.app",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
