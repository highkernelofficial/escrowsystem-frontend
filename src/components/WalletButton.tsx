"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Loader2, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onLogout?: () => void;
  className?: string;
}

export function WalletButton({ 
  isConnected, 
  isLoading, 
  walletAddress, 
  onConnect, 
  onLogout,
  className 
}: WalletButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}` : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMainClick = () => {
    if (isLoading) return;
    if (isConnected) {
      setIsOpen(!isOpen);
    } else {
      onConnect();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        onClick={handleMainClick}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
          isConnected
            ? "bg-white text-slate-800 border-2 border-slate-200 shadow-md hover:border-cyan-200 hover:shadow-cyan-100/50"
            : "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-xl shadow-sky-500/40 ring-2 ring-transparent hover:ring-sky-200 hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-70 disabled:cursor-not-allowed",
          className
        )}
      >
        {!isConnected && !isLoading && (
          <span className="absolute inset-0 w-full h-full bg-white/25 origin-left -scale-x-100 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        )}
        
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin relative z-10" />
            <span className="relative z-10 transition-colors">Connecting...</span>
          </>
        ) : isConnected ? (
          <>
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="truncate">{shortAddress}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Connect Wallet</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5 z-50 backdrop-blur-xl"
          >
            <button
              onClick={() => {
                onLogout?.();
                setIsOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                <LogOut className="h-4 w-4" />
              </div>
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
