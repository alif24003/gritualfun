'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Setup jaringan Ritual / CratD2C lu
const ritualChain = {
  id: 1979,
  name: 'CratD2C Testnet',
  nativeCurrency: { name: 'CRAT', symbol: 'CRAT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ritualfoundation.org'] },
  },
} as const;

// Config Wagmi
export const config = createConfig({
  chains: [ritualChain],
  connectors: [injected()], // Buat baca Metamask dll
  transports: {
    [ritualChain.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  // 👇 OBAT HYDRATION ERROR (Tahan render sampe browser siap)
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 👇 Cuma nampilin UI kalau udah mounted */}
        {mounted && children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}