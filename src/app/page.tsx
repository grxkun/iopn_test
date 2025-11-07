"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Index />
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 text-center relative overflow-hidden bg-gradient-to-r from-pink-300 via-yellow-300 to-purple-300 dark:from-[#2a0d56] dark:via-[#3a0e6f] dark:to-[#4c1291] rounded-3xl">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20"></div>
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 dark:from-purple-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent">
              Your Identity
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">on IOPN Network</span>
          </h1>

          <p className="text-xl text-gray-700 dark:text-purple-100 max-w-2xl mx-auto">
            Register your unique .opns domain and establish your presence on the decentralized web.
            Simple, secure, and yours forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/names/register">
              <button className="bg-white dark:bg-purple-700 text-purple-700 dark:text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 dark:hover:bg-purple-600 transition-colors shadow-lg hover:shadow-xl">
                Get Your Domain
              </button>
            </Link>
            <button className="border-2 border-white dark:border-white text-white dark:text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white/20 dark:hover:bg-white/20 transition-colors shadow-lg hover:shadow-xl">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/90 dark:bg-purple-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-700/40 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-purple-50">Easy to Find</h3>
            <p className="text-gray-700 dark:text-purple-100/90">
              Replace complex wallet addresses with simple, memorable names that anyone can use
            </p>
          </div>

          <div className="bg-white/90 dark:bg-purple-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-700/40 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-purple-50">Secure & Yours</h3>
            <p className="text-gray-700 dark:text-purple-100/90">
              Your domain is stored on-chain and fully controlled by you. No middleman, no censorship
            </p>
          </div>

          <div className="bg-white/90 dark:bg-purple-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 transform hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-700/40 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-purple-50">Instant Setup</h3>
            <p className="text-gray-700 dark:text-purple-100/90">
              Register your domain in seconds with just a wallet connection and small registration fee
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-100/60 via-pink-100/60 to-yellow-100/60 dark:from-[#2a0d56]/60 dark:via-[#3a0e6f]/60 dark:to-[#4c1291]/60 p-8 rounded-3xl border border-purple-200 dark:border-purple-600/40 shadow-xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 dark:from-purple-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent">
              Ready to claim your identity?
            </h2>
            <p className="text-lg text-gray-700 dark:text-purple-100">
              Join thousands of users building their presence on IOPN Network
            </p>
            <Link href="/names/register">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-500 dark:to-fuchsia-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-600 dark:hover:to-fuchsia-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Register Now
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}