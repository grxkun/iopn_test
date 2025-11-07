import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from '@/components/WalletProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
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
  title: "IOPN Community domains",
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
        <ThemeProvider>
          <Header />
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-b from-light-bg-start via-light-bg-middle to-light-bg-end dark:from-dark-bg-start dark:via-dark-bg-middle dark:to-dark-bg-end text-gray-900 dark:text-gray-100">
              {children}
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
