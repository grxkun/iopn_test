import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from '@/components/WalletProvider';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IOPN Platform",
  description: "Platform for IOPN network: deploy tokens, batch sender, buy/sell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <Header />
          <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-purple-50 dark:from-[#120323] dark:via-[#1b0736] dark:to-[#260a4a] text-gray-900 dark:text-gray-100">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
