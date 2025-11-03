"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi } from '@/lib/contracts';

export default function MyNamesPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState<string | null>(null);

  const checkOwner = async () => {
    setStatus('Checking...');
    try {
  if (!REGISTRAR_ADDRESS) { setStatus('Registrar address not configured'); return; }
  const registrarAbi = await getRegistrarAbi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = new ethers.Contract(REGISTRAR_ADDRESS, registrarAbi as any, signer);

      const normalized = name.trim().toLowerCase();
      if (!normalized) { setStatus('Enter a name'); return; }

      const tokenId = await contract.nameToTokenId(normalized);
      if (!tokenId || tokenId === BigInt(0)) { setStatus('Name not registered'); setOwner(null); return; }
      const o = await contract.ownerOf(tokenId);
      setOwner(o);
      setStatus('');
    } catch (err) {
      setStatus('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-yellow-50 to-pink-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent">
              My .iopn
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Domains</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Check ownership and manage your registered .iopn domain names on the IOPN network.
          </p>
        </div>
      </section>

      {/* Check Ownership Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-300 via-yellow-300 to-pink-300 p-6">
              <h2 className="text-2xl font-bold text-white text-center">Check Domain Ownership</h2>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Enter .iopn Domain Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter domain name (e.g., alice)"
                    className="w-full rounded-xl border-2 border-green-200 px-4 py-4 text-lg focus:ring-4 focus:ring-green-300/50 focus:border-green-400 transition-all duration-200 bg-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 font-medium">
                    .iopn
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <button
                  onClick={checkOwner}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-yellow-400 text-white rounded-xl font-semibold text-lg hover:from-green-500 hover:to-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Check Owner
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

              {owner && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-green-600 dark:text-green-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg">Domain Registered!</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Owner Address:</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{owner}</p>
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-6 border border-green-200 mt-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Use
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Enter any .iopn domain name to check its current owner
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    If registered, you'll see the owner's wallet address
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Unregistered domains show "Name not registered"
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
