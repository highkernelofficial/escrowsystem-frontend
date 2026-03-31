"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, AlertTriangle, Send, 
  CheckCircle2, Loader2, Gavel, 
  MessageSquare, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  milestoneTitle: string;
}

export function DisputeModal({ isOpen, onClose, onSubmit, milestoneTitle }: DisputeModalProps) {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for the dispute.");
      return;
    }
    setError("");
    setStep("submitting");
    
    // Simulate API delay
    setTimeout(() => {
      onSubmit(reason);
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset state after toast/animation
    setTimeout(() => {
      setStep("form");
      setReason("");
      setError("");
    }, 300);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  } as const;

  const overlayVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 }
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-lg overflow-hidden rounded-[3rem] bg-white shadow-2xl ring-1 ring-slate-200"
          >
            {/* Header / Background Accent */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 opacity-5" />
            
            <div className="absolute top-8 right-8 z-20">
               <button 
                  onClick={handleClose}
                  className="group h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
               >
                  <X className="h-5 w-5" />
               </button>
            </div>

            <div className="relative z-10 p-8 md:p-10">
               <AnimatePresence mode="wait">
                 {step === "form" ? (
                   <motion.div
                     key="dispute-form"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="space-y-8"
                   >
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-600">
                           <ShieldAlert className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Milestone Dispute</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                           Open a Dispute
                        </h2>
                        <p className="text-sm font-bold text-slate-500">
                           You are disputing: <span className="text-slate-900">{milestoneTitle}</span>
                        </p>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center px-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Dispute</label>
                              {error && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">{error}</span>}
                           </div>
                           <div className="relative group">
                              <MessageSquare className="absolute left-6 top-6 h-5 w-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                              <textarea 
                                 name="reason"
                                 required
                                 rows={5}
                                 value={reason}
                                 onChange={(e) => {
                                   setReason(e.target.value);
                                   if (error) setError("");
                                 }}
                                 placeholder="Explain clearly why this milestone work does not meet the requirements..."
                                 className={cn(
                                   "w-full pl-16 pr-6 py-6 rounded-[2rem] bg-slate-50/50 border focus:bg-white text-slate-950 font-bold transition-all outline-none resize-none",
                                   error ? "border-rose-200 ring-4 ring-rose-500/10" : "border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                 )}
                              />
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 px-4">
                              Note: This will pause payment and notify our arbitration team.
                           </p>
                        </div>

                        <div className="flex gap-4">
                           <button 
                              type="button"
                              onClick={handleClose}
                              className="flex-1 h-16 rounded-2xl bg-white border border-slate-200 text-slate-500 font-extrabold hover:bg-slate-50 transition-all border-b-4 active:border-b-0 active:translate-y-1"
                           >
                              Cancel
                           </button>
                           <button 
                              type="submit"
                              className="flex-[2] h-16 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold shadow-xl hover:scale-[1.02] active:scale-95 transition-all shadow-rose-200"
                           >
                              Raise Dispute
                              <Gavel className="h-5 w-5" />
                           </button>
                        </div>
                     </form>
                   </motion.div>
                 ) : step === "submitting" ? (
                   <motion.div
                     key="submitting-state"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                   >
                     <div className="relative">
                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                        <Loader2 className="h-16 w-16 text-rose-500 animate-spin relative z-10" />
                     </div>
                     <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Initiating Arbitration</h2>
                     <p className="text-sm font-bold text-slate-500 max-w-[240px]">We're logging your request and notifying the involved parties.</p>
                   </motion.div>
                 ) : (
                   <motion.div
                     key="success-state"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                   >
                     <div className="h-24 w-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-50">
                        <AlertTriangle className="h-12 w-12" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dispute Raised</h2>
                        <p className="text-base font-bold text-slate-500 max-w-xs mx-auto">
                           The milestone has been placed in dispute. Our team will review the submission and logs within 24-48 hours.
                        </p>
                     </div>
                     <button 
                        onClick={handleClose}
                        className="mt-4 px-12 h-14 rounded-2xl bg-slate-900 text-white font-extrabold hover:scale-105 active:scale-95 transition-all shadow-xl"
                     >
                        Close
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
