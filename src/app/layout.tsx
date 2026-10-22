import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Gatherwise — GenAI Event Planning Assistant",
  description: "Calm, organized planning companion for weddings, milestone birthdays, and community gatherings. Track budgets, timelines, vendors, and personalized ideas.",
  keywords: ["event planning", "wedding planner", "birthday planner", "community festival", "budget tracker", "event timeline", "AI event planning"],
  authors: [{ name: "Gatherwise Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-[#FDF2EC] selection:text-[#B84E33]">
        {children}
      </body>
    </html>
  );
}
