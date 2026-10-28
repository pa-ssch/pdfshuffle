import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

import { SITE_URL } from "./site";
const TITLE = "PDF Shuffle - Mix & Shuffle PDF Pages Online (No Uploads)";
const DESCRIPTION =
  "Shuffle and merge PDF pages instantly in your browser. 100% local, no uploads, no tracking. Fast, private, and perfect for worksheets, tests, and creative projects.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "PDF Shuffle",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "PDF Shuffle",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF Shuffle – shuffle PDF pages in your browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1565c0",
  width: "device-width",
  initialScale: 1,
};

// GitHub Pages cannot send HTTP headers, so the policy is declared in the
// document. Next.js emits inline bootstrap scripts and styles, hence
// 'unsafe-inline' for those two; everything else is restricted to this origin.
// HTTPS itself is enforced by the GitHub Pages setting (redirect + HSTS).
// Not applied in development: the dev server relies on eval for source maps.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CSP} />
        )}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
