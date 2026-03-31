"use client";

import { motion } from "framer-motion";
import { Search, Wallet, Hexagon, Sparkle } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function DashboardTopbar({ searchQuery, setSearchQuery }: TopbarProps) {
  const [walletConnected, setWalletConnected] = useState(true);
  const mockWalletAddress = "0x1A4...B62";

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b-0 bg-gradient-to-r from-rose-50/80 via-amber-50/80 to-emerald-50/80 px-6 backdrop-blur-2xl lg:px-8 shadow-sm">
      {/* Left section: Mobile Logo or empty space for desktop centering */}
      <div className="flex flex-1 items-center gap-2">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 via-violet-500 to-sky-500 text-white shadow-lg shadow-violet-500/30 overflow-hidden">
            <Hexagon className="h-5 w-5 relative z-10" />
            <Sparkle className="absolute top-0.5 right-0.5 h-2 w-2 text-white/70 animate-pulse" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Freelance<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-600">AI</span>
          </span>
        </div>
      </div>

      {/* Modern Search Bar (Centered) */}
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

      {/* Global Actions */}
      <div className="flex flex-1 items-center justify-end gap-3 lg:gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWalletConnected(!walletConnected)}
          className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 px-5 text-sm font-black text-white shadow-lg shadow-amber-500/30 ring-2 ring-transparent transition-all hover:ring-amber-200 bg-[length:200%_auto] hover:bg-right"
        >
          <div className="absolute inset-x-0 bottom-0 h-[100%] w-full bg-white/20 origin-left -scale-x-100 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          {walletConnected ? (
            <div className="flex items-center gap-2 relative z-10 drop-shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>{mockWalletAddress}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative z-10 drop-shadow-md">
              <Wallet className="h-4 w-4" />
              <span>Connect</span>
            </div>
          )}
        </motion.button>
      </div>
    </header>
  );
}
