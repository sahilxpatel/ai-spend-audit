import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "AI Spend Audit | Optimize your SaaS spend",
  description: "Audit your team's current AI tool stack. Identify unused seats, overlapping capabilities, and better pricing tiers to save you thousands annually.",
  openGraph: {
    title: "AI Spend Audit | Optimize your SaaS spend",
    description: "Audit your team's current AI tool stack. Identify unused seats, overlapping capabilities, and better pricing tiers to save you thousands annually.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit | Optimize your SaaS spend",
    description: "Audit your team's current AI tool stack. Identify unused seats, overlapping capabilities, and better pricing tiers to save you thousands annually.",
  }
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

