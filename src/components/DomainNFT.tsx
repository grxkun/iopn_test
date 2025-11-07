import React from 'react';

interface DomainNFTProps {
  name: string;
  address: string;
  text: string;
}

export default function DomainNFT({ name, address, text }: DomainNFTProps) {
  return (
    <div className="max-w-sm mx-auto bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 p-1 rounded-2xl shadow-2xl">
      <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl p-6 h-full">
        <div className="text-center mb-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <span className="text-2xl font-bold text-white drop-shadow-lg">{name.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.5)'
          }}>
            {name}.opns
          </h2>
          <p className="text-sm text-gray-600">IOPN Domain NFT</p>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-200 rounded-lg p-3 shadow-inner">
            <p className="text-xs text-gray-700 uppercase tracking-wide">Owner Address</p>
            <p className="font-mono text-sm text-gray-900 break-all">{address}</p>
          </div>

          {text && (
            <div className="bg-gray-200 rounded-lg p-3 shadow-inner">
              <p className="text-xs text-gray-700 uppercase tracking-wide">Text Record</p>
              <p className="text-sm text-gray-900 break-all">{text}</p>
            </div>
          )}

          <div className="bg-gray-200 rounded-lg p-3 shadow-inner">
            <p className="text-xs text-gray-700 uppercase tracking-wide">Token ID</p>
            <p className="font-mono text-sm text-gray-900">
              {name ? BigInt('0x' + Buffer.from(name).toString('hex')).toString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-300 px-3 py-1 rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-800">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}