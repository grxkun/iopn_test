"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi } from '@/lib/contracts';
import { useAccount } from 'wagmi';
import DomainNFT from '@/components/DomainNFT';

interface OwnedDomain {
  name: string;
  tokenId: string;
  address: string;
}

export default function MyNamesPage() {
  const { address, isConnected } = useAccount();
  const [ownedDomains, setOwnedDomains] = useState<OwnedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      loadOwnedDomains();
    } else {
      setOwnedDomains([]);
    }
  }, [isConnected, address]);

    const loadOwnedDomains = async () => {
    if (!address) return;

    setLoading(true);
    setError('');

    try {
      const resp = await fetch('/api/my-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!resp.ok) {
        throw new Error('Failed to fetch domains');
      }

      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const domains: OwnedDomain[] = data.domains.map((d: any) => ({
        name: d.name,
        tokenId: d.tokenId,
        address
      }));

      setOwnedDomains(domains);
    } catch (err) {
      setError('Failed to load owned domains: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-pink-400 dark:from-purple-300 dark:via-fuchsia-300 dark:to-pink-300 bg-clip-text text-transparent">
              My .opns
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Domains</span>
          </h1>

          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            View and manage your registered .opns domain names on the IOPN network.
          </p>

          {!isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-800 dark:text-yellow-200">Please connect your wallet to view your domains.</p>
            </div>
          )}
        </div>
      </section>

      {/* Owned Domains */}
      <section className="container mx-auto px-4 pb-20">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your domains...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isConnected && !loading && ownedDomains.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No domains yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't registered any .opns domains yet.</p>
            <a
              href="/names/register"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Register Your First Domain
            </a>
          </div>
        )}

        {ownedDomains.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {ownedDomains.map((domain) => (
              <DomainNFT
                key={domain.tokenId}
                name={domain.name}
                address={domain.address}
                text=""
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
