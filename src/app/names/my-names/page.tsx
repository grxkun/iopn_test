"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi, getResolverAbi } from '@/lib/contracts';
import DomainNFT from '@/components/DomainNFT';

interface OwnedDomain {
  name: string;
  tokenId: string;
  owner: string;
  text?: string;
}

export default function MyNamesPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'my-domains' | 'search-any'>('my-domains');
  const [ownedDomains, setOwnedDomains] = useState<OwnedDomain[]>([]);
  const [loadingOwned, setLoadingOwned] = useState(false);

  // Load owned domains when component mounts
  useEffect(() => {
    loadOwnedDomains();
  }, []);

  const loadOwnedDomains = async () => {
    setLoadingOwned(true);
    try {
      if (!REGISTRAR_ADDRESS) {
        setStatus('Registrar address not configured');
        return;
      }
      const registrarAbi = await getRegistrarAbi();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new ethers.Contract(REGISTRAR_ADDRESS, registrarAbi as any, provider);

      // Query Transfer events in chunks to avoid block range limits
      const currentBlock = await provider.getBlockNumber();
      const chunkSize = 10000; // 10k blocks max per query
      const fromBlock = Math.max(0, currentBlock - 100000); // Last 100k blocks

      const transferEvents: any[] = [];
      
      for (let startBlock = fromBlock; startBlock <= currentBlock; startBlock += chunkSize) {
        const endBlock = Math.min(currentBlock, startBlock + chunkSize - 1);
        
        try {
          const chunkEvents = await contract.queryFilter(
            contract.filters.Transfer('0x0000000000000000000000000000000000000000', userAddress),
            startBlock,
            endBlock
          );
          transferEvents.push(...chunkEvents);
        } catch (error) {
          console.warn(`Failed to query blocks ${startBlock}-${endBlock}:`, error);
          // Continue with other chunks
        }
      }

      const domains: OwnedDomain[] = [];
      for (const event of transferEvents) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokenId = (event as any).args?.tokenId;
        if (tokenId) {
          try {
            const domainName = await contract.tokenIdToName(tokenId);
            const ownerAddress = await contract.ownerOf(tokenId);
            let textRecord = '';
            try {
              // Try to get text record from resolver
              const resolverAbi = await getResolverAbi();
              const resolverAddress = await contract.resolver();
              if (resolverAddress && resolverAddress !== '0x0000000000000000000000000000000000000000') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const resolverContract = new ethers.Contract(resolverAddress, resolverAbi as any, provider);
                textRecord = await resolverContract.text(domainName, 'description') || '';
              }
            } catch (textErr) {
              // Text record is optional, continue without it
              console.warn('Failed to get text record for domain:', domainName);
            }
            
            domains.push({
              name: domainName,
              tokenId: tokenId.toString(),
              owner: ownerAddress,
              text: textRecord
            });
          } catch (err) {
            // Skip if tokenIdToName fails
            console.warn('Failed to get name for tokenId:', tokenId);
          }
        }
      }

      setOwnedDomains(domains);
      if (domains.length === 0) {
        setStatus('No owned domains found');
      }
    } catch (err) {
      setStatus('Error loading owned domains: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingOwned(false);
    }
  };

  const checkOwner = async () => {
    setStatus('Searching...');
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

      if (searchMode === 'my-domains') {
        // Check if the connected wallet owns this domain
        const tokenId = await contract.nameToTokenId(normalized);
        if (!tokenId || tokenId === BigInt(0)) {
          setStatus('Domain not registered');
          setOwner(null);
          return;
        }

        const domainOwner = await contract.ownerOf(tokenId);
        const userAddress = await signer.getAddress();

        if (domainOwner.toLowerCase() === userAddress.toLowerCase()) {
          setOwner(domainOwner);
          setStatus('You own this domain!');
        } else {
          setOwner(domainOwner);
          setStatus(`Domain owned by: ${domainOwner}`);
        }
      } else {
        // Search any domain - just check if it exists and who owns it
        const tokenId = await contract.nameToTokenId(normalized);
        if (!tokenId || tokenId === BigInt(0)) {
          setStatus('Domain not registered');
          setOwner(null);
          return;
        }

        const domainOwner = await contract.ownerOf(tokenId);
        setOwner(domainOwner);
        setStatus(`Domain registered to: ${domainOwner}`);
      }
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
              {searchMode === 'my-domains' ? 'My .opns' : 'Search .opns'}
            </span>
            <br />
            <span className="text-gray-800">Domains</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {searchMode === 'my-domains'
              ? 'Check ownership and manage your registered .opns domain names on the IOPN network.'
              : 'Search and discover registered .opns domain names and their owners.'
            }
          </p>
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 border border-green-200/50 shadow-lg">
              <button
                onClick={() => setSearchMode('my-domains')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  searchMode === 'my-domains'
                    ? 'bg-green-400 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Domains
              </button>
              <button
                onClick={() => setSearchMode('search-any')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  searchMode === 'search-any'
                    ? 'bg-pink-400 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Search All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Check Ownership Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-300 via-yellow-300 to-pink-300 p-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {searchMode === 'my-domains' ? 'Check Domain Ownership' : 'Search Any Domain'}
              </h2>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Enter .opns Domain Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter domain name (e.g., alice)"
                    className="w-full rounded-xl border-2 border-green-200 px-4 py-4 text-lg focus:ring-4 focus:ring-green-300/50 focus:border-green-400 transition-all duration-200 bg-white"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 font-medium">
                    .opns
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
                    {searchMode === 'my-domains' ? 'Check My Ownership' : 'Search Domain'}
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
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all mb-2">{owner}</p>
                    <div className="flex gap-2">
                      <a
                        href={`https://testnet.iopn.tech/address/${owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:text-green-700 underline"
                      >
                        View on Explorer →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Owned Domains Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Your Owned Domains
                </h3>

                {loadingOwned ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                    <span className="ml-3 text-gray-600">Loading owned domains...</span>
                  </div>
                ) : ownedDomains.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedDomains.map((domain, index) => (
                      <DomainNFT
                        key={index}
                        name={domain.name}
                        address={domain.owner}
                        text={domain.text || ''}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg font-medium">No owned domains found</p>
                    <p className="text-sm mt-2">Register your first .opns domain to see it here!</p>
                  </div>
                )}
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200 mt-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {searchMode === 'my-domains' ? 'How to Use' : 'Search Information'}
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  {searchMode === 'my-domains' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Enter any .opns domain name to check if you own it
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        If registered to your address, you'll see ownership confirmation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Unregistered domains show "Domain not registered"
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Search for any registered .opns domain name
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        See who owns the domain and current registration status
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Perfect for checking domain availability before registration
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
