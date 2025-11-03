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
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Resolve .iopn Name</h1>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="alice" className="mt-2 w-full rounded border px-3 py-2" />
        <div className="mt-4">
          <button onClick={doResolve} className="px-4 py-2 bg-indigo-600 text-white rounded">Resolve</button>
        </div>
        {status && <p className="mt-2 text-sm">{status}</p>}
        {result && <p className="mt-2 break-all">{result}</p>}
      </div>
    </div>
  );
}
