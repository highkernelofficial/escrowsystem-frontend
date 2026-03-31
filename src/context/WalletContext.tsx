"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
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
      peraWalletRef.current = new PeraWalletConnect();
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

  const login = useCallback(async () => {
    const instance = ensureInstance();
    if (!instance || !walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nonceRes = await fetch(`${API_URL}/auth/nonce?wallet=${walletAddress}`);
      if (!nonceRes.ok) throw new Error("Failed to retrieve authentication nonce");
      const { message } = await nonceRes.json();

      const encodedMessage = new TextEncoder().encode(message);
      const signedPayload = await (instance as any).signData([{
        data: encodedMessage,
        address: walletAddress
      }]);
      
      if (!signedPayload || !signedPayload[0]) throw new Error("No signature obtained from wallet");

      const signatureArray = signedPayload[0] as Uint8Array;
      const binary = Array.from(signatureArray).map((b) => String.fromCharCode(b)).join("");
      const signatureBase64 = btoa(binary);

      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          message: message,
          signature: signatureBase64
        })
      });

      if (!verifyRes.ok) throw new Error("Wallet signature verification failed");
      const { token } = await verifyRes.json();

      if (token) {
        localStorage.setItem("auth_token", token);
        setIsLoggedIn(true);
      }
    } catch (err: any) {
      console.error("Login process error:", err);
      setError(err?.message || "An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, ensureInstance]);

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
      login,
      logout
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
