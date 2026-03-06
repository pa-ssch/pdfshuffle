import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Shuffle - Mix & Shuffle PDF Pages Online (No Uploads)",
  description:
    "Shuffle and merge PDF pages instantly in your browser. 100% local, no uploads, no tracking. Fast, private, and perfect for worksheets, tests, and creative projects.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "PDF Shuffle - Mix & Shuffle PDF Pages Online (No Uploads)",
    description:
      "Shuffle and merge PDF pages instantly in your browser. 100% local, no uploads, no tracking. Fast, private, and perfect for worksheets, tests, and creative projects.",
    url: "https://pdfshuffle.de",
    siteName: "PDF Shuffle",
    type: "website",
    images: [
      {
        url: "https://pdfshuffle.de/logo.png",
        width: 180,
        height: 180,
        alt: "PDF Shuffle Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
