import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OnyxFit — The Final Link Between Trainer and Athlete",
  description:
    "OnyxFit is the all-in-one platform for personal trainers and their clients. Programming, progress, communication, and payments — unified in one elite workspace. Join the waitlist.",
  keywords: [
    "personal trainer software",
    "fitness coaching app",
    "online coaching platform",
    "workout builder",
    "client management",
    "OnyxFit",
  ],
  authors: [{ name: "OnyxFit" }],
  openGraph: {
    title: "OnyxFit — Forged in Iron",
    description:
      "The only platform trainers and athletes will ever need. Early access open.",
    type: "website",
    siteName: "OnyxFit",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnyxFit — Forged in Iron",
    description:
      "The only platform trainers and athletes will ever need. Early access open.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-zinc-950 font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
