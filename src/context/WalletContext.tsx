"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

import { buildUrl } from "@/config/api";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  logout: () => Promise<void>;
  // Setters for hook-based logic
  setIsLoading: (val: boolean) => void;
  setError: (val: string | null) => void;
  setIsLoggedIn: (val: boolean) => void;
  setWalletAddress: (val: string | null) => void;
  setIsConnected: (val: boolean) => void;
  ensureInstance: () => PeraWalletConnect | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const peraWalletRef = useRef<PeraWalletConnect | null>(null);

  const ensureInstance = useCallback(() => {
    if (!peraWalletRef.current && typeof window !== "undefined") {
      peraWalletRef.current = new PeraWalletConnect({
        chainId: 416002, // Algorand Testnet
      });
    }
    return peraWalletRef.current;
  }, []);

  useEffect(() => {
    const instance = ensureInstance();
    if (instance) {
      instance.reconnectSession().then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]!);
          setIsConnected(true);
        }
      }).catch(() => {});

      // 2. Add event listener for wallet session
      instance.connector?.on("disconnect", () => {
        setWalletAddress(null);
        setIsConnected(false);
        setIsLoggedIn(false);
        localStorage.removeItem("auth_token");
      });
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) setIsLoggedIn(true);
  }, [ensureInstance]);

  const connectWallet = useCallback(async () => {
    const instance = ensureInstance();
    if (!instance) {
      setError("Wallet client could not be initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newAccounts = await instance.connect();
      if (newAccounts.length > 0) {
        setWalletAddress(newAccounts[0]!);
        setIsConnected(true);
      }
    } catch (err: any) {
      if (err?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error("PeraWallet connection error:", err);
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [ensureInstance]);

  // login logic moved to useWalletAuth hook

  const logout = useCallback(async () => {
    const instance = ensureInstance();
    if (instance) {
      try { await instance.disconnect(); } catch (e) {}
    }
    localStorage.removeItem("auth_token");
    setWalletAddress(null);
    setIsConnected(false);
    setIsLoggedIn(false);
    setError(null);
  }, [ensureInstance]);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      isConnected,
      isLoggedIn,
      isLoading,
      error,
      connectWallet,
      logout,
      setIsLoading,
      setError,
      setIsLoggedIn,
      setWalletAddress,
      setIsConnected,
      ensureInstance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
