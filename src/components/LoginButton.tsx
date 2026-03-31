"use client";

import { motion } from "framer-motion";
import { PenTool, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LoginButtonProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  className?: string;
}

export function LoginButton({ isLoggedIn, isLoading, onLogin, onLogout, className }: LoginButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  if (isLoggedIn) {
    return (
      <motion.button
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onLogout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
          isHovering
            ? "bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 shadow-md"
            : "bg-emerald-50 text-emerald-600 border-2 border-emerald-200 shadow-sm",
          className
        )}
      >
        {isHovering ? (
          <>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Logged In</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      onClick={onLogin}
      disabled={isLoading}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
        "bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-xl shadow-fuchsia-500/40 ring-2 ring-transparent hover:ring-fuchsia-200 hover:shadow-2xl hover:shadow-violet-500/50 disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
    >
      {!isLoading && (
        <span className="absolute inset-0 w-full h-full bg-white/25 origin-left -scale-x-100 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      )}
      
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin relative z-10 drop-shadow-md" />
          <span className="relative z-10 drop-shadow-md">Signing...</span>
        </>
      ) : (
        <>
          <PenTool className="h-4 w-4 relative z-10 drop-shadow-md" />
          <span className="relative z-10 drop-shadow-md">Sign & Login</span>
        </>
      )}
    </motion.button>
  );
}
