'use client'; 

import React, { useState } from 'react';
import { ImagePlus, Info, Check } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import FactoryJSON from '../abis/GritualFactory.json';
import { parseEther } from 'viem';

// 🚨 PENTING: GANTI PAKE ALAMAT KONTRAK LU YANG BARU DI-DEPLOY!
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`; 

export default function CreateTokenForm() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  const [coinName, setCoinName] = useState('');
  const [coinTicker, setCoinTicker] = useState('');
  const [description, setDescription] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false); 

  const { isConnected } = useAccount();
  
  const { data: hash, writeContract, isPending: isWalletPending } = useWriteContract();

  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ 
    hash 
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.size > 1 * 1024 * 1024) {
        setErrorMsg("[ ERROR: FILE TOO LARGE! MAX LIMIT IS 1MB. ]"); 
        setFileToUpload(null); 
        event.target.value = ''; 
        setTimeout(() => setErrorMsg(''), 4000);
        return;
      }

      setFileToUpload(file);
      setErrorMsg(''); 
    }
  };

  const uploadToPinata = async () => {
    if (!fileToUpload) return null;
    
    try {
      setIsUploading(true);

      // A. Upload Gambar dulu
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const imageRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` },
        body: formData
      });
      const imageData = await imageRes.json();
      const imageUrl = `ipfs://${imageData.IpfsHash}`;

      // B. Upload JSON Metadata
      const metadata = {
        name: coinName,
        symbol: coinTicker,
        description: description,
        image: imageUrl
      };

      await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        },
        body: JSON.stringify(metadata)
      });
      
      // 🚨 INI YANG DIGANTI: Kita return imageUrl, BUKAN hash dari JSON-nya!
      return imageUrl; 
      
    } catch (error) {
      console.error(error);
      setErrorMsg("[ ERROR: FAILED TO UPLOAD TO IPFS ]");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!coinName || !coinTicker || !description || !fileToUpload) {
      setErrorMsg("[ ERROR: ALL FIELDS & IMAGE ARE REQUIRED ]");
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setErrorMsg('');

    const metadataUrl = await uploadToPinata();
    
    if (!metadataUrl) return; 

    console.log("METADATA URL LU:", metadataUrl); 
    
    // 👈 INI YANG BERUBAH: Sekarang ngirim 4 parameter sesuai kontrak baru!
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FactoryJSON.abi,
      functionName: 'createToken', 
      args: [coinName, coinTicker, description, metadataUrl], 
      value: parseEther('0.01')
    });
  };

  return (
    <main className="p-8 font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
            <div className="border-b border-white/20 pb-4">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-white">
                  [ CREATE NEW RITUAL TOKEN ]
                </h2>
            </div>

            {/* Upload Area */}
            <div>
              <label htmlFor="file-upload" className="w-full flex items-center justify-center aspect-video border border-dashed border-white/10 hover:border-white group cursor-pointer transition">
                <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                <div className="text-center p-8 space-y-3 flex flex-col items-center">
                    <ImagePlus size={32} className="text-neutral-700 group-hover:text-white transition"/>
                    <p className="text-sm font-medium text-neutral-500 group-hover:text-white transition">
                        [ SELECT VIDEO OR IMAGE ]
                    </p>
                </div>
              </label>
              {fileToUpload && (
                <div className="mt-3 text-xs text-green-400 bg-green-950 px-3 py-1 flex items-center gap-2 inline-block">
                    <Check size={14} /> [FILE_SELECTED: {fileToUpload.name}]
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-white mb-2 uppercase">[ COIN_NAME ]</label>
                    <input 
                      type="text" value={coinName} onChange={(e) => { setCoinName(e.target.value); setErrorMsg(''); }}
                      className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-white mb-2 uppercase">[ TICKER ]</label>
                    <input 
                      type="text" value={coinTicker} onChange={(e) => { setCoinTicker(e.target.value); setErrorMsg(''); }}
                      className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase">[ DESCRIPTION ]</label>
                <textarea 
                  value={description} onChange={(e) => { setDescription(e.target.value); setErrorMsg(''); }} rows={4} 
                  className="w-full bg-transparent border border-white/20 px-4 py-2.5 text-sm text-white resize-none"
                />
            </div>

            <div className="pt-2">
                {errorMsg && (
                  <div className="text-red-400 text-xs font-bold bg-red-950/50 border border-red-500/30 p-3 mb-4">
                    ⚠️ {errorMsg}
                  </div>
                )}
                
                {isSuccess && (
                  <div className="text-green-400 text-xs font-bold bg-green-950/50 border border-green-500/30 p-3 mb-4">
                    ✅ [ SUCCESS: COIN DEPLOYED TO RITUAL NETWORK ]
                  </div>
                )}

                <button 
                  onClick={handleCreateToken}
                  disabled={!isConnected || isUploading || isWalletPending || isMining}
                  className={`w-full py-4 font-bold text-sm transition-colors ${
                    (!isConnected || isUploading || isWalletPending || isMining)
                      ? 'bg-neutral-800 text-neutral-500 cursor-wait' 
                      : 'bg-white text-black hover:bg-neutral-300'
                  }`}
                >
                    {!isConnected ? '[ LOGIN TO CREATE TOKEN ]' : 
                     isUploading ? '[ UPLOADING TO IPFS... ]' :
                     isWalletPending ? '[ WAITING FOR METAMASK... ]' :
                     isMining ? '[ MINING BLOCK... PLEASE WAIT ]' :
                     '[ CREATE TOKEN ]'}
                </button>
            </div>
        </div>

        {/* Right Column - Preview Placeholder */}
        <div className="border border-white/10 p-6 xl:sticky xl:top-6 self-start bg-neutral-950">
          <div className="w-full aspect-video border border-dashed border-neutral-800 flex items-center justify-center text-center mb-4 overflow-hidden relative">
            {fileToUpload ? (
              <img src={URL.createObjectURL(fileToUpload)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <p className="text-neutral-700 text-sm p-8">[ ART_PREVIEW ]</p>
            )}
          </div>
        </div>
        
      </div>
    </main>
  );
}