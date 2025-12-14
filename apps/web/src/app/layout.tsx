import type { Metadata } from "next";
import { Inter, EB_Garamond, Space_Mono, Roboto, Poppins, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { FontProvider } from "@/components/providers/FontProvider";
import { ResponsiveToaster } from "@/components/ResponsiveToaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${inter.variable} ${ebGaramond.variable} ${spaceMono.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FontProvider>
            <AuthProvider>
              {children}
              <ResponsiveToaster />
            </AuthProvider>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
