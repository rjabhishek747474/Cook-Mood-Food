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
      <body className={`${inter.variable} font-sans antialiased bg-background`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen pb-20 md:pb-0">
            <header className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <a href="/" className="text-xl font-bold text-primary">🍳 DailyCook</a>
              </div>
            </header>
            <NavBar />
            <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
