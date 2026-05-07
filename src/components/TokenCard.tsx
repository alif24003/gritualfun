import React from 'react';

interface TokenCardProps {
  id: string;
  name: string;
  ticker: string;
  mcap: string;
  change: string;
  image: string;
}

export default function TokenCard({ id, name, ticker, mcap, change, image }: TokenCardProps) {
  const isPositive = change.startsWith('+');

  return (
    <div className="bg-neutral-950 border border-white/10 hover:border-white/50 transition duration-300 overflow-hidden group cursor-pointer flex flex-col">
      {/* Gambar Token */}
      <img 
        src={image} 
        alt={name} 
        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
      />
      
      {/* Info Token */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-mono text-sm font-bold text-white group-hover:text-white transition">
              {name} <span className="text-neutral-500">[{ticker}]</span>
            </h3>
            <span className={`font-mono text-xs font-medium px-2 py-0.5 ${isPositive ? 'text-green-400 bg-green-950' : 'text-red-400 bg-red-950'}`}>
              {change}
            </span>
          </div>
          <p className="text-neutral-500 text-xs font-light font-mono leading-relaxed mb-3">
             The first $DOGE clone on Ritual Network. Zero taxes, zero utility, all pure character. [RITUAL ONLY]
          </p>
        </div>
        
        {/* Market Cap (Menonjol seperti di pump.fun) */}
        <div className="font-mono text-lg font-black tracking-wider text-white">
          <span className="text-xs text-neutral-500 mr-2">MCAP:</span>{mcap}
        </div>
      </div>
    </div>
  );
}