import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { NavBar } from "@/components/NavBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailyCook - Cook What You Have",
  description: "Utility-first recipe generator. Find recipes based on what's in your fridge, get fitness-focused meals, and explore global cuisines.",
  keywords: ["recipes", "cooking", "meal planning", "fitness", "nutrition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background tap-highlight-none`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen min-h-[100dvh] pb-20 safe-bottom">
            {/* Desktop header - hidden on mobile */}
            <header className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <a href="/" className="text-xl font-bold text-primary">🍳 DailyCook</a>
              </div>
            </header>

            {/* Mobile header - visible only on mobile */}
            <header className="md:hidden mobile-header border-b bg-background/95 backdrop-blur sticky top-0 z-50 safe-top">
              <div className="px-4 py-3 flex items-center justify-center">
                <a href="/" className="text-lg font-bold text-primary">🍳 DailyCook</a>
              </div>
            </header>

            <NavBar />
            <main className="max-w-4xl mx-auto px-4 py-4 md:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
