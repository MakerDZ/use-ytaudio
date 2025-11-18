import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://use-ytaudio.vercel.app"),
  title: {
    default: "YouTube Audio Player",
    template: "%s | YouTube Audio Player",
  },
  description:
    "A simple React hook for controlling hidden YouTube audio playback.",
  keywords: [
    "YouTube audio",
    "React hook",
    "YouTube player",
    "audio player",
    "hidden player",
    "frontend tools",
  ],
  authors: [{ name: "Zed" }],
  creator: "Zed",
  publisher: "Zed",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph
  openGraph: {
    type: "website",
    url: "https://your-domain.com",
    title: "YouTube Audio Player",
    description:
      "A simple React hook for controlling hidden YouTube audio playback.",
    images: [
      {
        url: "https://us-east-1.tixte.net/uploads/zed.tixte.co/use-ytaudio.png",
        width: 1200,
        height: 630,
        alt: "YouTube Audio Player preview",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "YouTube Audio Player",
    description:
      "A simple React hook for controlling hidden YouTube audio playback.",
    images:
      "https://us-east-1.tixte.net/uploads/zed.tixte.co/use-ytaudio.png",
    creator: "zed",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Alternates (optional, good for SEO)
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
