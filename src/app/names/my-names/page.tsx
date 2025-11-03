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
    <div className="min-h-screen p-6">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Check Ownership</h1>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="alice" className="mt-2 w-full rounded border px-3 py-2" />
        <div className="mt-4">
          <button onClick={checkOwner} className="px-4 py-2 bg-indigo-600 text-white rounded">Check Owner</button>
        </div>
        {status && <p className="mt-2 text-sm">{status}</p>}
        {owner && <p className="mt-2">Owner: {owner}</p>}
      </div>
    </div>
  );
}
