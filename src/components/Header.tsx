"use client";

import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-light-header dark:bg-dark-header border-b border-light-border dark:border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">IOPN Community domains</Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/names/register" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                Register
              </Link>
              <Link href="/names/resolve" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                Resolve
              </Link>
              <Link href="/names/my-names" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                My Names
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ConnectButton showBalance={true} accountStatus="address" />
          </div>
        </div>
      </div>
    </header>
  );
}