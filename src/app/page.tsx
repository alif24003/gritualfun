'use client';

import React, { useState, useEffect } from 'react';
// 👇 1. IMPORT formatEther DARI VIEM BUAT NGITUNG MCAP
import { formatEther } from 'viem'; 
import { useAccount, useReadContract } from 'wagmi'; 
import Layout from '../components/Layout';
import TokenCard from '../components/TokenCard';
import WalletModal from '../components/WalletModal';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import CreateTokenForm from '../components/CreateTokenForm';
import ProfileModal from '../components/ProfileModal';


import FactoryJSON from '../abis/GritualFactory.json';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

const filterCategories = ['Movers', 'New', 'Oldest', 'Last trade'];

export default function PumpCloneMVPage() {
  // --- STATE UTAMA ---
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [activeView, setActiveView] = useState<'home' | 'create' | 'leaderboard'>('home'); 
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); 
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false); 
  const [selectedCategory, setSelectedCategory] = useState('New'); 
  
  // --- STATE BUAT SEARCH & ADVANCED FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [minMcap, setMinMcap] = useState('');
  const [maxMcap, setMaxMcap] = useState('');
  const [minVol, setMinVol] = useState(''); 
  const [maxVol, setMaxVol] = useState('');

  const { address, status } = useAccount();

  const { data: blockchainTokens, isLoading: isLoadingTokens } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FactoryJSON.abi,
    functionName: 'getAllTokens',
  });

  const mappedStatus = (
    status === 'connected' ? 'connected' : 
    (status === 'connecting' || status === 'reconnecting') ? 'connecting' : 'disconnected'
  ) as 'disconnected' | 'connecting' | 'connected';

  // 1. MAPPING DATA
  let allTokens = blockchainTokens ? (blockchainTokens as any[]).map((t: any, index: number) => {
    let imageUrl = 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop';
    
    if (t.image && t.image.startsWith('ipfs://')) {
      // Pake Dedicated Gateway Pinata lu biar INSTAN!
      imageUrl = t.image.replace('ipfs://', 'https://coffee-casual-cricket-437.mypinata.cloud/ipfs/'); 
    }

    // 👇 2. RUMUS MCAP LIVE DARI SMART CONTRACT
    const TOTAL_SUPPLY = 1_000_000_000_000;
    const rReserve = t.ritualReserve ? Number(formatEther(t.ritualReserve)) : 0;
    const tReserve = t.tokenReserve ? Number(formatEther(t.tokenReserve)) : 0;
    const currentPrice = tReserve > 0 ? rReserve / tReserve : 0;
    const currentMcap = (currentPrice * TOTAL_SUPPLY).toFixed(2);

    return {
      id: t.tokenAddress || index.toString(),
      name: t.name || 'Unknown Ritual',
      ticker: t.symbol || '???',
      description: t.description || 'Zero pixels, pure character.', 
      mcap: `${currentMcap} RITUAL`, // 👈 3. DATA MCAP MASUK KE SINI
      change: '0%',
      image: imageUrl, 
      creator: t.creator 
    };
  }) : [];

  // 2. LOGIC FILTERING & SORTING SEBELUM DI-RENDER

  // A. Search Berdasarkan Nama atau Ticker
  if (searchQuery) {
    allTokens = allTokens.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // B. Sorting berdasarkan Kategori (New, Oldest)
  if (selectedCategory === 'New') {
    allTokens = [...allTokens].reverse();
  } else if (selectedCategory === 'Oldest') {
    // Biarkan apa adanya (karena default dari blockchain itu oldest first)
  } else if (selectedCategory === 'Movers' || selectedCategory === 'Last trade') {
    allTokens = [...allTokens].reverse(); 
  }

  // C. Filter berdasarkan Market Cap DAN 24H Volume
  const parseFilterValue = (val: string) => {
    if (!val) return null;
    const cleanVal = val.toLowerCase().replace(/[^0-9km.]/g, ''); 
    if (cleanVal.endsWith('k')) return parseFloat(cleanVal) * 1000;
    if (cleanVal.endsWith('m')) return parseFloat(cleanVal) * 1000000;
    return parseFloat(cleanVal) || 0;
  };

  const minMcapVal = parseFilterValue(minMcap);
  const maxMcapVal = parseFilterValue(maxMcap);
  const minVolVal = parseFilterValue(minVol);
  const maxVolVal = parseFilterValue(maxVol);

  // Jalankan filter kalau user ngisi salah satu input di Modal
  if (minMcapVal !== null || maxMcapVal !== null || minVolVal !== null || maxVolVal !== null) {
    allTokens = allTokens.filter(t => {
      // Data dummy sementara: mcap diambil dari string, vol dianggap 0
      const currentMcap = parseFloat(t.mcap.split(' ')[0]) || 0; 
      const currentVol = 0; // Nanti diganti jadi t.volume24h kalau kontraknya udah ngirim data volume
      
      const isAboveMinMcap = minMcapVal !== null ? currentMcap >= minMcapVal : true;
      const isBelowMaxMcap = maxMcapVal !== null ? currentMcap <= maxMcapVal : true;

      const isAboveMinVol = minVolVal !== null ? currentVol >= minVolVal : true;
      const isBelowMaxVol = maxVolVal !== null ? currentVol <= maxVolVal : true;
      
      return isAboveMinMcap && isBelowMaxMcap && isAboveMinVol && isBelowMaxVol;
    });
  }

  // Filter khusus token milik user yang sedang login (buat di profil)
  const myTokens = allTokens.filter(t => 
    t.creator?.toLowerCase() === address?.toLowerCase()
  );

  if (!isMounted) return <div className="min-h-screen bg-black" />;
    
  return (
    <Layout 
      setActiveView={setActiveView} 
      activeView={activeView}
      setIsWalletModalOpen={setIsWalletModalOpen}
      setIsProfileModalOpen={setIsProfileModalOpen}
      walletStatus={mappedStatus} 
      walletAddress={address || null}
      searchQuery={searchQuery}         
      setSearchQuery={setSearchQuery}   
    >
      {activeView === 'home' && (
        <main className="p-8">
          <div className="mb-6 flex items-center justify-between border-b border-white/20 pb-4">
            <h2 className="text-xl font-bold font-mono tracking-tighter text-white">
              EXPLORE COINS
            </h2>
            <div className="flex items-center gap-3">
              {filterCategories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 border font-mono text-sm transition-colors ${selectedCategory === cat ? 'bg-white text-black border-white' : 'border-white/20 text-neutral-400 hover:text-white hover:border-white'}`}
                >
                  [{cat.toUpperCase()}]
                </button>
              ))}
              <button 
                onClick={() => setIsAdvancedFilterOpen(true)}
                className="p-2 border border-white/20 hover:border-white transition-colors"
              >
                <FilterIcon />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingTokens ? (
              <div className="col-span-full py-20 text-center font-mono text-neutral-500 animate-pulse">
                [ SCANNING RITUAL NETWORK... ]
              </div>
            ) : allTokens.length > 0 ? (
              allTokens.map((token) => (
                <TokenCard key={token.id} {...token} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center font-mono text-neutral-600">
                [ NO TOKENS FOUND MATCHING CRITERIA ]
              </div>
            )}
          </div>
        </main>
      )}

      {activeView === 'create' && (
        <CreateTokenForm />
      )}

      {activeView === 'leaderboard' && (
        <main className="p-8">
            <div className="border-b border-white/20 pb-4 mb-6">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-white">
                  [ TOP RITUALS LEADERBOARD ]
                </h2>
                <p className="text-neutral-500 text-sm mt-2">Ranked by Highest Market Cap.</p>
            </div>

            <div className="space-y-4">
              {isLoadingTokens ? (
                <div className="py-20 text-center font-mono text-neutral-500 animate-pulse">
                  [ SCANNING RITUAL NETWORK... ]
                </div>
              ) : allTokens.length > 0 ? (
                // Logic urutin dari MCAP tertinggi (descending)
                [...allTokens]
                  .sort((a, b) => parseFloat(b.mcap.split(' ')[0]) - parseFloat(a.mcap.split(' ')[0]))
                  .map((token, index) => (
                    <div key={token.id} className="flex items-center gap-6 p-4 border border-white/10 bg-neutral-950 hover:border-white/50 transition cursor-pointer">
                      <div className="text-2xl font-black text-neutral-700 w-10">#{index + 1}</div>
                      
                      <img 
                        src={token.image} 
                        alt={token.name} 
                        className="w-16 h-16 object-cover border border-white/10" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-white uppercase text-lg leading-tight">
                          {token.name} <span className="text-neutral-500">[{token.ticker}]</span>
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-1">
                          {token.description}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono text-xl font-black text-white">{token.mcap}</div>
                        <div className="text-[10px] text-green-500 border border-green-900 bg-green-950/30 px-2 py-0.5 mt-1 inline-block">
                          Vol 24H: 0.00 RITUAL
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-20 text-center font-mono text-neutral-600 border border-dashed border-white/10">
                  [ NO RITUALS TO RANK YET ]
                </div>
              )}
            </div>
        </main>
      )}

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        setWalletStatus={() => {}}
        setWalletAddress={() => {}}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        address={address}
        userTokens={myTokens} 
      />

      <AdvancedFilterModal 
        isOpen={isAdvancedFilterOpen} 
        onClose={() => setIsAdvancedFilterOpen(false)} 
        onApply={(filters) => {
          setMinMcap(filters.minMcap);
          setMaxMcap(filters.maxMcap);
          setMinVol(filters.minVol);
          setMaxVol(filters.maxVol);
        }}
      />
    </Layout>
  );
}

function FilterIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-neutral-500 hover:text-white transition"><path d="M4 6h16M7 12h10M10 18h4"/></svg>;
}