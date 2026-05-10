import React from 'react';
import Link from 'next/link'; // 👈 Import Link

interface TokenCardProps {
  id: string; // Ini isinya tokenAddress dari blockchain
  name: string;
  ticker: string;
  mcap: string;
  change: string;
  image: string;
  description?: string;
}

export default function TokenCard({ id, name, ticker, mcap, change, image, description }: TokenCardProps) {
  const isPositive = change.startsWith('+');

  return (
    // 👈 1. Bungkus Card pake Link ke folder /coin/
    <Link href={`/coin/${id}`}>
      <div className="bg-neutral-950 border border-white/10 hover:border-white/50 transition duration-300 overflow-hidden group cursor-pointer flex flex-col h-full">
        {/* Gambar Token */}
        <img 
          src={image} 
          alt={name} 
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop';
          }}
        />
        
        {/* Info Token */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-mono text-sm font-bold text-white group-hover:text-white transition truncate pr-2">
                {name} <span className="text-neutral-500">[{ticker}]</span>
              </h3>
              <span className={`shrink-0 font-mono text-xs font-medium px-2 py-0.5 ${isPositive ? 'text-green-400 bg-green-950' : 'text-red-400 bg-red-950'}`}>
                {change}
              </span>
            </div>
            
            <p className="text-neutral-500 text-xs font-light font-mono leading-relaxed mb-3 line-clamp-2 h-8">
               {description || "Zero pixels, pure character."}
            </p>
          </div>
          
          <div className="font-mono text-lg font-black tracking-wider text-white mt-auto">
            <span className="text-xs text-neutral-500 mr-2">MCAP:</span>{mcap}
          </div>
        </div>
      </div>
    </Link>
  );
}