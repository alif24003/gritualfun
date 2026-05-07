import React, { useState } from 'react';
import { ImagePlus, Info, Check } from 'lucide-react';

export default function CreateTokenForm() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };

  return (
    <main className="p-8 font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Left Column - Form Details */}
        <div className="xl:col-span-2 space-y-10">
            <div className="border-b border-white/20 pb-4">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-white">
                  [ CREATE NEW RITUAL TOKEN ]
                </h2>
                <div className="flex items-center gap-3 mt-3 text-neutral-400">
                    <Info size={16} />
                    <p className="text-xs">Zero pixels, pure character. Token details cannot be changed after creation.</p>
                </div>
            </div>

            {/* Upload Area (Dibuat minimalis, bisa di-klik) */}
            <div>
              <label htmlFor="file-upload" className="w-full flex items-center justify-center aspect-video border border-dashed border-white/10 hover:border-white group cursor-pointer transition">
                <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                <div className="text-center p-8 space-y-3 flex flex-col items-center">
                    <ImagePlus size={32} className="text-neutral-700 group-hover:text-white transition"/>
                    <p className="text-sm font-medium text-neutral-500 group-hover:text-white transition">
                        [ SELECT VIDEO OR IMAGE ]
                    </p>
                    <p className="text-xs text-neutral-700 leading-relaxed max-w-xs group-hover:text-neutral-500 transition">
                        Min. 1000x1000px, 1:1 square recommended for maximum character clarity. [MAX_15MB]
                    </p>
                </div>
              </label>
              {fileToUpload && (
                <div className="mt-3 text-xs text-green-400 bg-green-950 px-3 py-1 flex items-center gap-2 inline-block">
                    <Check size={14} /> [FILE_SELECTED: {fileToUpload.name}]
                </div>
              )}
            </div>

            {/* Inputs - Coin Name & Ticker */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-white mb-2 uppercase">[ COIN_NAME ]</label>
                    <input type="text" placeholder="Name your Pure Art..." className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white transition text-white"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-white mb-2 uppercase">[ TICKER ]</label>
                    <input type="text" placeholder="Add a pure ticker (e.g. ASCII)" className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white transition text-white"/>
                </div>
            </div>

            {/* Inputs - Description */}
            <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase">[ DESCRIPTION ]</label>
                <textarea placeholder="Write a short art statement..." rows={4} className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-white transition resize-none text-white"></textarea>
            </div>

            {/* Create Button (White Minimal) */}
            <div className="pt-6">
                <button className="w-full py-4 bg-white text-black font-bold text-sm hover:bg-neutral-300 transition-colors">
                    [ LOGIN TO CREATE TOKEN ]
                </button>
            </div>
        </div>

        {/* Right Column - Preview Placeholder */}
        <div className="border border-white/10 p-6 xl:sticky xl:top-6 self-start bg-neutral-950">
          <div className="w-full aspect-video border border-dashed border-neutral-800 flex items-center justify-center text-center mb-4 overflow-hidden relative">
            {fileToUpload ? (
              <img 
                src={URL.createObjectURL(fileToUpload)} 
                alt="Token Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-neutral-700 text-sm leading-relaxed p-8">
                [ ART_PREVIEW: How your coin character will manifest on-chain ]
              </p>
            )}
          </div>
          <p className="text-neutral-500 text-xs font-light text-center">
            {fileToUpload ? '[ PREVIEW_READY ]' : 'Preview will update after file selection.'}
          </p>
        </div>
        
      </div>
    </main>
  );
}