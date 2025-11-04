import React from 'react';

interface DomainNFTProps {
  name: string;
  address: string;
  text: string;
  showOwnerAddress?: boolean;
}

export default function DomainNFT({ name, address, text, showOwnerAddress = true }: DomainNFTProps) {
  const isPremium = name.length === 3;
  const isRotating = name.length > 3;

  return (
    <div className={`max-w-sm mx-auto p-1 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 ${
      isPremium
        ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600'
        : 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-500'
    }`}>
      <div className={`rounded-xl p-6 h-full ${
        isPremium
          ? 'bg-gradient-to-br from-purple-50 to-purple-100'
          : 'bg-gradient-to-br from-indigo-50 to-purple-100'
      }`}>
        <div className="text-center mb-4">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 shadow-inner ${
            isPremium
              ? 'bg-gradient-to-br from-purple-500 to-purple-700'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <span className="text-2xl font-bold text-white drop-shadow-lg">{name.charAt(0).toUpperCase()}</span>
          </div>

          {/* Premium 3D Embossed Text Effects */}
          <div className="relative mb-2">
            <h2 className={`text-3xl font-bold mb-2 ${
              isPremium
                ? 'text-purple-800'
                : isRotating
                  ? 'text-indigo-800'
                  : 'text-indigo-800'
            }`} style={{
              textShadow: isPremium
                ? '3px 3px 6px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.8), 0px 0px 10px rgba(147,51,234,0.5)'
                : isRotating
                  ? '3px 3px 6px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.8), 0px 0px 10px rgba(99,102,241,0.5)'
                  : '2px 2px 4px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.5)'
            }}>
              {name}.opns
            </h2>

            {/* Rotating Animation for >3 char domains */}
            {isRotating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="text-3xl font-bold text-gray-700 opacity-20 animate-spin-slow"
                    style={{
                      animation: 'spin 8s linear infinite',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.4)'
                    }}>
                  {name}.opns
                </h2>
              </div>
            )}

            {/* Gold Emboss Effect for 3 char domains */}
            {isPremium && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="text-3xl font-bold text-yellow-600 opacity-30"
                    style={{
                      textShadow: '4px 4px 8px rgba(0,0,0,0.8), -2px -2px 4px rgba(255,255,255,0.6), 0px 0px 15px rgba(255,215,0,0.8)'
                    }}>
                  {name}.opns
                </h2>
              </div>
            )}
          </div>

          <p className={`text-sm ${isPremium ? 'text-purple-700' : 'text-indigo-600'}`}>
            {isPremium ? 'Premium Purple NFT' : isRotating ? 'Indigo Rotating NFT' : 'IOPN Domain NFT'}
          </p>
        </div>

        <div className="space-y-3">
          {showOwnerAddress && (
            <div className={`rounded-lg p-3 shadow-inner ${
              isPremium ? 'bg-purple-100' : 'bg-indigo-100'
            }`}>
              <p className={`text-xs uppercase tracking-wide ${
                isPremium ? 'text-purple-800' : 'text-indigo-800'
              }`}>Owner Address</p>
              <p className={`font-mono text-sm break-all ${
                isPremium ? 'text-purple-900' : 'text-indigo-900'
              }`}>{address}</p>
            </div>
          )}

          {text && (
            <div className={`rounded-lg p-3 shadow-inner ${
              isPremium ? 'bg-purple-100' : 'bg-indigo-100'
            }`}>
              <p className={`text-xs uppercase tracking-wide ${
                isPremium ? 'text-purple-800' : 'text-indigo-800'
              }`}>Text Record</p>
              <p className={`text-sm break-all ${
                isPremium ? 'text-purple-900' : 'text-indigo-900'
              }`}>{text}</p>
            </div>
          )}

          <div className={`rounded-lg p-3 shadow-inner ${
            isPremium ? 'bg-purple-100' : 'bg-indigo-100'
          }`}>
            <p className={`text-xs uppercase tracking-wide ${
              isPremium ? 'text-purple-800' : 'text-indigo-800'
            }`}>Token ID</p>
            <p className={`font-mono text-sm ${
              isPremium ? 'text-purple-900' : 'text-indigo-900'
            }`}>
              {name ? BigInt('0x' + Buffer.from(name).toString('hex')).toString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full shadow-md ${
            isPremium ? 'bg-purple-300' : 'bg-indigo-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPremium ? 'bg-purple-600' : 'bg-green-500'
            }`}></div>
            <span className={`text-xs font-medium ${
              isPremium ? 'text-purple-800' : 'text-indigo-800'
            }`}>
              {isPremium ? 'Premium' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}