"use client";

import Link from "next/link";
import { Search, Hexagon, Sparkle } from "lucide-react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletButton } from "./WalletButton";

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DashboardTopbar({ searchQuery, setSearchQuery }: TopbarProps) {
  const { 
    walletAddress, 
    isConnected, 
    isLoading, 
    connectWallet, 
    logout 
  } = useWalletAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b-0 bg-gradient-to-r from-rose-50/80 via-amber-50/80 to-emerald-50/80 px-6 backdrop-blur-2xl lg:px-8 shadow-sm">
      {/* ... (Logo and Search sections truncated for clarity, but they remain) */}
      <div className="flex flex-1 items-center gap-2">
        <Link href="/" className="flex items-center gap-2 lg:hidden hover:opacity-80 transition-opacity">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 via-violet-500 to-sky-500 text-white shadow-lg shadow-violet-500/30 overflow-hidden">
            <Hexagon className="h-5 w-5 relative z-10" />
            <Sparkle className="absolute top-0.5 right-0.5 h-2 w-2 text-white/70 animate-pulse" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Freelance<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-600">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex justify-center flex-[2] relative group w-full max-w-sm lg:max-w-xl">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, technologies..."
            className="block h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-black text-slate-950 ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-indigo-100 focus:outline-none shadow-sm hover:shadow-md hover:border-slate-300"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 lg:gap-4">
        <WalletButton 
          isConnected={isConnected}
          isLoading={isLoading && !isConnected}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onLogout={logout}
          className="shadow-amber-500/30"
        />
      </div>
    </header>
  );
}
