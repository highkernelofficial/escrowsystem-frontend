"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, Hexagon, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletButton } from "./WalletButton";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    walletAddress, 
    isConnected, 
    isLoggedIn, 
    isLoading, 
    connectWallet, 
    login, 
    logout 
  } = useWalletAuth();

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 relative">
        {/* Glow behind navbar */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent shadow-[0_5px_20px_rgba(14,165,233,0.3)]" />

        {/* Logo */}
        <a href="/" className="flex flex-shrink-0 items-center gap-3 group cursor-pointer lg:hover:scale-105 transition-transform duration-300">
          <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-xl shadow-sky-500/40 overflow-hidden ring-1 ring-sky-300">
            <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Hexagon className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 drop-shadow-md" />
            <Sparkle className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-white/90 animate-pulse drop-shadow-md" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            FRESCROW
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {['Home', 'About Us', 'Team'].map((item) => (
            <a
              key={item}
              href={item === "Home" ? "/" : `/#${item.toLowerCase().replace(' ', '')}`}
              className="relative text-sm font-bold text-slate-600 transition-colors hover:text-sky-600 group py-2 hover:drop-shadow-sm"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <WalletButton 
            isConnected={isConnected}
            isLoading={isLoading && !isConnected}
            walletAddress={walletAddress}
            onConnect={connectWallet}
            onLogout={logout}
          />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-500 bg-white shadow-md hover:shadow-lg hover:bg-sky-50 hover:text-sky-600 focus:outline-none transition-all border border-slate-100"
          >
            {isMenuOpen ? <X className="h-6 w-6 drop-shadow-sm" /> : <Menu className="h-6 w-6 drop-shadow-sm" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex flex-col space-y-2 px-4 py-8">
              {['Home', 'About Us', 'Team'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '')}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-bold text-slate-900 p-4 rounded-2xl hover:bg-sky-50 hover:text-sky-600 hover:shadow-inner transition-all"
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 pb-2 space-y-3">
                <WalletButton 
                  isConnected={isConnected}
                  isLoading={isLoading && !isConnected}
                  walletAddress={walletAddress}
                  onConnect={connectWallet}
                  onLogout={logout}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
}
