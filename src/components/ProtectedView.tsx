"use client";

import { motion } from "framer-motion";
import { Wallet, ShieldAlert, Sparkles } from "lucide-react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletButton } from "./WalletButton";

interface ProtectedViewProps {
  title?: string;
  description?: string;
}

export function ProtectedView({ 
  title = "Wallet Connection Required", 
  description = "To access your private workspace, projects, and secure contracts, please connect your Pera Wallet." 
}: ProtectedViewProps) {
  const { 
    isConnected, 
    isLoading, 
    connectWallet, 
    walletAddress,
    logout 
  } = useWalletAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 py-24 px-8 text-center shadow-sm relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="h-24 w-24 text-indigo-500 animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 p-8 opacity-10">
        <ShieldAlert className="h-24 w-24 text-rose-500 animate-pulse" />
      </div>

      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-indigo-50 text-indigo-500 shadow-xl shadow-indigo-100 ring-4 ring-white">
        <Wallet className="h-12 w-12" />
      </div>
      
      <h3 className="text-3xl font-black text-slate-900 leading-tight mb-4">
        {title}
      </h3>
      
      <p className="text-lg font-bold text-slate-500 max-w-lg mb-10">
        {description}
      </p>
      
      <div className="relative group">
        <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
        <WalletButton 
          isConnected={isConnected}
          isLoading={isLoading && !isConnected}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onLogout={logout}
          className="relative z-10 h-16 px-10 text-lg shadow-2xl"
        />
      </div>

      <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        Secure Algorand Testnet Authentication
      </div>
    </motion.div>
  );
}
