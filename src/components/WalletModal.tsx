import React from 'react';
import { X } from 'lucide-react';
import { useConnect } from 'wagmi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Prop ini tetep disimpen biar gak error di page.tsx lu yang sekarang
  setWalletStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  setWalletAddress: (address: string | null) => void;
}

export default function WalletModal({ isOpen, onClose, setWalletStatus }: WalletModalProps) {
  // Panggil hook koneksi dari Wagmi
  const { connectors, connect } = useConnect();

  if (!isOpen) return null;

  // Cari connector MetaMask aja (Abaikan yang lain)
  const metamaskConnector = connectors.find(
    (c) => c.name.toLowerCase().includes('meta') || c.id === 'injected'
  );

  const handleConnect = () => {
    if (metamaskConnector) {
      setWalletStatus('connecting'); // Efek loading UI
      connect({ connector: metamaskConnector }); // Minta MetaMask pop-up
      onClose(); // Tutup modal
    } else {
      alert("MetaMask tidak terdeteksi! Pastikan extension sudah terinstall.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      {/* Container utama (Style pump.fun) */}
      <div className="bg-[#18191c] border border-white/5 w-full max-w-[400px] rounded-[24px] p-6 relative flex flex-col items-center shadow-2xl">
        
        {/* Tombol Close (X) di pojok */}
        <button onClick={onClose} className="absolute top-5 right-5 text-neutral-500 hover:text-white transition">
          <X size={20} />
        </button>

        {/* Logo Kapsul di Tengah */}
        <div className="w-12 h-12 bg-[#212226] rounded-full flex items-center justify-center mb-4 mt-2 border border-white/5">
          <span className="text-2xl">🎆</span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-bold text-white mb-1">
          Welcome back
        </h3>
        <p className="text-neutral-400 text-sm mb-8 text-center">
          Connect your wallet to continue.
        </p>

        {/* Tombol MetaMask Aja */}
        <button 
          onClick={handleConnect}
          className="w-full flex items-center justify-between p-4 bg-[#212226] hover:bg-[#2c2d32] rounded-xl transition-colors border border-transparent"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🦊</span>
            <span className="font-bold text-white">MetaMask</span>
          </div>
          
          {/* Badge Detected ala pump.fun */}
          <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Detected</span>
          </div>
        </button>

      </div>
    </div>
  );
}