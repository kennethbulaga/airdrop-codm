import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://airdropcodm.com");

export const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Airdrop | CODM Battle Royale Settings, HUD Codes & Sensitivity Vault",
    template: "%s | Airdrop CODM",
  },
  description:
    "Sub-second discovery, multi-dimensional filtering, and 1-tap copying of CODM Season 8 Battle Royale HUD codes, iPad sensitivity settings, 4-finger claw layouts, and graphics configurations for Garena & Global.",
  applicationName: "Airdrop",
  authors: [{ name: "Kenneth Bulaga", url: "https://github.com/kennethbulaga" }],
  creator: "Kenneth Bulaga",
  publisher: "Airdrop",
  category: "game",
  keywords: [
    "CODM HUD codes",
    "CODM sensitivity settings",
    "CODM Season 8 Battle Royale settings",
    "Garena CODM layouts",
    "4-Finger claw CODM HUD",
    "iPad CODM sensitivity",
    "CODM graphics settings",
    "Call of Duty Mobile sensitivity share code",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Airdrop",
    title: "Airdrop | CODM Battle Royale Settings, HUD Codes & Sensitivity Vault",
    description:
      "Find and 1-tap copy top CODM HUD codes, 4-finger claw layouts, and iPad sensitivity curves for Season 8 Battle Royale.",
    images: [
      {
        url: "/airdrop-logo.webp",
        width: 512,
        height: 512,
        alt: "Airdrop CODM Settings Vault",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Airdrop | CODM Battle Royale Community Settings Vault",
    description:
      "1-tap copy verified CODM Season 8 HUD layouts, sensitivity settings, and graphics configurations.",
    images: ["/airdrop-logo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Airdrop",
  },
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
