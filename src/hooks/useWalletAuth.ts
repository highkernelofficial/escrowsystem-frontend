"use client";

import { useWallet } from "@/context/WalletContext";

/**
 * useWalletAuth Hook
 * 
 * This hook now consumes the global WalletContext to ensure that 
 * wallet state (connection, address, etc.) is synchronized in 
 * real-time across all components (Navbar, Sidebar, Topbar).
 */
export function useWalletAuth() {
  const context = useWallet();

  return {
    walletAddress: context.walletAddress,
    isConnected: context.isConnected,
    isLoggedIn: context.isLoggedIn,
    isLoading: context.isLoading,
    error: context.error,
    connectWallet: context.connectWallet,
    login: context.login,
    logout: context.logout
  };
}
