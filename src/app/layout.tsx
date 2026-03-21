import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GAINS Institute — Governance for the AI Era",
    template: "%s | GAINS Institute",
  },
  description:
    "GAINS equips boards and institutions with the governance frameworks, networks, and capabilities to lead responsibly through AI transformation and the net-zero transition.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GAINS Institute",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-deep antialiased font-[family-name:var(--font-body)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
