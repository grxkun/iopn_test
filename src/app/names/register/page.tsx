"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi } from '@/lib/contracts';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [availability, setAvailability] = useState<'unknown' | 'available' | 'taken' | 'invalid'>('unknown');
  const [txHash, setTxHash] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Calculate registration price based on name length
  const calculateRegistrationPrice = (domainName: string): number => {
    const length = domainName.trim().length;
    if (length === 1) return 6;
    if (length === 2) return 4;
    if (length === 3) return 3;
    return 2; // 4 and beyond
  };

  // Auto-check availability when name changes (debounced)
  useEffect(() => {
    if (!name.trim()) {
      setAvailability('unknown');
      setStatus('');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [name]);

  const checkAvailability = async () => {
    setIsChecking(true);
    setStatus('Checking availability...');
    setAvailability('unknown');

    try {
      if (!REGISTRAR_ADDRESS) {
        setStatus('Registrar address not configured. Set NEXT_PUBLIC_REGISTRAR_ADDRESS');
        return;
      }

      const registrarAbi = await getRegistrarAbi();
      console.log('Loaded registrar ABI:', registrarAbi.length, 'methods');

      // Try to use wallet provider if available and connected, otherwise use read-only provider
      let provider;
      let isWalletConnected = false;

      if (window.ethereum) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const walletProvider = new ethers.BrowserProvider((window as any).ethereum);
          const network = await walletProvider.getNetwork();
          console.log('Wallet connected to network:', network);

          // Check if user is on IOPN testnet (chain ID 984)
          if (network.chainId === BigInt(984)) {
            provider = walletProvider;
            isWalletConnected = true;
            console.log('Using wallet provider for availability check');
          }
        } catch (walletError) {
          console.log('Wallet not connected or wrong network, falling back to read-only provider');
        }
      }

      // If wallet is not connected or not on correct network, use read-only provider
      if (!provider) {
        provider = new ethers.JsonRpcProvider('https://testnet-rpc.iopn.tech');
        console.log('Using read-only provider for availability check');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new ethers.Contract(REGISTRAR_ADDRESS, registrarAbi as any, provider);

      // normalize name
      const normalized = name.trim().toLowerCase();
      console.log('Normalized name:', normalized);

      if (!normalized) {
        setStatus('Please enter a name');
        setAvailability('invalid');
        return;
      }

      // Basic client-side validation
      if (normalized.length < 3 || normalized.length > 32) {
        setStatus('Name must be 3-32 characters long');
        setAvailability('invalid');
        return;
      }

      // Check if name contains only lowercase letters and numbers
      const validChars = /^[a-z0-9]+$/;
      if (!validChars.test(normalized)) {
        setStatus('Name can only contain lowercase letters and numbers');
        setAvailability('invalid');
        return;
      }

      console.log('Calling nameToTokenId for:', normalized);
      // check availability on chain
      const tokenId = await contract.nameToTokenId(normalized);
      console.log('Token ID result:', tokenId, typeof tokenId);

      if (tokenId && tokenId !== BigInt(0)) {
        // Name is registered, let's also check the owner
        try {
          const owner = await contract.ownerOf(tokenId);
          setStatus(`Name is registered to: ${owner}`);
        } catch (ownerError) {
          setStatus('Name is already registered');
        }
        setAvailability('taken');
      } else {
        const price = calculateRegistrationPrice(normalized);
        setStatus(`Name is available! Registration cost: ${price} OPN`);
        setAvailability('available');
      }

      // Add note about connection status
      if (!isWalletConnected) {
        setStatus(prev => prev + ' (checked via public RPC)');
      }

    } catch (err) {
      console.error('Error checking availability:', err);
      setStatus('Error checking availability: ' + (err instanceof Error ? err.message : String(err)));
      setAvailability('unknown');
    } finally {
      setIsChecking(false);
    }
  };

  const register = async () => {
    if (availability !== 'available') {
      setStatus('Please check availability first');
      return;
    }

    setIsRegistering(true);
    setStatus('Preparing registration...');

    try {
      if (!REGISTRAR_ADDRESS) {
        setStatus('Registrar address not configured. Set NEXT_PUBLIC_REGISTRAR_ADDRESS');
        return;
      }
      if (!window.ethereum) {
        setStatus('Please connect a wallet');
        return;
      }

      const registrarAbi = await getRegistrarAbi();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contract = new ethers.Contract(REGISTRAR_ADDRESS, registrarAbi as any, signer);

      const normalized = name.trim().toLowerCase();
      const price = calculateRegistrationPrice(normalized);
      const priceWei = ethers.parseEther(price.toString());

      setStatus(`Sending registration transaction (fee: ${price} OPN)...`);
      const tx = await contract.register(normalized, { value: priceWei });
      setTxHash(tx.hash);
      setStatus('Waiting for confirmation...');
      await tx.wait();
      setStatus('Registration successful! 🎉');
      setAvailability('taken'); // Now it's taken
    } catch (err) {
      setStatus('Registration failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRegistering(false);
    }
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available': return 'text-green-600';
      case 'taken': return 'text-red-600';
      case 'invalid': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'available': return '✅';
      case 'taken': return '❌';
      case 'invalid': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent">
              Register Your
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">.iopn Domain</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Claim your unique identity on the IOPN network. Register your .iopn name and establish your presence in the decentralized web.
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-300 via-yellow-300 to-purple-300 p-6">
              <h2 className="text-2xl font-bold text-white text-center">Domain Registration</h2>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose Your .iopn Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your desired name (e.g., alice)"
                    className="w-full rounded-xl border-2 border-pink-200 px-4 py-4 text-lg focus:ring-4 focus:ring-pink-300/50 focus:border-pink-400 transition-all duration-200 bg-white pr-20"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {availability !== 'unknown' && name.trim() && (
                      <span className={`text-xl ${availability === 'available' ? 'text-green-500' : availability === 'taken' ? 'text-red-500' : 'text-orange-500'}`}>
                        {availability === 'available' ? '✓' : availability === 'taken' ? '✗' : '⚠'}
                      </span>
                    )}
                    <span className="text-pink-400 font-medium">.iopn</span>
                  </div>
                </div>
              </div>

              {availability !== 'unknown' && (
                <div className={`mb-6 p-4 rounded-xl border-2 transition-all duration-200 ${
                  availability === 'available'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : availability === 'taken'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAvailabilityIcon()}</div>
                    <div>
                      <p className="font-semibold text-lg">{status}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={checkAvailability}
                  disabled={isChecking || !name.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isChecking ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Checking...
                    </div>
                  ) : (
                    'Check Availability'
                  )}
                </button>

                <button
                  onClick={register}
                  disabled={isRegistering || availability !== 'available'}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isRegistering ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </div>
                  ) : (
                    'Register Domain'
                  )}
                </button>
              </div>

              {txHash && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-green-600 dark:text-green-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-green-800 dark:text-green-300">Registration Successful!</p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Transaction: <a
                      href={`https://testnet-explorer.iopn.tech/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-green-900 dark:hover:text-green-200 font-mono break-all"
                    >
                      {txHash}
                    </a>
                  </p>
                </div>
              )}

              <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                <h3 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Registration Requirements & Pricing
                </h3>
                <ul className="space-y-2 text-sm text-pink-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    Names must be 3-32 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    Only lowercase letters (a-z) and numbers (0-9) allowed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    <strong>Pricing:</strong> 1 char = 6 OPN, 2 chars = 4 OPN, 3 chars = 3 OPN, 4+ chars = 2 OPN
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    All registration revenue goes to the IOPN treasury
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
