import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whatcha Reading",
  description: "Discover what's in the DNA of your favourite books — and what to read next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-amber-50 text-stone-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-amber-50/95 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-6 h-12 flex items-center">
            <Link href="/" className="text-sm font-semibold text-stone-800 tracking-wide hover:text-stone-600 transition-colors">
              whatcha reading
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
