'use client'; // Wajib buat component yang pake state

import React, { useState } from 'react';
import Layout from '../components/Layout';
import TokenCard from '../components/TokenCard';
import WalletModal from '../components/WalletModal';
import AdvancedFilterModal from '../components/AdvancedFilterModal';
import CreateTokenForm from '../components/CreateTokenForm';

// Data dummy buat ngetes Grid Token
const dummyTokens = [
  { id: '1', name: 'Apple', ticker: 'APPLE', mcap: '$2.48M', change: '+0.1%', image: 'https://images.unsplash.com/photo-1594913217700-112df7183e4f?q=80&w=600&auto=format&fit=crop' },
  { id: '2', name: 'Al Coach Rudi', ticker: 'RUDI', mcap: '$677K', change: '-1.2%', image: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'TROLL', ticker: 'TROLL', mcap: '$53.7M', change: '+5.4%', image: 'https://images.unsplash.com/photo-1594913217700-112df7183e4f?q=80&w=600&auto=format&fit=crop' },
  { id: '4', name: 'GoblinCoin', ticker: 'Goblin', mcap: '$4.46M', change: '+2.0%', image: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop' },
  // Tambah data lain sesuai kebutuhan...
];

// Data kategori filter
const filterCategories = ['Movers', 'Charities', 'Mayhem', 'Live', 'New', 'Oldest', 'Last trade'];

export default function PumpCloneMVPage() {
  // --- STATE UTAMA ---
  const [activeView, setActiveView] = useState<'home' | 'create'>('home'); // Nentuin mau nampilin halaman depan atau form create
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // Buka/tutup modal konek dompet
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false); // Buka/tutup modal filter Mcap/Vol
  const [selectedCategory, setSelectedCategory] = useState('New'); // Kategori filter yang dipilih

  // Placeholder buat wallet status
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <Layout 
      setActiveView={setActiveView} 
      activeView={activeView}
      setIsWalletModalOpen={setIsWalletModalOpen}
      walletStatus={walletStatus}
      walletAddress={walletAddress}
    >
      {/* --- KONDISIONAL RENDER AREA KONTEN UTAMA --- */}
      {activeView === 'home' && (
        <main className="p-8">
          {/* Header Kategori Filter */}
          <div className="mb-6 flex items-center justify-between border-b border-white/20 pb-4">
            <h2 className="text-xl font-bold font-mono tracking-tighter">
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
              {/* Tombol buat buka modal Advanced Filter */}
              <button 
                onClick={() => setIsAdvancedFilterOpen(true)}
                className="p-2 border border-white/20 hover:border-white transition-colors"
              >
                <FilterIcon />
              </button>
            </div>
          </div>

          {/* Grid buat Card Token */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {dummyTokens.map(token => (
                <TokenCard key={token.id} {...token} />
             ))}
          </div>
        </main>
      )}

      {activeView === 'create' && (
        <CreateTokenForm />
      )}

      {/* --- MODAL AREA --- */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        setWalletStatus={setWalletStatus}
        setWalletAddress={setWalletAddress}
      />
      <AdvancedFilterModal 
        isOpen={isAdvancedFilterOpen} 
        onClose={() => setIsAdvancedFilterOpen(false)} 
      />
    </Layout>
  );
}

// Icon buatan buat Filter
function FilterIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="text-neutral-500 hover:text-white transition"><path d="M4 6h16M7 12h10M10 18h4"/></svg>;
}