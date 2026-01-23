import type { Metadata, Viewport } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "@/lib/providers";
import { NavBar } from "@/components/NavBar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "DailyCook - Mood Based Recipes",
  description: "Generate recipes based on your mood and ingredients",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFD600",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${outfit.className} ${spaceMono.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Providers>
              <div className="min-h-screen flex flex-col overflow-x-hidden">
                {/* Main content area - allows full-width sections to break out */}
                <main className="flex-1 w-full pb-20">
                  {children}
                </main>
                <NavBar />
              </div>
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
