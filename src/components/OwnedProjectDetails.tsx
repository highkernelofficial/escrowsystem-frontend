"use client";

import { useState, useEffect, useRef } from "react";
import algosdk from "algosdk";
import { motion, AnimatePresence } from "framer-motion";
import {
   ArrowLeft, Lock, BadgeCheck, Clock, CheckCircle2,
   AlertCircle, RotateCcw, Wallet, Trophy, User,
   ChevronRight, ExternalLink, MessageSquare, Briefcase,
   Layers, Code2, Sparkles, TrendingUp, ShieldCheck,
   MoreVertical, ThumbsUp, ThumbsDown, UserMinus, Globe, Play, Loader2,
   Phone, Mail, Link as LinkIcon, Activity, Star, Users, Banknote, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DisputeModal } from "./DisputeModal";
import { useWallet } from "@/context/WalletContext";
import { buildUrl } from "@/config/api";
import type { Project, Milestone, MilestoneStatus, Freelancer, DisputeRecord } from "@/lib/mockData";

const GithubIcon = ({ className }: { className?: string }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
   </svg>
);

interface OwnedProjectDetailsProps {
   project: Project;
   onBack: () => void;
}

interface Applicant {
   id: string;
   projectId: string;
   freelancerId: string;
   name: string;
   email: string;
   mobileNumber: string;
   linkedin: string;
   github: string;
   proposal: string;
   status: string;
   createdAt: string;
}

