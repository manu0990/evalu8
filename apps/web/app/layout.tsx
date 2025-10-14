import type { Metadata } from "next";
import { Handlee, EB_Garamond, Space_Mono } from "next/font/google";
import { Toaster } from "@repo/ui";
import "./globals.css";

const patrickHand = Handlee({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "evalu8",
  description:
    "evalu8 is a modern web application that helps you to evaluate users' interview cracking capability by taking a moch interview with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} ${patrickHand.variable} ${spaceMono.variable}`}
      >
        {children}
        <Toaster richColors closeButton position="bottom-right" />
      </body>
    </html>
  );
}
