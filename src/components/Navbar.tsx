"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, Hexagon, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Mock wallet address for demonstration purposes
  const mockWalletAddress = "0x1A4...B62";

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
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-xl shadow-sky-500/40 overflow-hidden ring-1 ring-sky-300">
            <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Hexagon className="h-6 w-6 relative z-10 drop-shadow-md" />
            <Sparkle className="absolute top-1 right-1 h-3 w-3 text-white/90 animate-pulse drop-shadow-md" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Freelance<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-600">AI</span>
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

        {/* Connect Wallet Button */}
        <div className="hidden md:flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWalletConnected(!walletConnected)}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
              walletConnected
                ? "bg-white text-slate-800 border-2 border-slate-200 hover:border-sky-300 hover:bg-sky-50 shadow-md hover:shadow-xl hover:shadow-sky-200/50"
                : "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-xl shadow-sky-500/40 ring-2 ring-transparent hover:ring-sky-200 hover:shadow-2xl hover:shadow-cyan-500/50"
            )}
          >
            {!walletConnected && (
              <span className="absolute inset-0 w-full h-full bg-white/25 origin-left -scale-x-100 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            )}
            {walletConnected ? (
              <>
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,1)]"></span>
                </div>
                {mockWalletAddress}
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 relative z-10 drop-shadow-md" />
                <span className="relative z-10 drop-shadow-md">Connect Wallet</span>
              </>
            )}
          </motion.button>
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
              <div className="pt-4 pb-2">
                <button
                  onClick={() => {
                    setWalletConnected(!walletConnected);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all shadow-xl hover:shadow-2xl",
                    walletConnected
                      ? "bg-white text-slate-900 border-2 border-slate-200 hover:border-sky-300 hover:shadow-sky-100"
                      : "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sky-500/40 hover:shadow-cyan-500/50"
                  )}
                >
                  {walletConnected ? (
                    <>
                      <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                      {mockWalletAddress}
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 drop-shadow-md" />
                      <span className="drop-shadow-md">Connect Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
