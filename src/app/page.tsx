"use client";

import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IOPN Platform</h1>
            <ConnectButton />
          </div>
        </div>
      </header>
      <Index />
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-purple-50 dark:from-pink-100 dark:via-yellow-100 dark:to-purple-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 text-center relative overflow-hidden bg-gradient-to-r from-pink-300 via-yellow-300 to-purple-300">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent">
              Your Identity
            </span>
            <br />
            <span className="text-white">on IOPN Network</span>
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Register your unique .opns domain and establish your presence on the decentralized web.
            Simple, secure, and yours forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/names/register">
              <button className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-pink-50 transition-colors shadow-lg hover:shadow-xl">
                Get Your Domain
              </button>
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white/20 transition-colors shadow-lg hover:shadow-xl">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200/50 hover:border-pink-300/70 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Easy to Find</h3>
            <p className="text-gray-600">
              Replace complex wallet addresses with simple, memorable names that anyone can use
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/50 hover:border-yellow-300/70 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Secure & Yours</h3>
            <p className="text-gray-600">
              Your domain is stored on-chain and fully controlled by you. No middleman, no censorship
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 hover:border-purple-300/70 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Instant Setup</h3>
            <p className="text-gray-600">
              Register your domain in seconds with just a wallet connection and small registration fee
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-pink-100 via-yellow-100 to-purple-100 p-8 rounded-3xl border border-pink-200/50 shadow-xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-yellow-600 to-purple-600 bg-clip-text text-transparent">
              Ready to claim your identity?
            </h2>
            <p className="text-lg text-gray-700">
              Join thousands of users building their presence on IOPN Network
            </p>
            <Link href="/names/register">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Register Now
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}