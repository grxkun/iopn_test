"use client";

import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white dark:bg-[#1a1033] border-b border-gray-200 dark:border-purple-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">IOPN Platform</Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/names/register" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/names/resolve" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Resolve
              </Link>
              <Link href="/names/my-names" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                My Names
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}