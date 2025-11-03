"use client";

import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [availability, setAvailability] = useState<'unknown' | 'available' | 'taken' | 'invalid'>('unknown');
  const [txHash, setTxHash] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const checkAvailability = async () => {
    setIsChecking(true);
    setStatus('Checking availability...');
    setAvailability('unknown');

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

      // normalize name
      const normalized = name.trim().toLowerCase();
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

      // check availability on chain
      const tokenId = await contract.nameToTokenId(normalized);
      if (tokenId && tokenId !== BigInt(0)) {
        setStatus('Name is already registered');
        setAvailability('taken');
      } else {
        setStatus('Name is available!');
        setAvailability('available');
      }
    } catch (err) {
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

      // get fee
      const feeWei = await contract.registrationFeeWei();
      const feeEth = ethers.formatEther(feeWei);

      setStatus(`Sending registration transaction (fee: ${feeEth} OPN)...`);
      const tx = await contract.register(normalized, { value: feeWei });
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/iopn-logo.png" alt="IOPN Logo" className="h-10 w-10" />
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              .iopn
            </div>
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="container mx-auto px-4 pt-20 pb-32 text-center relative overflow-hidden"
        style={{
          backgroundImage: `url(/hero-background.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Identity
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">on IOPN Network</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Register your unique .iopn domain and establish your presence on the decentralized web.
            Simple, secure, and yours forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="#register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg transition-colors">
                Get Your Domain
              </button>
            </a>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg px-8 py-3 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="container mx-auto px-4 pb-20">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Check Available Registrar</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name (without .iopn)</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAvailability('unknown');
                setStatus('');
              }}
              placeholder="Enter name (3-32 chars, lowercase letters & numbers only)"
              className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {availability !== 'unknown' && (
            <div className={`mb-4 p-3 rounded ${getAvailabilityColor()} bg-opacity-10 border`}>
              <p className="flex items-center gap-2">
                <span>{getAvailabilityIcon()}</span>
                <span>{status}</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={checkAvailability}
              disabled={isChecking || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? 'Checking...' : 'Check Availability'}
            </button>

            <button
              onClick={register}
              disabled={isRegistering || availability !== 'available'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? 'Minting...' : 'Mint'}
            </button>
          </div>

          {txHash && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Transaction: <a
                  href={`https://testnet-explorer.iopn.tech/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {txHash}
                </a>
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <p>• Names must be 3-32 characters long</p>
            <p>• Only lowercase letters (a-z) and numbers (0-9) allowed</p>
            <p>• Registration requires a small fee in OPN tokens</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy to Find</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Replace complex wallet addresses with simple, memorable names that anyone can use
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Yours</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your domain is stored on-chain and fully controlled by you. No middleman, no censorship
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Setup</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Register your domain in seconds with just a wallet connection and small registration fee
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to claim your identity?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of users building their presence on IOPN Network
            </p>
            <a href="#register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg transition-colors">
                Register Now
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
