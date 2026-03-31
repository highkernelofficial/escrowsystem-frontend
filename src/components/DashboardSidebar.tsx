"use client";

import { motion } from "framer-motion";
import { Compass, Rocket, Layers, Hexagon, Sparkle, FolderHeart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletButton } from "./WalletButton";

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const { 
    walletAddress, 
    isConnected, 
    isLoading, 
    connectWallet, 
    logout 
  } = useWalletAuth();

  // ... (navItems and isActive logic remain)
  const navItems = [
    { id: "all", label: "All Projects", href: "/dashboard", icon: Compass, activeBg: "bg-sky-50", activeText: "text-sky-600", activeShadow: "shadow-sky-100/50", activeRing: "ring-sky-100", activeDot: "bg-sky-500", activeIcon: "text-sky-500" },
    { id: "owned", label: "Owned Projects", href: "/dashboard?view=owned", icon: FolderHeart, activeBg: "bg-emerald-50", activeText: "text-emerald-600", activeShadow: "shadow-emerald-100/50", activeRing: "ring-emerald-100", activeDot: "bg-emerald-500", activeIcon: "text-emerald-500" },
    { id: "work", label: "My Work", href: "/dashboard?view=work", icon: Layers, activeBg: "bg-amber-50", activeText: "text-amber-600", activeShadow: "shadow-amber-100/50", activeRing: "ring-amber-100", activeDot: "bg-amber-500", activeIcon: "text-amber-500" },
    { id: "post", label: "Post Project", href: "/dashboard/post", icon: Rocket, activeBg: "bg-rose-50", activeText: "text-rose-600", activeShadow: "shadow-rose-100/50", activeRing: "ring-rose-100", activeDot: "bg-rose-500", activeIcon: "text-rose-500" },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.id === "post") return pathname === "/dashboard/post";
    if (item.id === "owned") return pathname === "/dashboard" && currentView === "owned";
    if (item.id === "work") return pathname === "/dashboard" && currentView === "work";
    if (item.id === "all") return pathname === "/dashboard" && !currentView;
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r-0 bg-gradient-to-b from-sky-50/80 via-emerald-50/80 to-rose-50/80 backdrop-blur-2xl lg:block xl:w-72 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex h-full flex-col p-6">
        {/* Logo Section */}
        <div
          className="mb-10 flex items-center gap-3 px-2 group cursor-pointer lg:hover:scale-105 transition-all duration-300 hover:opacity-80"
          onClick={() => router.push("/")}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 via-violet-500 to-sky-500 text-white shadow-lg shadow-violet-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Hexagon className="h-5 w-5 relative z-10" />
            <Sparkle className="absolute top-1 right-1 h-2.5 w-2.5 text-white/70 animate-pulse" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Freelance<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-600">AI</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
                  active
                    ? cn("shadow-sm ring-1", item.activeBg, item.activeText, item.activeShadow, item.activeRing)
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active ? item.activeIcon : "text-slate-400")} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="active-bar"
                    className={cn("ml-auto h-1.5 w-1.5 rounded-full shadow-[0_0_8px]", item.activeDot, item.activeShadow.replace('shadow-', 'shadow-').replace('/50', '/80'))}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Integrated Wallet Component */}
        <div className="mt-auto space-y-3 pt-6 border-t border-slate-100/50">
          {isConnected && (
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 group"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          )}

          <WalletButton 
            isConnected={isConnected}
            isLoading={isLoading && !isConnected}
            walletAddress={walletAddress}
            onConnect={connectWallet}
            onLogout={logout}
            className="w-full justify-center px-4 h-12"
          />
        </div>
      </div>
    </aside>
  );
}
