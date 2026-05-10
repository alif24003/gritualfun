import React from 'react';
import { X, LogOut, Wallet, ExternalLink } from 'lucide-react';
import { useDisconnect, useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: `0x${string}` | undefined;
  userTokens: any[]; // 👈 1. TAMBAHIN INI BIAR GAK ERROR
}

export default function ProfileModal({ isOpen, onClose, address, userTokens }: ProfileModalProps) {
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  if (!isOpen) return null;

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#18191c] border border-white/5 w-full max-w-[420px] rounded-[24px] p-6 relative flex flex-col shadow-2xl">
        
        {/* Tombol Close */}
        <button onClick={onClose} className="absolute top-5 right-5 text-neutral-500 hover:text-white transition">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center">
          {/* Icon Dompet */}
          <div className="w-16 h-16 bg-[#212226] rounded-full flex items-center justify-center mb-4 mt-2 border border-white/5">
            <Wallet size={28} className="text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-1">Your Wallet</h3>
          
          <p className="text-neutral-400 font-mono text-xs mb-6 bg-black/30 px-4 py-1.5 rounded-full border border-white/10">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
          </p>
        </div>

        {/* Saldo RITUAL */}
        <div className="w-full bg-[#212226] rounded-xl p-4 mb-6 border border-white/5 flex justify-between items-center">
          <span className="text-neutral-400 font-bold text-xs uppercase tracking-wider">Balance</span>
          <div className="text-right">
            <span className="text-xl font-black text-white">
              {balance?.value ? Number(formatEther(balance.value)).toFixed(4) : '0.00'}
            </span>
            <span className="text-neutral-500 text-xs ml-2 font-bold uppercase">Ritual</span>
          </div>
        </div>

        {/* 👈 2. SECTION MY TOKENS */}
        <div className="w-full mb-6">
          <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 px-1">
            [ My Created Tokens ]
          </h4>
          
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {userTokens && userTokens.length > 0 ? (
              userTokens.map((token, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#212226]/50 border border-white/5 rounded-xl hover:border-white/20 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-xs">
                      🎆
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{token.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">${token.ticker}</p>
                    </div>
                  </div>
                  <button className="p-2 text-neutral-500 hover:text-white transition">
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border border-dashed border-white/5 rounded-xl text-neutral-600 text-xs">
                No rituals performed yet.
              </div>
            )}
          </div>
        </div>

        {/* Tombol Disconnect */}
        <button 
          onClick={handleDisconnect}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-xl transition-all border border-red-500/10"
        >
          <LogOut size={16} />
          Disconnect Wallet
        </button>

      </div>
    </div>
  );
}