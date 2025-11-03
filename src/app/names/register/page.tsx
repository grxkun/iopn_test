"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { REGISTRAR_ADDRESS, getRegistrarAbi } from '@/lib/contracts';

export default function RegisterPage() {
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
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Register .iopn Name</h1>

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
            className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? 'Registering...' : 'Register'}
          </button>
        </div>

        {txHash && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Transaction: <a
                href={`https://explorer.iopn.tech/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
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
    </div>
  );
}
