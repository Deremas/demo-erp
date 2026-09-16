export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { Providers } from "@/components/app-shell/providers";
import { checkAndPerformAutoBackupAction } from "@/lib/actions/company";

import "@/app/globals.css";

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

export const metadata: Metadata = {
  title: "Demo ERP",
  description: "Advanced operational management for Demo ERP - Stock, Sales, Purchase, and Finance.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV === "production" && !isProductionBuild) {
    checkAndPerformAutoBackupAction().catch(console.error);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}