export function OwnedProjectDetails({ project, onBack }: OwnedProjectDetailsProps) {
   const { walletAddress, ensureInstance, logout } = useWallet();
   const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "applicants">("overview");

   // Local state for the dynamic actions
   const [assignedFreelancer, setAssignedFreelancer] = useState<Freelancer | null>(project.assignedFreelancer || null);
   const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
   const [applicants, setApplicants] = useState<Applicant[]>([]);
   const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
   const [assigningId, setAssigningId] = useState<string | null>(null);
   const [unassigningId, setUnassigningId] = useState<string | null>(null);
   const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
   const [evaluatingSeconds, setEvaluatingSeconds] = useState(0);
   const [assignedAppId, setAssignedAppId] = useState<string | null>(null);
   const [aiFeedback, setAiFeedback] = useState<Record<string, { score: number, message: string, approved: boolean, aiApproval: string }>>({});

   // Funding State
   const [fundingTxnHash, setFundingTxnHash] = useState<string | null>(project.fundingTxnHash || null);
   const [prepareTxnHash, setPrepareTxnHash] = useState<string | null>(null);
   const [isPreparingFund, setIsPreparingFund] = useState(false);
   const [isConfirmingFund, setIsConfirmingFund] = useState(false);
   const [signedFundTxns, setSignedFundTxns] = useState<string[] | null>(null);
   const [releasingMilestoneId, setReleasingMilestoneId] = useState<string | null>(null);
   // Global wallet lock — prevents ANY concurrent signing requests (Pera 4100)
   const isWalletSigningRef = useRef(false);

   // Sync local state when project prop changes from the backend
   useEffect(() => {
      if (project) {
         setMilestones(project.milestones || []);
         setFundingTxnHash(project.fundingTxnHash || null);
         if (project.assignedFreelancer) {
            setAssignedFreelancer(project.assignedFreelancer);
         }
         fetchApplicants();
         fetchSubmissions();
         fetchDisputes();
      }
   }, [project]);

   // Evaluation Timer & Resilience Handler
   useEffect(() => {
      let interval: NodeJS.Timeout;
      if (evaluatingId) {
         setEvaluatingSeconds(0);
         interval = setInterval(() => {
            setEvaluatingSeconds(s => s + 1);
         }, 1000);

         const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "AI evaluation in progress. Closing this tab will cancel the analysis. Are you sure?";
         };
         window.addEventListener("beforeunload", handleBeforeUnload);

         return () => {
            clearInterval(interval);
            window.removeEventListener("beforeunload", handleBeforeUnload);
         };
      }
   }, [evaluatingId]);

   const getEvaluationMessage = () => {
      if (evaluatingSeconds < 30) return "Fetching Repository...";
      if (evaluatingSeconds < 90) return "Deep-thinking: Analyzing Code Patterns...";
      if (evaluatingSeconds < 150) return "Running Security & Quality Checks...";
      if (evaluatingSeconds < 180) return "Generating Final Report...";
      return "Almost there! Finalizing AI Feedback...";
   };

   const fetchSubmissions = async () => {
      if (!project.id) return;

      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/submissions/client/project/${project.id}`);

         console.log(`🚀 [INIT] Fetching submissions for project: ${project.id}...`);

         const response = await fetch(fetchUrl, {
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to fetch submissions: ${response.status}`);
         }

         const data: any[] = await response.json();
         console.log(`✅ [SUBMISSIONS SUCCESS] Fetched ${data.length} milestone submissions!`);

         setMilestones(prev =>
            prev.map(m => {
               const milestoneData = data.find(item => item.milestoneId === m.id);
               if (milestoneData && milestoneData.submissions?.length > 0) {
                  const latestSub = milestoneData.submissions[0];
                  return {
                     ...m,
                     githubLink: latestSub.githubLink,
                     demoLink: latestSub.demoLink,
                     submissionNotes: latestSub.description, // Map description to submissionNotes
                     submissionId: latestSub.id, // Capture submissionId for AI evaluation
                     status: "submitted" // Force local status update to unlock the UI
                  };
               }
               return m;
            })
         );
      } catch (err) {
         console.error("❌ [SUBMISSIONS ERROR]:", err);
         // No need to toast here if it's a routine fetch, but helps for debugging
      }
   };

   const fetchDisputes = async () => {
      if (!project.id) return;
      try {
         const token = localStorage.getItem("auth_token");
         const response = await fetch(buildUrl(`/api/disputes/project/${project.id}`), {
            headers: {
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
         });
         if (!response.ok) return;
         const data: DisputeRecord[] = await response.json();
         console.log(`✅ [DISPUTES] Loaded ${data.length} dispute(s) for project ${project.id}`);
         setDisputes(data);
      } catch (err) {
         console.error("❌ [DISPUTES ERROR]:", err);
      }
   };

   const getDisputeForMilestone = (milestoneId: string): DisputeRecord | undefined => {
      return disputes.find(d => d.milestoneId === milestoneId);
   };

   const handleResolveDispute = async (disputeId: string, newStatus: "RESOLVED" | "REJECTED") => {
      setResolvingDisputeId(disputeId);
      try {
         const token = localStorage.getItem("auth_token");
         const response = await fetch(buildUrl(`/api/disputes/${disputeId}/status`), {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ status: newStatus }),
         });
         if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            throw new Error(`Failed to update dispute: ${errorText}`);
         }
         const updated: DisputeRecord = await response.json();
         // Update disputes list
         setDisputes(prev => prev.map(d => d.id === disputeId ? updated : d));
         // Reset milestone status based on resolution
         if (newStatus === "RESOLVED") {
            setMilestones(prev =>
               prev.map(m => m.id === updated.milestoneId ? { ...m, status: "pending" as MilestoneStatus } : m)
            );
            addToast("Dispute resolved! Freelancer can now update their submission.", "success");
         } else {
            setMilestones(prev =>
               prev.map(m => m.id === updated.milestoneId ? { ...m, status: "pending" as MilestoneStatus } : m)
            );
            addToast("Dispute rejected. Milestone reset to pending.", "info");
         }
      } catch (err: any) {
         console.error("❌ [RESOLVE DISPUTE ERROR]:", err);
         addToast(err.message || "Failed to update dispute status", "error");
      } finally {
         setResolvingDisputeId(null);
      }
   };

   const fetchApplicants = async () => {
      if (!project.id) return;

      setIsLoadingApplicants(true);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/applications/project/${project.id}`);

         console.log(`🚀 [INIT] Fetching applicants for project: ${project.id}...`);

         const response = await fetch(fetchUrl, {
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to fetch applicants: ${response.status}`);
         }

         const data: Applicant[] = await response.json();
         console.log(`✅ [APPLICANTS SUCCESS] Fetched ${data.length} applicants!`);
         setApplicants(data);

         // Auto-assign the freelancer in the UI if the backend says they are ASSIGNED
         const assigned = data.find(a => a.status?.toUpperCase() === "ASSIGNED");
         if (assigned) {
            setAssignedAppId(assigned.id);
            setAssignedFreelancer({
               name: assigned.name,
               rating: 5.0,
               avatar: "",
               completedProjects: 0
            });
         }
      } catch (err) {
         console.error("❌ [APPLICANTS ERROR]:", err);
         addToast("Failed to load applicants", "error");
      } finally {
         setIsLoadingApplicants(false);
      }
   };

   // Dispute State
   const [disputingId, setDisputingId] = useState<string | null>(null);
   const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
   const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
   const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);

   // Toast State
   const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" | "error" }[]>([]);

   const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
         setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
   };

   const completedMilestonesCount = milestones.filter(m => {
      const s = m.status?.toLowerCase();
      return s === "completed" || s === "approved" || s === "paid" || !!m.txnHash;
   }).length;
   const progressPercent = milestones.length > 0 
      ? Math.round((completedMilestonesCount / milestones.length) * 100) 
      : 0;

   const handleAssignFreelancer = async (applicant: Applicant) => {
      setAssigningId(applicant.id);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/applications/${applicant.id}/assign`);

         console.log(`🚀 [INIT] Assigning freelancer ${applicant.name} (App ID: ${applicant.id})...`);

         const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Accept": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(applicant),
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Failed to assign: ${response.status}`);
         }

         console.log("✅ [ASSIGN SUCCESS] Freelancer assigned successfully!");

         setAssignedAppId(applicant.id);
         setAssignedFreelancer({
            name: applicant.name,
            rating: 5.0,
            avatar: "",
            completedProjects: 0
         });

         // Update the project's local state and refresh applicants
         fetchApplicants();
         addToast(`Successfully assigned ${applicant.name} to the project!`);
         setActiveTab("overview");
      } catch (err) {
         console.error("❌ [ASSIGN ERROR]:", err);
         addToast(err instanceof Error ? err.message : "Failed to assign freelancer", "error");
      } finally {
         setAssigningId(null);
      }
   };

   const handleKickFreelancer = async (appId?: string) => {
      const idToUnassign = appId || assignedAppId;
      if (!idToUnassign) {
         console.warn("⚠️ [UNASSIGN] No application ID available to unassign.");
         return;
      }

      setUnassigningId(idToUnassign);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/applications/${idToUnassign}/unassign`);

         console.log(`🚀 [INIT] Unassigning freelancer (App ID: ${idToUnassign})...`);

         const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Accept": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Failed to unassign: ${response.status}`);
         }

         console.log("✅ [UNASSIGN SUCCESS] Freelancer removed!");
         setAssignedFreelancer(null);
         setAssignedAppId(null);
         fetchApplicants();
         addToast("Freelancer has been removed from the project.", "error");
      } catch (err) {
         console.error("❌ [UNASSIGN ERROR]:", err);
         addToast(err instanceof Error ? err.message : "Failed to remove freelancer", "error");
      } finally {
         setUnassigningId(null);
      }
   };

   const handleAIEvaluation = async (milestoneId: string) => {
      const milestone = milestones.find(m => m.id === milestoneId);
      const submissionId = milestone?.submissionId;

      if (!submissionId) {
         console.warn("⚠️ [AI EVAL] No submission ID found for milestone:", milestoneId);
         addToast("No submission found to evaluate.", "error");
         return;
      }

      setEvaluatingId(milestoneId);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/submissions/${submissionId}/evaluate-ai`);

         console.log(`🚀 [INIT] Requesting AI Evaluation for submission: ${submissionId}...`);

         const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            keepalive: true, // Tells the browser to prioritize the connection
         });

         if (!response.ok) {
            if (response.status === 504) {
               throw new Error("Analysis is taking longer than usual (Gateway Timeout). Please refresh in a minute to see if the AI generated the result natively.");
            }
            const errorData = await response.text().catch(() => "Unknown error");
            throw new Error(`AI Evaluation failed: ${response.status} - ${errorData}`);
         }

         const data = await response.json();
         console.log("✅ [AI EVAL SUCCESS] Response:", data);

         setAiFeedback(prev => ({
            ...prev,
            [milestoneId]: {
               score: data.aiScore || 0,
               message: data.aiFeedback || "AI check complete. No detailed feedback provided.",
               approved: data.approved === true,
               aiApproval: data.aiApproval || (data.approved === true ? "approved" : "rejected")
            }
         }));
         addToast("AI Evaluation Complete", "success");
      } catch (err: any) {
         console.error("❌ [AI EVAL ERROR]:", err);
         addToast(err.message || "AI Evaluation failed", "error");
      } finally {
         setEvaluatingId(null);
      }
   };

   const handleApproveMilestone = async (milestoneId: string) => {
      await handleReleaseMilestonePayment(milestoneId);
   };

   const handleDisputeClick = (milestoneId: string) => {
      setDisputingId(milestoneId);
      setIsDisputeModalOpen(true);
   };

   const handleDisputeSubmit = async (reason: string) => {
      if (!disputingId) return;

      try {
         const token = localStorage.getItem("auth_token");

         if (!token) {
            throw new Error("Authentication session expired. Please login again.");
         }

         const response = await fetch(buildUrl("/api/disputes"), {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
               milestoneId: disputingId,
               reason
            })
         });

         if (!response.ok) {
            const errorData = await response.text().catch(() => "Unknown error occurred.");
            throw new Error(`Failed to raise dispute: ${errorData}`);
         }

         setMilestones(prev =>
            prev.map(m => m.id === disputingId ? { ...m, status: "dispute" as MilestoneStatus } : m)
         );
         addToast("Dispute has been raised and sent to arbitration.", "error");
         setIsDisputeModalOpen(false);
      } catch (error: any) {
         console.error("Dispute error:", error);
         throw error; // Re-throw to handle in DisputeModal's catch block
      }
   };

   const handleReleasePayment = async (milestoneId: string) => {
      await handleReleaseMilestonePayment(milestoneId);
   };

   // ─── Release Milestone Payment (Full Blockchain Flow) ──────────
   const handleReleaseMilestonePayment = async (milestoneId: string) => {
      if (!walletAddress) {
         addToast("Please connect your wallet first.", "error");
         return;
      }

      // Global wallet lock — block if ANY signing is already in progress
      if (isWalletSigningRef.current) {
         addToast("A wallet request is already in progress. Please check Pera Wallet on your phone.", "error");
         return;
      }

      isWalletSigningRef.current = true;
      setReleasingMilestoneId(milestoneId);
      try {
         const token = localStorage.getItem("auth_token");

         // Step 1: Prepare - Get unsigned transaction from backend
         console.log(`🚀 [RELEASE] Preparing payment release for milestone: ${milestoneId}...`);
         const prepareResponse = await fetch(buildUrl("/api/payments/release/prepare"), {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ milestoneId }),
         });

         if (!prepareResponse.ok) {
            const errorData = await prepareResponse.text().catch(() => "Unknown error");
            throw new Error(`Release prepare failed: ${prepareResponse.status} - ${errorData}`);
         }

         const prepareData = await prepareResponse.json();
         console.log("📦 [RELEASE] Data from backend:", prepareData);

         // Handle plural or singular field names
         const rawTxnData = prepareData.unsignedTxns || prepareData.txns || prepareData.unsignedTxn || prepareData.txn;
         if (!rawTxnData) throw new Error("No transactions received from backend");

         // Step 2: Normalize and Decode
         const txnsToDecode = Array.isArray(rawTxnData) ? rawTxnData : [rawTxnData];
         console.log(`📝 [RELEASE] Decoding ${txnsToDecode.length} transaction(s)...`);

         const decodedTxns = txnsToDecode.map((base64, idx) => {
            try {
               const decoded = algosdk.decodeUnsignedTransaction(Buffer.from(base64, "base64"));
               // Log group info if present
               if (decoded.group) {
                  console.log(`   - Txn ${idx}: Group ID present: ${Buffer.from(decoded.group).toString("base64")}`);
               } else {
                  console.log(`   - Txn ${idx}: No group ID`);
               }
               return decoded;
            } catch (decodeErr) {
               console.error(`❌ Failed to decode transaction at index ${idx}:`, decodeErr);
               throw new Error(`Transaction decoding failed at index ${idx}`);
            }
         });

         // Step 3: Sign with Pera Wallet
         const peraWallet = ensureInstance();
         if (!peraWallet) throw new Error("Pera Wallet not initialized");

         // Build Pera sign request — single group containing all txns
         const signGroup = decodedTxns.map(txn => {
            const senderAddr = algosdk.encodeAddress(txn.sender.publicKey);
            const isUserSender = senderAddr.toLowerCase() === walletAddress?.toLowerCase();
            return {
               txn,
               signers: isUserSender ? [walletAddress] : []
            };
         });

         console.log(`📝 [RELEASE] Requesting signature for ${decodedTxns.length} transaction(s)...`);
         const signedTxns = await peraWallet.signTransaction([signGroup]);

         if (!signedTxns || signedTxns.length === 0) {
            throw new Error("Transaction signing was rejected or failed");
         }

         // Step 4: Submit sequentially — approve first, then release
         // Algorand doesn't share state between grouped txns, so we must
         // submit approve, wait for it to confirm (status=3), then submit release.
         const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

         let txId: string;
         if (signedTxns.length >= 2) {
            // 4a: Submit APPROVE transaction
            console.log(`🚀 [RELEASE] Submitting APPROVE transaction (1/${signedTxns.length})...`);
            const approveResponse = await algodClient.sendRawTransaction(signedTxns[0]).do();
            const approveTxId = (approveResponse as any).txId || (approveResponse as any).txid;
            console.log(`⏳ [RELEASE] Waiting for APPROVE confirmation... txId: ${approveTxId}`);
            await algosdk.waitForConfirmation(algodClient, approveTxId, 4);
            console.log(`✅ [RELEASE] APPROVE confirmed on-chain!`);

            // 4b: Submit RELEASE transaction
            console.log(`🚀 [RELEASE] Submitting RELEASE transaction (2/${signedTxns.length})...`);
            const releaseResponse = await algodClient.sendRawTransaction(signedTxns[1]).do();
            const releaseTxId = (releaseResponse as any).txId || (releaseResponse as any).txid;
            console.log(`⏳ [RELEASE] Waiting for RELEASE confirmation... txId: ${releaseTxId}`);
            await algosdk.waitForConfirmation(algodClient, releaseTxId, 4);
            console.log(`✅ [RELEASE] RELEASE confirmed on-chain!`);

            txId = releaseTxId;
         } else {
            // Single transaction fallback (e.g. approve_and_release in new contracts)
            console.log(`🚀 [RELEASE] Submitting single transaction...`);
            const submitResponse = await algodClient.sendRawTransaction(signedTxns[0]).do();
            txId = (submitResponse as any).txId || (submitResponse as any).txid;
            console.log(`⏳ [RELEASE] Waiting for on-chain confirmation... txId: ${txId}`);
            await algosdk.waitForConfirmation(algodClient, txId, 4);
            console.log(`✅ [RELEASE] Confirmed on-chain!`);
         }

         // Step 6: Confirm with backend
         console.log(`🚀 [RELEASE] Confirming release for milestone: ${milestoneId}...`);
         const confirmResponse = await fetch(buildUrl("/api/payments/release/confirm"), {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ milestoneId, txnHash: txId }),
         });

         if (!confirmResponse.ok) {
            const errorData = await confirmResponse.text().catch(() => "Unknown error");
            throw new Error(`Release confirm failed: ${confirmResponse.status} - ${errorData}`);
         }

         const confirmData = await confirmResponse.json();
         console.log("✅ [RELEASE] Payment release confirmed!", confirmData);

         // Step 6: Update local UI state
         setMilestones(prev =>
            prev.map(m => m.id === milestoneId ? { ...m, status: "completed" as MilestoneStatus } : m)
         );
         addToast("Payment released successfully to the freelancer!");

      } catch (err: any) {
         console.error("❌ [RELEASE ERROR]:", err);

         const errMsg = err?.message || "";
         const errCode = err?.data?.code ?? err?.code;
         const is4100 = errCode === 4100 || errMsg.includes("4100") || errMsg.toLowerCase().includes("pending");

         if (is4100) {
            console.warn("🔄 Pera 4100 detected — disconnecting wallet for clean retry.");
            try { await logout(); } catch (_) { /* best-effort */ }
            addToast("Wallet is busy with another request. Please reconnect your wallet and try again.", "error");
         } else {
            addToast(errMsg || "Failed to release payment", "error");
         }
      } finally {
         isWalletSigningRef.current = false; // Always release the global lock
         setReleasingMilestoneId(null);
      }
   };

   // ─── Funding Handlers ─────────────────────────────────────
   const handlePrepareFund = async () => {
      if (!walletAddress) {
         addToast("Please connect your wallet first.", "error");
         return;
      }

      // Mutex guard — block if ANY wallet signing is already in progress
      if (isWalletSigningRef.current) {
         addToast("A wallet request is already in progress. Please check Pera Wallet.", "error");
         return;
      }

      isWalletSigningRef.current = true;
      setIsPreparingFund(true);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/projects/${project.id}/fund/prepare`);

         console.log(`🚀 [FUND] Preparing fund for project: ${project.id}...`);

         // Step 1: Get unsigned transaction from backend
         const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            // No body needed — backend fetches ALL milestones for the project automatically
         });

         if (!response.ok) {
            const errorData = await response.text().catch(() => "Unknown error");
            throw new Error(`Fund prepare failed: ${response.status} - ${errorData}`);
         }

         const data = await response.json();
         console.log("📦 [FUND] Data from backend:", data);

         // Handle plural or singular field names
         const rawTxnData = data.unsignedTxns || data.txns || data.unsignedTxn || data.txn;
         if (!rawTxnData) throw new Error("No transactions received from backend");

         // Step 2: Normalize and Decode
         const txnsToDecode = Array.isArray(rawTxnData) ? rawTxnData : [rawTxnData];
         console.log(`📝 [FUND] Decoding ${txnsToDecode.length} transaction(s)...`);

         const decodedTxns = txnsToDecode.map((base64, idx) => {
            try {
               const decoded = algosdk.decodeUnsignedTransaction(Buffer.from(base64, "base64"));
               if (decoded.group) {
                  console.log(`   - Txn ${idx}: Group ID present: ${Buffer.from(decoded.group).toString("base64")}`);
               } else {
                  console.log(`   - Txn ${idx}: No group ID`);
               }
               return decoded;
            } catch (decodeErr) {
               console.error(`❌ Failed to decode transaction at index ${idx}:`, decodeErr);
               throw new Error(`Transaction decoding failed at index ${idx}`);
            }
         });

         // Step 3: Sign with Pera Wallet (Sign all as a group)
         const peraWallet = ensureInstance();
         if (!peraWallet) throw new Error("Pera Wallet not initialized");

         const signGroup = decodedTxns.map(txn => {
            const senderAddr = algosdk.encodeAddress(txn.sender.publicKey);
            const isUserSender = senderAddr.toLowerCase() === walletAddress?.toLowerCase();
            return {
               txn,
               signers: isUserSender ? [walletAddress] : []
            };
         });

         console.log(`📝 [FUND] Requesting signature for ${decodedTxns.length} transaction(s)...`);
         const signedTxns = await peraWallet.signTransaction([signGroup]);

         if (!signedTxns || signedTxns.length === 0) {
            throw new Error("Transaction signing was rejected or failed");
         }

         // Step 4: Submit signed txns to Algorand network
         const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
         const submitResponse = await algodClient.sendRawTransaction(signedTxns).do();
         const txId = (submitResponse as any).txId || (submitResponse as any).txid;
         console.log(`🚀 [FUND] Submitted to Algorand. txId: ${txId}`);

         // Step 5: Wait for on-chain confirmation
         console.log(`⏳ [FUND] Waiting for on-chain confirmation...`);
         await algosdk.waitForConfirmation(algodClient, txId, 4);
         console.log(`✅ [FUND] Confirmed on-chain!`);

         setPrepareTxnHash(txId);
         setSignedFundTxns([txId]); // non-null signals Confirm Fund step is ready
         console.log("✅ [FUND] Transaction submitted and confirmed. txId:", txId);
         addToast("Fund transaction confirmed on-chain! Now click Confirm Fund.", "success");
      } catch (err: any) {
         console.error("❌ [FUND PREPARE ERROR]:", err);

         const errMsg = err?.message || "";
         const errCode = err?.data?.code ?? err?.code;
         const is4100 = errCode === 4100 || errMsg.includes("4100") || errMsg.toLowerCase().includes("pending");

         if (is4100) {
            console.warn("🔄 Pera 4100 detected — disconnecting wallet for clean retry.");
            try { await logout(); } catch (_) { /* best-effort */ }
            addToast("Wallet is busy with another request. Please reconnect your wallet and try again.", "error");
         } else {
            addToast(errMsg || "Failed to prepare fund", "error");
         }
      } finally {
         isWalletSigningRef.current = false;
         setIsPreparingFund(false);
      }
   };

   const handleConfirmFund = async () => {
      if (!prepareTxnHash) {
         addToast("Please complete the fund preparation step first.", "error");
         return;
      }

      setIsConfirmingFund(true);
      try {
         const token = localStorage.getItem("auth_token");
         const fetchUrl = buildUrl(`/api/projects/fund/confirm`);

         // Send signed txns to backend — backend submits to chain via FastAPI
         const requestBody = {
            projectId: project.id,
            txnHash: prepareTxnHash,
         };
         console.log(`🚀 [FUND] Confirming fund for project: ${project.id}...`, requestBody);

         const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(requestBody),
         });

         if (!response.ok) {
            const errorData = await response.text().catch(() => "Unknown error");
            throw new Error(`Fund confirm failed: ${response.status} - ${errorData}`);
         }

         const data = await response.json();
         console.log("✅ [FUND CONFIRM SUCCESS]", data);

         // Backend returns the real txnHash after chain submission
         const newHash = data.fundingTxnHash || data.funding_txn_hash || data.txHash || prepareTxnHash;
         setFundingTxnHash(newHash);
         setSignedFundTxns(null);
         setPrepareTxnHash(null);
         addToast("Escrow funded successfully! Milestones are now active.", "success");
      } catch (err: any) {
         console.error("❌ [FUND CONFIRM ERROR]:", err);
         addToast(err.message || "Failed to confirm fund", "error");
      } finally {
         setIsConfirmingFund(false);
      }
   };

   const getStatusColor = (status: string) => {
      const s = status?.toLowerCase();
      switch (s) {
         case "completed":
         case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10";
         case "submitted": return "bg-sky-50 text-sky-600 border-sky-100 ring-sky-500/10";
         case "pending": return "bg-slate-50 text-slate-400 border-slate-100 ring-slate-500/10";
         case "dispute":
         case "disputed": return "bg-rose-50 text-rose-600 border-rose-100 ring-rose-100/10";
         default: return "bg-slate-50 text-slate-400";
      }
   };

   const getDisputeStatusColor = (status: string) => {
      switch (status?.toUpperCase()) {
         case "OPEN": return "bg-orange-50 text-orange-600 border-orange-100";
         case "UNDER_REVIEW": return "bg-amber-50 text-amber-600 border-amber-100";
         case "RESOLVED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
         case "REJECTED": return "bg-slate-50 text-slate-500 border-slate-100";
         default: return "bg-rose-50 text-rose-500 border-rose-100";
      }
   };

   const containerVariants = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.1 } }
   } as const;

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 25 } }
   } as const;

   return (
      <div className="relative">
         {/* Custom Toast Container */}
         <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
               {toasts.map(toast => (
                  <motion.div
                     key={toast.id}
                     initial={{ opacity: 0, scale: 0.8, x: 20 }}
                     animate={{ opacity: 1, scale: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.8, x: 20 }}
                     className={cn(
                        "px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 pointer-events-auto border",
                        toast.type === "success" && "bg-emerald-500/90 text-white border-emerald-400",
                        toast.type === "error" && "bg-rose-500/90 text-white border-rose-400",
                        toast.type === "info" && "bg-sky-500/90 text-white border-sky-400"
                     )}
                  >
                     <CheckCircle2 className="h-5 w-5" />
                     <span className="font-bold text-sm">{toast.message}</span>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         <motion.div
            variants={containerVariants}
            initial={false}
            animate="show"
            className="mx-auto max-w-5xl space-y-6 md:space-y-8 pb-20 px-4 md:px-0"
         >
            <motion.button
               variants={itemVariants}
               onClick={onBack}
               className="group flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 transition-colors"
            >
               <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-400 group-hover:bg-slate-50 transition-all">
                  <ArrowLeft className="h-4 w-4" />
               </div>
               Back to Dashboard
            </motion.button>

            {/* HEADER SECTION */}
            <motion.div variants={itemVariants} className="relative rounded-3xl md:rounded-[3rem] bg-white p-1 shadow-2xl shadow-slate-200/50 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 opacity-20" />
               <div className="relative rounded-[1.4rem] md:rounded-[2.8rem] bg-white p-6 md:p-12 overflow-hidden">
                  <div className="relative z-10 space-y-8">
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                           <div className="flex flex-wrap items-center gap-3">
                              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-800 flex items-center gap-2">
                                 <Briefcase className="h-3 w-3" />
                                 Client View
                              </span>
                              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                 <Lock className="h-3 w-3" />
                                 Funds Locked 🔒
                              </div>
                              <span className={cn(
                                 "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                 assignedFreelancer ? "bg-sky-50 text-sky-600 border-sky-100" : "bg-amber-50 text-amber-600 border-amber-100"
                              )}>
                                 {assignedFreelancer ? "Assigned" : "Open for Applications"}
                              </span>
                           </div>
                           <h1 className="text-2xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
                              {project.title}
                           </h1>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-[2rem] w-full md:min-w-[180px] shadow-sm">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Budget</span>
                           <span className="text-2xl md:text-3xl font-black text-emerald-600">
                              {typeof project.budget === 'number' ? `${project.budget.toLocaleString()} ALGO` : project.budget}
                           </span>
                        </div>
                     </div>

                     {/* Global Progress Bar */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Milestone Progress</p>
                           <p className="text-sm font-black text-slate-900">{completedMilestonesCount} of {milestones.length} Completed</p>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                           <motion.div
                              key={progressPercent}
                              initial={false}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-2xl md:rounded-3xl w-full md:w-fit">
               <button
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                     "flex-1 md:flex-none px-4 md:px-8 h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                     activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
               >
                  Overview
               </button>
               <button
                  onClick={() => setActiveTab("milestones")}
                  className={cn(
                     "flex-1 md:flex-none px-4 md:px-8 h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                     activeTab === "milestones" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
               >
                  Milestones
               </button>
               <button
                  onClick={() => setActiveTab("applicants")}
                  className={cn(
                     "flex-1 md:flex-none px-4 md:px-8 h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                     activeTab === "applicants" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
               >
                  Applicants ({applicants.length})
               </button>
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[500px]">
               <AnimatePresence mode="wait">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                     <motion.div
                        key="overview-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                     >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                           <div className="lg:col-span-2 space-y-6">
                              <div className="rounded-[1.5rem] md:rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
                                 <h3 className="text-xl font-black text-slate-900">Project Description</h3>
                                 <p className="text-slate-600 leading-relaxed font-medium">{project.description}</p>

                                 <div className="pt-6 border-t border-slate-100">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Expected Outcome</h4>
                                    <p className="text-slate-800 font-bold">{project.outcome}</p>
                                 </div>

                                 <div className="pt-6 border-t border-slate-100">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Tech Stack</h4>
                                    <div className="flex flex-wrap gap-2">
                                       {project.techStack.map(tech => (
                                          <span key={tech} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                                             {tech}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="rounded-2xl md:rounded-3xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
                                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Execution Detail</h3>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                       <span className="text-xs font-bold text-slate-500">Total Milestones</span>
                                       <span className="font-black text-slate-900">{milestones.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                       <span className="text-xs font-bold text-emerald-600">Fund Source</span>
                                       <span className="font-black text-emerald-700 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Escrow</span>
                                    </div>
                                 </div>
                              </div>

                              <div className={cn(
                                 "relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-slate-100 p-6 md:p-8 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50",
                                 !assignedFreelancer ? "bg-slate-50/50 border-dashed" : "bg-white"
                              )}>
                                 {assignedFreelancer ? (
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                       <div className="flex items-center gap-6">
                                          <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-500 ring-4 ring-white shadow-sm transition-transform hover:scale-110">
                                             <User className="h-10 w-10" />
                                          </div>
                                          <div className="space-y-3">
                                             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{assignedFreelancer.name}</h3>
                                             <button
                                                onClick={() => handleKickFreelancer()}
                                                disabled={unassigningId === assignedAppId}
                                                className="h-10 px-4 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100 shadow-sm disabled:opacity-50"
                                             >
                                                {unassigningId === assignedAppId ? (
                                                   <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
                                                ) : (
                                                   <><UserMinus className="h-4 w-4" /> Remove Assigned Freelancer</>
                                                )}
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
                                       <div className="h-20 w-20 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400">
                                          <User className="h-10 w-10" />
                                       </div>
                                       <div className="space-y-2">
                                          <h3 className="text-xl font-black text-slate-900">No Freelancer Assigned</h3>
                                          <p className="text-sm font-bold text-slate-500 max-w-[280px]">Review applicants and assign someone to begin.</p>
                                       </div>
                                       <button
                                          onClick={() => setActiveTab("applicants")}
                                          className="h-12 px-8 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2"
                                       >
                                          View Applicants
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* TAB 2: MILESTONES (CORE) */}
                  {activeTab === "milestones" && (
                     <motion.div
                        key="milestones-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12 pb-20"
                     >
                        {/* ─── FUNDING GATE: Show buttons if no funding hash ─── */}
                        {!fundingTxnHash ? (
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col sm:flex-row items-center justify-center gap-4 py-12"
                           >
                              <button
                                 onClick={handlePrepareFund}
                                 disabled={isPreparingFund || isConfirmingFund}
                                 className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
                              >
                                 {isPreparingFund ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Preparing...</>
                                 ) : (
                                    <><Banknote className="h-5 w-5" /> Prepare Fund</>
                                 )}
                              </button>
                              <button
                                 onClick={handleConfirmFund}
                                 disabled={isConfirmingFund || isPreparingFund}
                                 className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400"
                              >
                                 {isConfirmingFund ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Confirming...</>
                                 ) : (
                                    <><Send className="h-5 w-5" /> Confirm Fund</>
                                 )}
                              </button>
                           </motion.div>
                        ) : (
                           /* ─── FUNDED: Show Milestones ─── */
                           <>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                                 <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase flex items-center gap-3">
                                    <Activity className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" /> Milestone Execution Roadmap
                                 </h2>
                                 <span className="w-fit text-[10px] md:text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100">
                                    {milestones.length} Strategic Nodes
                                 </span>
                              </div>

                              <div className="relative space-y-12">
                                 {/* Timeline vertical line */}
                                 <div className="absolute left-[18px] md:left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

                                 {milestones.map((m, i) => (
                                    <motion.div
                                       key={m.id}
                                       initial={false}
                                       animate={{ opacity: 1, x: 0 }}
                                       transition={{ delay: i * 0.1 }}
                                       className="relative pl-12 md:pl-24 group"
                                    >
                                       {/* Node Indicator */}
                                       <div className={cn(
                                          "absolute left-[13px] md:left-8 h-3.5 w-3.5 md:h-5 md:w-5 rounded-full border-[3px] md:border-4 border-white shadow-xl z-20 transition-all duration-500 top-10",
                                          m.status === 'completed' || m.status === 'approved' ? "bg-emerald-500 shadow-emerald-200" :
                                             m.status === 'submitted' ? "bg-sky-500 shadow-sky-200 animate-pulse" :
                                             (m.status?.toLowerCase() === 'disputed' || m.status?.toLowerCase() === 'dispute') ? "bg-rose-500 shadow-rose-200 animate-pulse" : "bg-slate-300"
                                       )} />

                                       <div className={cn(
                                          "group relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border bg-white p-5 md:p-10 transition-all hover:shadow-2xl hover:shadow-indigo-500/5",
                                          (m.status?.toLowerCase() === 'disputed' || m.status?.toLowerCase() === 'dispute') ? "border-rose-200 shadow-rose-50/50" :
                                          m.status === 'submitted' ? "border-sky-100 bg-sky-50/10" : "border-slate-100"
                                       )}>
                                          {/* Dispute Panel inline */}
                                          {(() => {
                                             const dispute = getDisputeForMilestone(m.id);
                                             if (!dispute) return null;
                                             const isActive = dispute.status !== "RESOLVED" && dispute.status !== "REJECTED";
                                             return (
                                                <motion.div
                                                   initial={{ opacity: 0, height: 0 }}
                                                   animate={{ opacity: 1, height: "auto" }}
                                                   className="mb-8 rounded-2xl overflow-hidden border border-rose-200 relative z-50 shadow-sm"
                                                >
                                                   <div className="flex items-center gap-3 px-5 py-3 bg-rose-500 text-white">
                                                      <AlertCircle className="h-4 w-4" />
                                                      <span className="text-[10px] font-black uppercase tracking-widest">Active Dispute Panel</span>
                                                      <span className={cn(
                                                         "ml-auto px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                         getDisputeStatusColor(dispute.status)
                                                      )}>
                                                         {dispute.status?.replace(/_/g, " ")}
                                                      </span>
                                                   </div>
                                                   <div className="p-6 bg-rose-50/40 space-y-5">
                                                      <div>
                                                         <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Dispute Reason</p>
                                                         <p className="text-sm font-bold text-rose-900 italic bg-white/80 p-4 rounded-xl border border-rose-100 shadow-inner">
                                                            "{dispute.reason}"
                                                         </p>
                                                      </div>
                                                      {isActive && (
                                                         <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                            <button
                                                               onClick={() => handleResolveDispute(dispute.id, "RESOLVED")}
                                                               disabled={resolvingDisputeId === dispute.id}
                                                               className="flex-1 h-12 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                            >
                                                               {resolvingDisputeId === dispute.id ? (
                                                                  <><Loader2 className="h-4 w-4 animate-spin" /> BROADCASTING...</>
                                                               ) : (
                                                                  <><CheckCircle2 className="h-4 w-4" /> Mark as Resolved</>
                                                               )}
                                                            </button>
                                                            <button
                                                               onClick={() => handleResolveDispute(dispute.id, "REJECTED")}
                                                               disabled={resolvingDisputeId === dispute.id}
                                                               className="flex-1 h-12 rounded-xl bg-white border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                            >
                                                               <RotateCcw className="h-4 w-4" /> Reset Phase
                                                            </button>
                                                         </div>
                                                      )}
                                                      {dispute.status === "RESOLVED" && (
                                                         <div className="flex items-center gap-3 text-emerald-600 text-xs font-black bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                               <CheckCircle2 className="h-4 w-4" />
                                                            </div>
                                                            Dispute Resolved. Stakeholders can now proceed with the next actions.
                                                         </div>
                                                      )}
                                                   </div>
                                                </motion.div>
                                             );
                                          })()}
                                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 md:gap-8">
                                             <div className="space-y-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 0{i + 1}</span>
                                                   <span className={cn(
                                                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                      getStatusColor(m.status)
                                                   )}>
                                                      {(m.status?.toLowerCase() === "submitted" || m.githubLink) ? "Pending Approval" : m.status}
                                                   </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 uppercase group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                                                <p className="text-sm font-bold text-slate-500 max-w-xl leading-relaxed">{m.description}</p>

                                                {/* High-Performance Submission Evidence Display */}
                                                {(m.status?.toLowerCase() === "submitted" || m.status?.toLowerCase() === "approved" || m.status?.toLowerCase() === "completed" || m.githubLink) && (
                                                   <div className="pt-6 space-y-6">
                                                      <div className="flex flex-wrap gap-4 items-center">
                                                         {m.githubLink ? (
                                                            <a href={m.githubLink.startsWith('http') ? m.githubLink : `https://${m.githubLink}`}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-slate-800 group/link"
                                                            >
                                                               <GithubIcon className="h-4 w-4 group-hover/link:rotate-12 transition-transform" />
                                                               GitHub Repo
                                                            </a>
                                                         ) : (
                                                            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                               <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                               No GitHub link
                                                            </div>
                                                         )}

                                                         {m.demoLink ? (
                                                            <a href={m.demoLink.startsWith('http') ? m.demoLink : `https://${m.demoLink}`}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black shadow-xl shadow-indigo-600/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-indigo-500 group/link"
                                                            >
                                                               <Globe className="h-4 w-4 group-hover/link:animate-spin-slow" />
                                                               Live Demo
                                                            </a>
                                                         ) : (
                                                            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                               <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                               No demo link
                                                            </div>
                                                         )}

                                                         {m.status?.toLowerCase() === "submitted" && !aiFeedback[m.id] && (
                                                            <div className="relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest shadow-sm shadow-amber-500/5 group/review">
                                                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                                               <Activity className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
                                                               Awaiting Review
                                                            </div>
                                                         )}
                                                      </div>
 
                                                      {/* Freelancer Submission Notes */}
                                                      {m.submissionNotes && (
                                                         <div className="relative p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-inner group/notes overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/20 group-hover/notes:bg-indigo-500 transition-colors" />
                                                            <div className="flex items-center gap-3 mb-3">
                                                               <div className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                                                  <MessageSquare className="h-3 w-3 text-slate-400" />
                                                               </div>
                                                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Note</span>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic pr-4">
                                                               "{m.submissionNotes}"
                                                            </p>
                                                            <AnimatePresence>
                                                               {aiFeedback[m.id] && (
                                                                  <motion.div
                                                                     initial={{ opacity: 0, height: 0 }}
                                                                     animate={{ opacity: 1, height: "auto" }}
                                                                     className={cn(
                                                                        "p-5 rounded-2xl relative overflow-hidden mt-4",
                                                                        aiFeedback[m.id].approved
                                                                           ? "bg-indigo-50 border border-indigo-100"
                                                                           : "bg-rose-50 border border-rose-100"
                                                                     )}
                                                                  >
                                                                     <div className={cn("absolute top-0 right-0 h-24 w-24 blur-2xl", aiFeedback[m.id].approved ? "bg-indigo-500/10" : "bg-rose-500/10")} />
                                                                     <div className="relative z-10 flex items-start gap-4">
                                                                        <div className={cn("h-10 w-10 rounded-xl text-white flex flex-col items-center justify-center font-black", aiFeedback[m.id].approved ? "bg-indigo-500" : "bg-rose-500")}>
                                                                           <span className="text-[8px] uppercase opacity-80">IQ</span>
                                                                           <span className="text-sm">{aiFeedback[m.id].score}</span>
                                                                        </div>
                                                                        <div>
                                                                           <h5 className={cn("text-[10px] font-black uppercase flex items-center gap-2", aiFeedback[m.id].approved ? "text-indigo-900" : "text-rose-900")}>
                                                                              <Sparkles className="h-3 w-3" /> {aiFeedback[m.id].approved ? "AI Approved" : "AI Rejected"} — {aiFeedback[m.id].aiApproval}
                                                                           </h5>
                                                                           <p className={cn("text-xs font-bold mt-1 leading-relaxed", aiFeedback[m.id].approved ? "text-indigo-700/80" : "text-rose-700/80")}>{aiFeedback[m.id].message}</p>
                                                                        </div>
                                                                     </div>
                                                                  </motion.div>
                                                               )}
                                                            </AnimatePresence>
                                                         </div>
                                                      )}
                                                   </div>
                                                )}
                                             </div>

                                             <div className="flex flex-col items-start md:items-end gap-3 w-full lg:min-w-[240px] lg:border-l lg:border-slate-100 lg:pl-8">
                                                <div className="text-left md:text-right w-full bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col items-start md:items-end gap-1">
                                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pb-1">Milestone Value</span>
                                                   <span className="text-3xl font-black text-slate-950">
                                                      {typeof m.amount === 'number' ? `${m.amount.toLocaleString()} ALGO` : m.amount}
                                                   </span>
                                                   {m.percentage !== undefined && m.percentage > 0 && (
                                                      <div className="mt-1 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 w-fit">
                                                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{m.percentage}% of Project</span>
                                                      </div>
                                                   )}
                                                </div>

                                                {(() => {
                                                   const dispute = getDisputeForMilestone(m.id);
                                                   const hasActiveDispute = dispute && dispute.status !== "RESOLVED" && dispute.status !== "REJECTED";
                                                   const isSubmitted = m.status?.toLowerCase() === "submitted" || !!m.githubLink;

                                                   // We allow buttons even if there's an active dispute so the client can approve/evaluate re-submissions
                                                   return (
                                                      <div className="w-full space-y-3 pt-2">
                                                         {isSubmitted && (
                                                            <>
                                                               {/* Approval / Payment Release Action */}
                                                               {!m.txnHash && (
                                                                  <button
                                                                     onClick={() => handleApproveMilestone(m.id)}
                                                                     disabled={releasingMilestoneId !== null}
                                                                     className={cn(
                                                                        "w-full h-14 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50",
                                                                        (!aiFeedback[m.id] || aiFeedback[m.id].approved) ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-900 shadow-slate-200"
                                                                     )}
                                                                  >
                                                                     {releasingMilestoneId === m.id ? (
                                                                        <><Loader2 className="h-5 w-5 animate-spin" /> Releasing...</>
                                                                     ) : (
                                                                        <><CheckCircle2 className="h-5 w-5" /> Release Payment</>
                                                                     )}
                                                                  </button>
                                                               )}

                                                               {/* AI Evaluation Action */}
                                                               {!aiFeedback[m.id] ? (
                                                                  <div className="grid grid-cols-1 gap-2">
                                                                     <button
                                                                        onClick={() => handleAIEvaluation(m.id)}
                                                                        disabled={evaluatingId === m.id}
                                                                        className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                                                     >
                                                                        {evaluatingId === m.id ? (
                                                                           <><Loader2 className="w-4 h-4 animate-spin" /> {getEvaluationMessage()}</>
                                                                        ) : (
                                                                           <><Sparkles className="w-4 h-4 text-amber-400" /> Evaluate with AI</>
                                                                        )}
                                                                     </button>
                                                                  </div>
                                                               ) : (
                                                                  <div className={cn(
                                                                     "p-4 rounded-2xl flex items-center justify-between",
                                                                     aiFeedback[m.id].approved
                                                                        ? "bg-emerald-50 border border-emerald-100"
                                                                        : "bg-rose-50 border border-rose-100"
                                                                  )}>
                                                                     <span className={cn(
                                                                        "text-[10px] font-black uppercase tracking-widest",
                                                                        aiFeedback[m.id].approved ? "text-emerald-600" : "text-rose-600"
                                                                     )}>
                                                                        {aiFeedback[m.id].approved ? "AI Approved" : "AI Rejected"} — Score
                                                                     </span>
                                                                     <span className={cn(
                                                                        "text-xl font-black",
                                                                        aiFeedback[m.id].approved ? "text-emerald-700" : "text-rose-700"
                                                                     )}>
                                                                        {aiFeedback[m.id].score}%
                                                                     </span>
                                                                  </div>
                                                               )}
                                                            </>
                                                         )}

                                                         {/* Raise Dispute (Always available if not already completed/TX hashed, and even if not submitted) */}
                                                         {!m.txnHash && m.status?.toLowerCase() !== "completed" && m.status?.toLowerCase() !== "approved" && (
                                                            <button
                                                               onClick={() => handleDisputeClick(m.id)}
                                                               className="w-full h-12 rounded-2xl bg-white border border-rose-200 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                            >
                                                               <AlertCircle className="h-4 w-4" /> Raise Dispute
                                                            </button>
                                                         )}
                                                      </div>
                                                   );
                                                })()}



                                                {m.status?.toLowerCase() === "approved" && !m.txnHash && (
                                                   <div className="w-full pt-2">
                                                      <button
                                                         onClick={() => handleReleasePayment(m.id)}
                                                         disabled={releasingMilestoneId !== null}
                                                         className="w-full h-16 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                                                      >
                                                         {releasingMilestoneId === m.id ? (
                                                            <><Loader2 className="h-5 w-5 animate-spin" /> Releasing...</>
                                                         ) : (
                                                            <><Wallet className="h-5 w-5" /> Release Escrow Funds</>
                                                         )}
                                                      </button>
                                                   </div>
                                                )}

                                                {(m.status?.toLowerCase() === "completed" || !!m.txnHash) && (
                                                   <div className="w-full pt-2 flex items-center justify-center gap-3 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] text-xs font-black uppercase tracking-widest border border-emerald-100">
                                                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                         <CheckCircle2 className="h-5 w-5" />
                                                      </div>
                                                      Payment Settled
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    </motion.div>
                                 ))}
                              </div>
                           </>
                        )}
                     </motion.div>
                  )}

                  {/* TAB 3: APPLICANTS */}
                  {activeTab === "applicants" && (
                     <motion.div
                        key="applicants-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full flex flex-col gap-6"
                     >
                        {isLoadingApplicants ? (
                           <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                              <p className="text-sm font-bold text-slate-500">Retrieving applicants from the ledger...</p>
                           </div>
                        ) : applicants.length === 0 ? (
                           <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                              <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300">
                                 <User className="h-10 w-10" />
                              </div>
                              <div className="space-y-2">
                                 <h3 className="text-xl font-black text-slate-900">No Applicants Yet</h3>
                                 <p className="text-sm font-bold text-slate-500 max-w-[280px]">Proposals will appear here once freelancers apply to your project.</p>
                              </div>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {applicants.map((app) => (
                                 <div key={app.id} className="rounded-2xl md:rounded-3xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                                    <div className="space-y-6">
                                       <div className="flex items-start justify-between">
                                          <div className="flex gap-4 items-center">
                                             <div>
                                                <h4 className="text-xl font-black text-slate-900">{app.name}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Freelancer Candidate</span>
                                             </div>
                                          </div>
                                          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                             {app.status || "Applied"}
                                          </span>
                                       </div>
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                                             <Mail className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate">{app.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                                             <Phone className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate">{app.mobileNumber}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                                             <LinkIcon className="h-3 w-3 text-slate-400 shrink-0" /> <a href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors truncate">LinkedIn</a>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                                             <Globe className="h-3 w-3 text-slate-400 shrink-0" /> <a href={app.github.startsWith('http') ? app.github : `https://${app.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors truncate">GitHub</a>
                                          </div>
                                       </div>
                                       <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100/50 relative mt-4">
                                          <MessageSquare className="absolute top-3 right-3 text-slate-200 h-8 w-8" />
                                          <p className="text-sm font-bold text-slate-600 relative z-10 leading-relaxed italic">"{app.proposal}"</p>
                                       </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                       {(assignedFreelancer?.name === app.name || app.status?.toUpperCase() === "ASSIGNED") ? (
                                          <button
                                             onClick={() => handleKickFreelancer(app.id)}
                                             disabled={unassigningId === app.id}
                                             className="w-full h-12 rounded-xl bg-white border border-rose-200 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                          >
                                             {unassigningId === app.id ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
                                             ) : (
                                                <><UserMinus className="h-4 w-4" /> Remove Assigned Freelancer</>
                                             )}
                                          </button>
                                       ) : app.status?.toUpperCase() === "PENDING" ? (
                                          <button
                                             onClick={() => handleAssignFreelancer(app)}
                                             disabled={assigningId === app.id}
                                             className="w-full h-12 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2 disabled:opacity-50"
                                          >
                                             {assigningId === app.id ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Assigning...</>
                                             ) : (
                                                <><BadgeCheck className="h-4 w-4" /> Assign Freelancer</>
                                             )}
                                          </button>
                                       ) : (
                                          <div className="w-full h-12 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                             {app.status || "Applied"}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </motion.div>

         <DisputeModal
            isOpen={isDisputeModalOpen}
            onClose={() => setIsDisputeModalOpen(false)}
            onSubmit={handleDisputeSubmit}
            milestoneTitle={milestones.find(m => m.id === disputingId)?.title || ""}
         />
      </div>
   );
}