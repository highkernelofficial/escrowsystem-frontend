"use client";

import { useCallback } from "react";
import algosdk from "algosdk";
import { useWallet } from "@/context/WalletContext";
import { buildUrl } from "@/config/api";

// Algorand Testnet Config
const TESTNET_GENESIS_ID = "testnet-v1.0";
console.log("App is running on Algorand Testnet");

/**
 * useWalletAuth Hook
 *
 * Production-grade wallet authentication using Algorand Pera Wallet.
 * Uses signTransaction() with a zero-amount dummy transaction for
 * maximum compatibility across desktop and mobile.
 */
export function useWalletAuth() {
  const context = useWallet();
  const {
    walletAddress,
    ensureInstance,
    setIsLoading,
    setError,
    setIsLoggedIn,
  } = context;

  const login = useCallback(async () => {
    console.log("LOGIN FUNCTION CALLED");

    const peraWallet = ensureInstance();
    if (!peraWallet) {
      setError("PeraWallet not initialized");
      return;
    }
    if (!walletAddress) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ── Step 1: Fetch nonce from backend ──────────────────────────
      console.log("Calling /auth/nonce");
      const nonceRes = await fetch(
        buildUrl(`/auth/nonce?wallet=${walletAddress}`),
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (!nonceRes.ok) throw new Error("Failed to retrieve authentication nonce");

      const { message } = await nonceRes.json();
      console.log("Nonce message:", message);

      // ── Step 2: Encode message as bytes ───────────────────────────
      const encodedMessage = new TextEncoder().encode(message);

      // ── Step 3: Sign Message with Pera Wallet ─────────────────────
      // We use signData() for pure message signing, which is more
      // secure and specialized for authentication than dummy txns.
      console.log("Requesting signature via signData...");

      let signatureBase64: string;

      try {
        const signDataResponse = await peraWallet.signData(
          [
            {
              data: encodedMessage,
              message: `Authenticate with ${walletAddress}`,
            },
          ],
          walletAddress
        );

        if (!signDataResponse || !signDataResponse[0]) {
          throw new Error("No signature returned from Pera Wallet");
        }

        const signatureBytes = signDataResponse[0];
        console.log("Signature received, length:", signatureBytes.length);

        // Convert 64-byte signature to base64
        signatureBase64 = btoa(String.fromCharCode(...Array.from(signatureBytes)));

      } catch (err: any) {
        console.error("Pera Wallet signing error:", err);

        // Handle specific Network Mismatch error (4100)
        if (err?.message?.includes("4100") || err?.message?.toLowerCase().includes("network mismatch")) {
          setError("Please switch your Pera Wallet to Testnet");
          return;
        }

        if (
          err?.data?.type === "SIGN_TRANSACTIONS_MODAL_CLOSED" ||
          err?.message?.includes("rejected")
        ) {
          throw new Error("Signature request was rejected");
        }
        throw new Error(err?.message || "Wallet signing failed");
      }

      // ── Step 7: Verify with backend ───────────────────────────────
      console.log("Calling /auth/verify");
      const verifyRes = await fetch(buildUrl("/auth/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          wallet: walletAddress,
          message: message,
          signature: signatureBase64,
          signedTransaction: null, // No longer using transactions
        }),
      });

      // ── Step 8: Handle response ───────────────────────────────────
      if (!verifyRes.ok) {
        const errorText = await verifyRes.text().catch(() => "Unknown error");
        console.error("Verify failed:", verifyRes.status, errorText);
        throw new Error("Verification failed");
      }

      const data = await verifyRes.json();
      console.log("Verify response:", data);

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        setIsLoggedIn(true);
        console.log("✅ Login successful, JWT stored");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Signing failed or user rejected the request");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, ensureInstance, setIsLoading, setError, setIsLoggedIn]);

  return {
    walletAddress: context.walletAddress,
    isConnected: context.isConnected,
    isLoggedIn: context.isLoggedIn,
    isLoading: context.isLoading,
    error: context.error,
    connectWallet: context.connectWallet,
    login,
    logout: context.logout,
    setIsLoggedIn: context.setIsLoggedIn,
  };
}
