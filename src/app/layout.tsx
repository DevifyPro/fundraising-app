import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthNav from "@/components/AuthNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fundraising Platform",
  description: "A simple GoFundMe-style fundraising platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Fundraise
            </a>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
              <a href="/campaigns" className="hover:text-zinc-900">
                Explore
              </a>
              <a href="/dashboard" className="hover:text-zinc-900">
                Your campaigns
              </a>
              <a href="/dashboard/payments" className="hidden text-xs text-zinc-600 hover:text-zinc-900 sm:inline">
                Payouts
              </a>
              <AuthNav />
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-56px)] max-w-5xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} Fundraise</span>
            <span>Built with Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
