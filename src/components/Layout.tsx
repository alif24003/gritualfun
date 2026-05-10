import React, { useState } from 'react';
import { Home, BarChart3, PlusSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  setActiveView: (view: 'home' | 'create' | 'leaderboard') => void;
  activeView: 'home' | 'create' | 'leaderboard';
  setIsWalletModalOpen: (isOpen: boolean) => void;
  setIsProfileModalOpen: (isOpen: boolean) => void; 
  walletStatus: 'disconnected' | 'connecting' | 'connected';
  walletAddress: string | null;
  // 👈 1. TAMBAHIN PROPS SEARCH INI BIAR GAK ERROR MERAH
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Layout({ 
  children, 
  setActiveView, 
  activeView, 
  setIsWalletModalOpen, 
  setIsProfileModalOpen, 
  walletStatus, 
  walletAddress,
  searchQuery,       // 👈 Tangkep propsnya
  setSearchQuery     // 👈 Tangkep propsnya
}: LayoutProps) {
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderMenuItem = (label: string, Icon: React.ElementType, view: 'home' | 'create' | 'leaderboard', action?: () => void) => {
    const isActive = activeView === view;
    return (
      <button 
        onClick={() => { setActiveView(view); action?.(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-sm transition ${isActive ? 'bg-white/10 border border-white/20 text-white' : 'border border-transparent text-neutral-400 hover:text-white hover:bg-white/5'}`}
      >
        <Icon size={isSidebarCollapsed ? 22 : 18} />
        {!isSidebarCollapsed && `[ ${label.toUpperCase()} ]`}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} border-r border-white/20 flex flex-col justify-between p-4 transition-all duration-300`}>
        <div>
          {/* Logo / Brand + Collapse Button */}
          <div className="mb-10 px-2 flex items-center justify-between">
            {!isSidebarCollapsed && (
                <h1 className="text-2xl font-black tracking-tighter">
                  GRITUAL<span className="text-neutral-500">.FUN</span>
                </h1>
            )}
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 border border-white/20 hover:border-white transition-colors">
                {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2.5">
            {renderMenuItem('home', Home, 'home')}
            {renderMenuItem('leaderboard', BarChart3, 'leaderboard')}
            
            <button 
                onClick={() => setActiveView('create')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-sm transition mt-6 ${activeView === 'create' ? 'bg-white/10 border border-white/20 text-white' : 'border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-white/50'}`}
            >
                <PlusSquare size={isSidebarCollapsed ? 22 : 18} />
                {!isSidebarCollapsed && '[ CREATE TOKEN ]'}
            </button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col">
        
        {/* TOP NAVBAR */}
        <header className="h-20 border-b border-white/20 flex items-center justify-between px-8 bg-neutral-950">
          
          <div className="flex w-1/3 items-center gap-3">
            {/* 👈 2. INPUT SEARCH SEKARANG TERSAMBUNG KE STATE */}
            <input 
              type="text" 
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Search for coins (name/ticker)..." 
              className="w-full bg-transparent border border-white/20 px-5 py-3 font-mono text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setActiveView('create')}
                className="px-6 py-2 border border-white font-mono text-sm hover:bg-neutral-800 transition-colors"
            >
              + CREATE
            </button>
            
            <button 
                onClick={() => {
                  if (walletStatus === 'connected') {
                    setIsProfileModalOpen(true);
                  } else {
                    setIsWalletModalOpen(true);
                  }
                }}
                className={`px-6 py-2.5 border font-mono text-sm transition-colors ${walletStatus === 'connected' ? 'bg-black text-white border-white/20 hover:border-white' : 'bg-white text-black border-white hover:bg-neutral-300'}`}
            >
              {walletStatus === 'connected' ? `[ ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)} ]` : 'CONNECT WALLET'}
            </button>
          </div>
        </header>

        {/* CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-black">
          {children}
        </div>
      </div>
      
    </div>
  );
}