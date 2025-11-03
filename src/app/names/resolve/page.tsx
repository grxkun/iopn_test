"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { RESOLVER_ADDRESS, getResolverAbi } from '@/lib/contracts';

export default function ResolvePage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const doResolve = async () => {
    setStatus('Resolving...');
    try {
  if (!RESOLVER_ADDRESS) { setStatus('Resolver address not configured'); return; }
  const resolverAbi = await getResolverAbi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = new ethers.Contract(RESOLVER_ADDRESS, resolverAbi as any, signer);

      const normalized = name.trim().toLowerCase();
      if (!normalized) { setStatus('Enter a name'); return; }

      const addr = await contract.resolveAddress(normalized);
      const text = await contract.resolveText(normalized);
      setResult(`address: ${addr} | text: ${text}`);
      setStatus('');
    } catch (err) {
      setStatus('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Resolve .opn
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Domains</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Look up wallet addresses and associated information for any registered .opn domain name.
          </p>
        </div>
      </section>

      {/* Resolve Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 p-6">
              <h2 className="text-2xl font-bold text-white text-center">Domain Resolution</h2>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Enter .opn Domain Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter domain name (e.g., alice)"
                    className="w-full rounded-xl border-2 border-orange-200 px-4 py-4 text-lg focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 transition-all duration-200 bg-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 font-medium">
                    .opn
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <button
                  onClick={doResolve}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-pink-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Resolve Domain
                  </div>
                </button>
              </div>

              {status && (
                <div className="mb-6 p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{status}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-orange-600 dark:text-orange-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-lg">Resolution Results</h3>
                  </div>
                  <div className="space-y-4">
                    {result.split(' | ').map((item, index) => {
                      const [label, value] = item.split(': ');
                      return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">{label}:</p>
                          <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 mt-6">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What is Domain Resolution?
                </h3>
                <ul className="space-y-2 text-sm text-orange-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Converts human-readable .opn names to wallet addresses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Shows associated text records and metadata
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Essential for sending crypto to domain names
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
