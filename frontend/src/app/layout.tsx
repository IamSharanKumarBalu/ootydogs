import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Providers } from "@/providers";
import "@/styles/globals.css";
import "@/styles/colors.css";
import "@/styles/animations.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ootydogs.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OotyDogs – Find Dogs & Pets in Ooty, Nilgiris",
    template: "%s | OotyDogs",
  },
  description:
    "Browse and adopt dogs, cats, birds and other pets in Ooty and the Nilgiris. Find verified breeders, pet services, and more on OotyDogs.",
  keywords: [
    "dogs for sale ooty", "puppies nilgiris", "pet adoption ooty",
    "dog breeders ooty", "pets for sale tamil nadu", "ootydogs",
    "pet services ooty", "dog grooming ooty",
  ],
  authors: [{ name: "OotyDogs" }],
  creator: "OotyDogs",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "OotyDogs",
    title: "OotyDogs – Find Dogs & Pets in Ooty, Nilgiris",
    description:
      "Browse and adopt dogs, cats, birds and other pets in Ooty and the Nilgiris. Verified breeders and pet services.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OotyDogs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OotyDogs – Find Dogs & Pets in Ooty",
    description: "Browse pets for adoption, verified breeders, and pet services in Ooty, Nilgiris.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Providers>
          <LayoutWrapper>
            {children}
            <Toaster position="bottom-right" />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
