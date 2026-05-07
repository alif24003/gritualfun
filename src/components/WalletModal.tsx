import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  setWalletStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  setWalletAddress: (address: string | null) => void;
}

// Data provider dompet
const walletProviders = [
  { name: 'MetaMask', icon: '🦊', id: 'metamask' },
  { name: 'WalletConnect', icon: '🔗', id: 'walletconnect' },
  { name: 'Phantom', icon: '👻', id: 'phantom', text: 'DETECTED' },
];

export default function WalletModal({ isOpen, onClose, setWalletStatus, setWalletAddress }: WalletModalProps) {
  if (!isOpen) return null;

  // Simulasi fungsi konek dompet
  const handleConnect = (id: string) => {
    onClose();
    setWalletStatus('connecting');
    // Simulasi loading 1 detik
    setTimeout(() => {
      setWalletStatus('connected');
      // Alamat dummy untuk testing
      setWalletAddress('0xRitualNetworkDummyAddress1337...');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 w-full max-w-sm overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h3 className="text-lg font-bold font-mono tracking-tighter">
            [ CONNECT_WALLET ]
          </h3>
          <button onClick={onClose} className="p-2 border border-white/20 hover:border-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Pilihan Dompet */}
        <div className="p-6 space-y-3">
          {walletProviders.map(provider => (
            <button 
              key={provider.id} 
              onClick={() => handleConnect(provider.id)}
              className="w-full flex items-center justify-between gap-4 p-4 border border-white/20 hover:border-white hover:bg-white/5 transition text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{provider.icon}</span>
                <span className="font-mono text-sm font-bold text-white uppercase">{provider.name}</span>
              </div>
              {provider.text && (
                  <span className="font-mono text-xs text-green-400 bg-green-950 px-2.5 py-1">
                      {provider.text}
                  </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}