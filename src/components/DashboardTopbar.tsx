import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Hexagon, Sparkle, Menu, X, ArrowLeft } from "lucide-react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletButton } from "./WalletButton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function DashboardTopbar({ searchQuery, setSearchQuery, isSidebarOpen, toggleSidebar }: TopbarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    walletAddress,
    isConnected,
    isLoggedIn,
    isLoading,
    connectWallet,
    login,
    logout
  } = useWalletAuth();

  // Auto login when wallet connects
  useEffect(() => {
    if (isConnected && !isLoggedIn && !isLoading) {
      console.log("🔄 [TOPBAR] Auto-triggering login...");
      // Small timeout to prevent state update loops if authentication is still finalizing
      const timer = setTimeout(() => {
        login();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoggedIn, isLoading, login]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-2xl lg:px-8 shadow-sm">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-3 lg:flex-1">
        <button
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-indigo-600 lg:hidden"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 lg:hidden group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 via-violet-500 to-sky-500 text-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
            <Hexagon className="h-5 w-5 relative z-10" />
            <Sparkle className="absolute top-0.5 right-0.5 h-2 w-2 text-white/70 animate-pulse" />
          </div>
        </Link>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden flex-1 justify-center max-w-xl sm:flex lg:flex-[2]">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, technologies..."
            className="block h-11 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100 focus:outline-none shadow-sm hover:shadow-md hover:border-slate-300"
          />
        </div>
      </div>

      {/* Mobile Search Toggle (Visible only on mobile) */}
      <div className="flex sm:hidden">
        <button
          onClick={() => setIsSearchExpanded(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Expanded Search Overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            ref={searchRef}
            className="absolute inset-x-0 top-0 z-50 flex h-20 items-center bg-white px-4 shadow-xl sm:hidden"
          >
            <div className="flex w-full items-center gap-3">
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 lg:flex-1 lg:gap-4">
        <WalletButton
          isConnected={isConnected}
          isLoading={isLoading && !isConnected}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onLogout={logout}
          className="shadow-sm"
        />
      </div>
    </header>
  );
}


