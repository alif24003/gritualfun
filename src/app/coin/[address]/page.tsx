'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { parseEther, formatEther, erc20Abi, maxUint256 } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, useWatchContractEvent, usePublicClient } from 'wagmi'; 
import { ArrowLeft, Copy, RefreshCw, AlertTriangle, Check, ExternalLink, User } from 'lucide-react';

import Layout from '../../../components/Layout';
import WalletModal from '../../../components/WalletModal';
import ProfileModal from '../../../components/ProfileModal';
import FactoryJSON from '../../../abis/GritualFactory.json';

import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

const TradingChart = ({ price }: { price: number }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: '#777' },
      grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { borderVisible: false, timeVisible: true },
      rightPriceScale: { borderVisible: false },
    });

    seriesRef.current = chart.addSeries(AreaSeries, {
      lineColor: '#22c55e', 
      topColor: 'rgba(34, 197, 94, 0.2)', 
      bottomColor: 'rgba(34, 197, 94, 0)',
      lineWidth: 2, 
      priceFormat: { type: 'price', precision: 12, minMove: 0.000000000001 },
    });

    const now = Math.floor(Date.now() / 1000);
    seriesRef.current.setData([{ time: now as any, value: price }]);

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && price > 0) {
      seriesRef.current.update({ time: Math.floor(Date.now() / 1000) as any, value: price });
    }
  }, [price]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default function TokenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenAddress = params.address as string;
  const publicClient = usePublicClient(); 

  // 👇 1. OBAT HYDRATION ERROR (Nahan UI sampe siap)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { address, status } = useAccount();
  const mappedStatus = (
    status === 'connected' ? 'connected' : 
    (status === 'connecting' || status === 'reconnecting') ? 'connecting' : 'disconnected'
  ) as 'disconnected' | 'connecting' | 'connected';

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); 
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'holders'>('transactions');

  const [txHistory, setTxHistory] = useState<any[]>([]);

  // --- FETCH TOKEN DATA ---
  const { data: rawTokenData, isLoading: isTokenLoading, refetch: refetchTokenData } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FactoryJSON.abi,
    functionName: 'tokens',
    args: [tokenAddress],
  });

  const ritualReserve = rawTokenData ? Number(formatEther((rawTokenData as any)[6])) : 0;
  const tokenReserve = rawTokenData ? Number(formatEther((rawTokenData as any)[7])) : 0;
  const TOTAL_SUPPLY = 1_000_000_000_000; 

  const currentPrice = tokenReserve > 0 ? ritualReserve / tokenReserve : 0;
  const displayPrice = currentPrice.toFixed(13); 

  const currentMcap = currentPrice * TOTAL_SUPPLY;
  const displayMcap = currentMcap.toFixed(2);

  const START_RESERVE = 5;
  const TARGET_RESERVE = 50;
  let curveProgress = ((ritualReserve - START_RESERVE) / (TARGET_RESERVE - START_RESERVE)) * 100;
  if (curveProgress < 0) curveProgress = 0;
  if (curveProgress > 100) curveProgress = 100;
  const displayProgress = curveProgress.toFixed(2);

  const token = rawTokenData ? {
    name: (rawTokenData as any)[1] || 'Unknown Ritual',
    ticker: (rawTokenData as any)[2] || '???',
    description: (rawTokenData as any)[3] || 'Zero pixels, pure character.',
    image: (rawTokenData as any)[4] ? (rawTokenData as any)[4].replace('ipfs://', 'https://coffee-casual-cricket-437.mypinata.cloud/ipfs/') : 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop',
    creator: (rawTokenData as any)[5] || '0x0000...0000',
    mcap: displayMcap 
  } : null;

  // --- SALDO & ALLOWANCE ---
  const { data: nativeBalance, refetch: refetchNative } = useBalance({ address });
  const exactNativeBalance = nativeBalance ? formatEther(nativeBalance.value) : "0";
  const displayNativeBalance = nativeBalance ? (Math.floor(Number(exactNativeBalance) * 10000) / 10000).toFixed(4) : "0.00";

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  const exactTokenBalance = tokenBalance ? formatEther(tokenBalance as bigint) : "0";
  const displayTokenBalance = tokenBalance ? (Math.floor(Number(exactTokenBalance) * 100) / 100).toFixed(2) : "0.00";

  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, FACTORY_ADDRESS] : undefined,
  });

  // 👇 2. FIX "PAST TX": Tarik jam aslinya dari blok (Dibatasi 30 tx biar gak lemot)
  useEffect(() => {
    const fetchPastEvents = async () => {
      if (!publicClient || !tokenAddress) return;

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const startBlock = currentBlock > BigInt(50000) ? currentBlock - BigInt(50000) : BigInt(0);

        const logs = await publicClient.getLogs({
          address: tokenAddress as `0x${string}`,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { type: 'address', name: 'from', indexed: true },
              { type: 'address', name: 'to', indexed: true },
              { type: 'uint256', name: 'value', indexed: false }
            ]
          },
          fromBlock: startBlock, 
          toBlock: 'latest'
        });

        // Ambil 30 logs terakhir aja biar gak nyekik RPC API lu
        const recentLogs = logs.slice(-30);

        const formattedLogs = await Promise.all(recentLogs.map(async (log: any) => {
          const { from, to, value } = log.args;
          const isBuy = from.toLowerCase() === FACTORY_ADDRESS.toLowerCase();
          const isSell = to.toLowerCase() === FACTORY_ADDRESS.toLowerCase();

          if (isBuy || isSell) {
            // Nanya waktu asli ke blockchain
            const block = await publicClient.getBlock({ blockHash: log.blockHash });
            const txTime = new Date(Number(block.timestamp) * 1000).toLocaleTimeString();

            return {
              from_address: isBuy ? to : from,
              type: isBuy ? 'BUY' : 'SELL',
              value: Number(formatEther(value)).toLocaleString('en-US', {maximumFractionDigits: 2}),
              date: txTime // 👈 Jam asli, bukan "Past Tx" lagi
            };
          }
          return null;
        }));

        setTxHistory(formattedLogs.filter(Boolean).reverse());
      } catch (err) {
        console.error("Gagal narik history:", err);
      }
    };

    fetchPastEvents();
  }, [publicClient, tokenAddress]);

  useWatchContractEvent({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach(log => {
        const { args } = log as any;
        if (args && args.from && args.to && args.value) {
          const isBuy = args.from.toLowerCase() === FACTORY_ADDRESS.toLowerCase();
          const isSell = args.to.toLowerCase() === FACTORY_ADDRESS.toLowerCase();

          if (isBuy || isSell) {
            const newTx = {
              from_address: isBuy ? args.to : args.from,
              type: isBuy ? 'BUY' : 'SELL',
              value: Number(formatEther(args.value)).toLocaleString('en-US', {maximumFractionDigits: 2}),
              date: new Date().toLocaleTimeString()
            };
            setTxHistory(prev => {
                if (prev.find(p => p.date === newTx.date && p.from_address === newTx.from_address)) return prev;
                return [newTx, ...prev].slice(0, 50);
            }); 
          }
        }
      });
    },
  });

  const tokenHolders = [
    { address: FACTORY_ADDRESS, balance: parseEther(tokenReserve.toString()), customLabel: "Bonding Curve" }, 
    { address: address, balance: tokenBalance || BigInt(0), customLabel: "You" }
  ].filter(h => Number(h.balance) > 0);

  const { data: txHash, writeContract, isPending: isWalletPending, error: txError } = useWriteContract();
  const { isLoading: isMining, isSuccess: isTradeSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTradeSuccess) {
      refetchAllowance();
      refetchNative();
      refetchTokenBalance();
      refetchTokenData();
      setTradeAmount(''); 
    }
  }, [isTradeSuccess, refetchAllowance, refetchNative, refetchTokenBalance, refetchTokenData]);

  const parsedInput = tradeAmount && !isNaN(Number(tradeAmount)) ? parseEther(tradeAmount) : BigInt(0);
  const needsApproval = tradeMode === 'sell' && (!tokenAllowance || (tokenAllowance as bigint) < parsedInput);

  const inputNum = parseFloat(tradeAmount) || 0;
  
  const isInsufficientFunds = tradeMode === 'buy' 
    ? inputNum > Number(exactNativeBalance) 
    : inputNum > Number(exactTokenBalance);

  let estimatedOut = "0.00";

  if (inputNum > 0 && ritualReserve > 0 && tokenReserve > 0 && !isInsufficientFunds) {
    const k = ritualReserve * tokenReserve;
    if (tradeMode === 'buy') {
      const newRitual = ritualReserve + inputNum;
      const newToken = k / newRitual;
      const tokensOut = tokenReserve - newToken;
      estimatedOut = `${tokensOut.toLocaleString('en-US', {maximumFractionDigits: 2})} ${token?.ticker}`;
    } else {
      const newToken = tokenReserve + inputNum;
      const newRitual = k / newToken;
      const ritualOut = ritualReserve - newRitual;
      const ritualOutAfterFee = ritualOut * 0.99;
      estimatedOut = `${ritualOutAfterFee.toFixed(5)} RITUAL`;
    }
  }

  const handleTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0 || isInsufficientFunds) return;

    if (tradeMode === 'buy') {
      writeContract({
        address: FACTORY_ADDRESS,
        abi: FactoryJSON.abi,
        functionName: 'buy',
        args: [tokenAddress, BigInt(0)], 
        value: parsedInput, 
      });
    } else {
      if (needsApproval) {
        writeContract({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [FACTORY_ADDRESS, maxUint256],
        });
      } else {
        let safeSellAmount = parsedInput;
        const maxToken = tokenBalance as bigint;
        
        if (parsedInput >= maxToken) {
          const tinyDust = parseEther("0.1");
          if (maxToken > tinyDust) {
            safeSellAmount = maxToken - tinyDust;
          } else {
            safeSellAmount = maxToken;
          }
        }

        writeContract({
          address: FACTORY_ADDRESS,
          abi: FactoryJSON.abi,
          functionName: 'sell',
          args: [tokenAddress, safeSellAmount, BigInt(0)], 
        });
      }
    }
  };

  const handleMenuNavigation = (view: 'home' | 'create' | 'leaderboard') => {
    router.push('/');
  };

  // 👇 PERTAHANAN TERAKHIR HYDRATION ERROR: Layar Hitam Kosong sebelum siap
  if (!isMounted) return <div className="min-h-screen bg-black" />;

  if (isTokenLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white">
        <div className="animate-pulse flex items-center gap-3">
          <RefreshCw className="animate-spin" /> [ FETCHING RITUAL DATA... ]
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-red-500 gap-4">
        <div>[ ERROR: TOKEN NOT FOUND ]</div>
        <button onClick={() => router.push('/')} className="px-4 py-2 border border-red-500 text-sm hover:bg-red-500 hover:text-black transition">
          BACK TO EXPLORE
        </button>
      </div>
    );
  }

  return (
    <Layout
      activeView="home" 
      setActiveView={handleMenuNavigation} 
      setIsWalletModalOpen={setIsWalletModalOpen}
      setIsProfileModalOpen={setIsProfileModalOpen}
      walletStatus={mappedStatus}
      walletAddress={address || null}
    >
      <main className="p-4 md:p-8 font-mono text-white bg-black">
        
        <nav className="mb-6 flex items-center justify-between border-b border-white/20 pb-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> [ BACK TO EXPLORE ]
          </button>
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            CONTRACT: {tokenAddress?.slice(0,6)}...{tokenAddress?.slice(-4)} 
            <button className="hover:text-white"><Copy size={12} /></button>
          </div>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-6">
            <div className="flex gap-4 items-start">
              <img src={token.image} alt="Token" className="w-20 h-20 object-cover border border-white/20 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=600&auto=format&fit=crop'; }} />
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1 text-white">
                  {token.name} <span className="text-neutral-500">[{token.ticker}]</span>
                </h1>
                <div className="text-xs text-neutral-500 flex gap-4 mt-2">
                  <span>CREATOR: <span className="text-white">{token.creator.slice(0,6)}...{token.creator.slice(-4)}</span></span>
                  <span>MCAP: <span className="text-green-400 font-bold">{token.mcap} RITUAL</span></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">Vol 24h</p>
                    <p className="font-bold text-sm text-white">0.00 RIT</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">Price</p>
                    <p className="font-bold text-sm text-white">{displayPrice}</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">5m</p>
                    <p className="font-bold text-sm text-green-500">+0.00%</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">1h</p>
                    <p className="font-bold text-sm text-green-500">+0.00%</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-neutral-500 mb-1">6h</p>
                    <p className="font-bold text-sm text-red-500">-0.00%</p>
                </div>
            </div>

            <div className="w-full h-[400px] border border-white/20 bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden group">
              <TradingChart price={currentPrice} />
              <div className="absolute bottom-4 right-4 text-[10px] text-neutral-700">RITUAL NETWORK TESTNET</div>
            </div>

            <div className="border border-white/10 p-5 bg-[#0a0a0a]">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">[ ABOUT_RITUAL ]</h3>
              <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {token.description}
              </p>
            </div>

            <div className="border border-white/10 bg-[#0a0a0a]">
              <div className="flex border-b border-white/10 text-xs font-bold text-neutral-500">
                <button onClick={() => setActiveTab('transactions')} className={`p-3 transition ${activeTab === 'transactions' ? 'text-white border-b-2 border-white bg-white/5' : 'hover:text-white'}`}>TRANSACTIONS</button>
                <button onClick={() => setActiveTab('holders')} className={`p-3 transition ${activeTab === 'holders' ? 'text-white border-b-2 border-white bg-white/5' : 'hover:text-white'}`}>HOLDERS</button>
              </div>
              
              <div className="p-4 min-h-[200px] overflow-x-auto flex flex-col">
                {activeTab === 'transactions' ? (
                  txHistory.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-neutral-600 italic mt-10">
                      [ NO TRANSACTIONS YET ]
                    </div>
                  ) : (
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="text-neutral-500 border-b border-white/5 font-bold">
                          <th className="pb-2">ACCOUNT</th>
                          <th className="pb-2">TYPE</th>
                          <th className="pb-2">AMOUNT</th>
                          <th className="pb-2">DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txHistory.map((tx, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 text-white">
                            <td className="py-2.5 text-blue-400">{tx.from_address?.slice(0, 6)}...</td>
                            <td className={tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>{tx.type}</td>
                            <td>{tx.value}</td>
                            <td>{tx.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  <div className="space-y-2">
                    {tokenHolders.map((h, i) => {
                      const bal = Number(formatEther(h.balance as bigint));
                      const pct = ((bal / TOTAL_SUPPLY) * 100).toFixed(4);
                      return (
                        <div key={i} className="flex justify-between text-[10px] border-b border-white/5 pb-2 text-neutral-400 font-mono">
                          <span>{i + 1}. {h.address?.slice(0, 12)}... ({h.customLabel})</span>
                          <span className="text-white">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="border border-white/20 bg-neutral-950 p-1">
              <div className="flex font-bold text-sm">
                <button onClick={() => {setTradeMode('buy'); setTradeAmount('');}} className={`flex-1 py-3 transition-colors ${tradeMode === 'buy' ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500' : 'text-neutral-500 hover:text-white'}`}>
                  [ BUY ]
                </button>
                <button onClick={() => {setTradeMode('sell'); setTradeAmount('');}} className={`flex-1 py-3 transition-colors ${tradeMode === 'sell' ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500' : 'text-neutral-500 hover:text-white'}`}>
                  [ SELL ]
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                
                <div className="flex gap-2 mb-2">
                  {tradeMode === 'buy' ? (
                    <>
                      <button onClick={() => setTradeAmount('0.1')} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">0.1 RIT</button>
                      <button onClick={() => setTradeAmount('0.5')} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">0.5 RIT</button>
                      <button onClick={() => setTradeAmount('1')} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">1 RIT</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setTradeAmount((Number(exactTokenBalance) * 0.25).toString())} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">25%</button>
                      <button onClick={() => setTradeAmount((Number(exactTokenBalance) * 0.5).toString())} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">50%</button>
                      <button onClick={() => setTradeAmount(exactTokenBalance)} className="flex-1 py-1.5 bg-[#111] border border-white/10 hover:border-white/40 text-xs font-bold text-neutral-400 hover:text-white transition">MAX</button>
                    </>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.0" 
                      className="w-full bg-black border border-white/20 p-4 text-right font-mono text-xl text-white focus:outline-none focus:border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">
                      {tradeMode === 'buy' ? 'RITUAL' : token.ticker}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                      Balance: <span className="text-white cursor-pointer hover:underline" onClick={() => setTradeAmount(tradeMode === 'buy' ? exactNativeBalance : exactTokenBalance)}>
                        {tradeMode === 'buy' ? `${displayNativeBalance} RITUAL` : `${displayTokenBalance} ${token.ticker}`}
                      </span>
                    </div>
                  </div>
                </div>

                {inputNum > 0 && !isInsufficientFunds && (
                  <div className="bg-[#111] border border-white/5 p-3 text-center rounded-sm">
                    <span className="text-xs text-neutral-400 font-bold">
                      You receive ≈ <span className="text-white">{estimatedOut}</span>
                    </span>
                  </div>
                )}
                
                {txError && (
                  <div className="text-red-400 text-xs font-bold bg-red-950/50 border border-red-500/30 p-2 text-center break-words">
                    ⚠️ TRANSACTION FAILED / REJECTED
                  </div>
                )}
                {isTradeSuccess && (
                  <div className="text-green-400 text-xs font-bold bg-green-950/50 border border-green-500/30 p-2 flex items-center justify-center gap-2">
                    <Check size={14} /> [ TRANSACTION SUCCESSFUL! ]
                  </div>
                )}

                <button 
                  onClick={handleTrade}
                  disabled={isWalletPending || isMining || !tradeAmount || mappedStatus !== 'connected' || isInsufficientFunds}
                  className={`w-full py-4 font-black text-sm transition-colors ${
                    isWalletPending || isMining || mappedStatus !== 'connected' || !tradeAmount || isInsufficientFunds
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : tradeMode === 'buy' 
                        ? 'bg-green-500 hover:bg-green-400 text-black' 
                        : needsApproval 
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-black' 
                          : 'bg-red-500 hover:bg-red-400 text-black'
                  }`}
                >
                  {mappedStatus !== 'connected' ? '[ CONNECT WALLET FIRST ]' :
                   isInsufficientFunds ? (tradeMode === 'buy' ? 'INSUFFICIENT RITUAL' : 'INSUFFICIENT TOKENS') :
                   isWalletPending ? '[ CONFIRM IN METAMASK... ]' :
                   isMining ? '[ MINING BLOCK... ]' :
                   tradeMode === 'buy' ? 'PLACE BUY ORDER' : 
                   needsApproval ? 'APPROVE TOKEN' : 'PLACE SELL ORDER'}
                </button>
              </div>
            </div>

            <div className="border border-white/10 p-5 bg-[#0a0a0a]">
              <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>[ BONDING_CURVE ]</span>
                <span className="text-green-400">{displayProgress}%</span>
              </h3>
              <div className="w-full h-3 bg-neutral-900 border border-white/5 mb-3 overflow-hidden relative">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${displayProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                When the market cap reaches <span className="text-white font-bold">50 RITUAL</span>, the bonding curve is officially MAXED OUT and the King of Ritual is crowned! 👑
              </p>
            </div>

            <div className="border border-blue-500/30 bg-blue-950/10 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <AlertTriangle size={64} />
              </div>
              <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">
                [ CREATOR_REWARDS ]
              </h3>
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">Payout Method</span>
                  <span className="text-green-400 font-bold">AUTO-WALLET TRANSFER</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-neutral-500">Royalty Rate</span>
                  <span className="text-white font-bold">0.5% Per Trade</span>
                </div>
                
                <button 
                  disabled
                  className="w-full mt-2 py-2 border border-blue-500/30 bg-blue-900/10 text-blue-400 text-[10px] font-bold cursor-not-allowed"
                >
                  PAID INSTANTLY ON EVERY TRADE
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} setWalletStatus={() => {}} setWalletAddress={() => {}} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} address={address} userTokens={[]} />
    </Layout>
  );
}