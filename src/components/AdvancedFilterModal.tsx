import React, { useState } from 'react';
import { X, CornerDownLeft } from 'lucide-react';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 👈 1. Tambahin minVol & maxVol di sini
  onApply: (filters: { minMcap: string; maxMcap: string; minVol: string; maxVol: string }) => void;
}

export default function AdvancedFilterModal({ isOpen, onClose, onApply }: AdvancedFilterModalProps) {
  const [minMcap, setMinMcap] = useState('');
  const [maxMcap, setMaxMcap] = useState('');
  const [minVol, setMinVol] = useState('');
  const [maxVol, setMaxVol] = useState('');

  if (!isOpen) return null;

  const handleClear = () => {
    setMinMcap('');
    setMaxMcap('');
    setMinVol('');
    setMaxVol('');
    // 👈 2. Reset volume juga
    onApply({ minMcap: '', maxMcap: '', minVol: '', maxVol: '' }); 
  };

  const handleApply = () => {
    // 👈 3. Kirim data volume pas Apply diklik
    onApply({ minMcap, maxMcap, minVol, maxVol });
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-black border border-white/20 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h3 className="text-lg font-bold tracking-tighter">
            [ ADVANCED_FILTER ]
          </h3>
          <button onClick={onClose} className="p-2 border border-white/20 hover:border-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8">
          {/* Mcap Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">[ MCAP (RITUAL) ]</label>
                <div className="text-xs text-neutral-500">1.00K - 50.0M+ RITUAL</div>
            </div>
            <div className="h-1 bg-white mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                value={minMcap}
                onChange={(e) => setMinMcap(e.target.value)}
                placeholder="Min (e.g., 10k)" 
                className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"
              />
              <input 
                type="text" 
                value={maxMcap}
                onChange={(e) => setMaxMcap(e.target.value)}
                placeholder="Max (e.g., 1m)" 
                className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"
              />
            </div>
          </div>

          {/* 24h Vol Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">[ 24H_VOL (RITUAL) ]</label>
                <div className="text-xs text-neutral-500">0 - 500K+ RITUAL</div>
            </div>
            <div className="h-1 bg-white mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                value={minVol}
                onChange={(e) => setMinVol(e.target.value)}
                placeholder="Min (e.g., 5k)" 
                className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"
              />
              <input 
                type="text" 
                value={maxVol}
                onChange={(e) => setMaxVol(e.target.value)}
                placeholder="Max (e.g., 100k)" 
                className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-6 border-t border-white/20 flex items-center justify-between bg-neutral-950">
            <button onClick={handleClear} className="text-neutral-500 hover:text-white text-sm transition-colors">
                [ CLEAR ]
            </button>
            <button onClick={handleApply} className="px-6 py-2.5 bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-neutral-300 transition-colors">
                [ APPLY ] <CornerDownLeft size={16}/>
            </button>
        </div>

      </div>
    </div>
  );
}