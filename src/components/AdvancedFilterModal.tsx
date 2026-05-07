import React from 'react';
import { X, CornerDownLeft } from 'lucide-react';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedFilterModal({ isOpen, onClose }: AdvancedFilterModalProps) {
  if (!isOpen) return null;

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

        {/* Modal Content - Mcap & Vol Inputs */}
        <div className="p-8 space-y-8">
          {/* Mcap Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">[ MCAP ($) ]</label>
                <div className="text-xs text-neutral-500">$1.00K - $50.0M+</div>
            </div>
            {/* Slider placeholder (fungsional nanti) */}
            <div className="h-1 bg-white mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Minimum (e.g., 10k, 1m)" className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"/>
              <input type="text" placeholder="Maximum (e.g., 10k, 1m)" className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"/>
            </div>
          </div>

          {/* 24h Vol Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">[ 24H_VOL ($) ]</label>
                <div className="text-xs text-neutral-500">$0 - $500K+</div>
            </div>
            {/* Slider placeholder (fungsional nanti) */}
            <div className="h-1 bg-white mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Minimum (e.g., 5k, 100k)" className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"/>
              <input type="text" placeholder="Maximum (e.g., 5k, 100k)" className="bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white text-white"/>
            </div>
          </div>
        </div>

        {/* Modal Footer - Actions */}
        <div className="p-6 border-t border-white/20 flex items-center justify-between bg-neutral-950">
            <button className="text-neutral-500 hover:text-white text-sm">
                [ CLEAR ]
            </button>
            <button className="px-6 py-2.5 bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-neutral-300 transition-colors">
                [ APPLY ] <CornerDownLeft size={16}/>
            </button>
        </div>

      </div>
    </div>
  );
}