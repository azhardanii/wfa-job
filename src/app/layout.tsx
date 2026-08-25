import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "WFA JOB — Job Matching Platform dengan Escrow & Trust System",
  description: "Marketplace pekerja lepas terpercaya dengan rekening bersama (escrow) dan mata uang USD ($) ($1 = Rp. 17.000). Offer Mode & Spot Mode untuk Worker & Boss.",
  keywords: ["freelance indonesia", "escrow job", "rekening bersama", "wfa job", "remote work", "microtask"],
  authors: [{ name: "WFA Job Platform" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-teal-500 selection:text-white">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
