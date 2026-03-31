"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Link as LinkIcon, Send, 
  CheckCircle2, Sparkles, Loader2, Globe, Phone
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);
import { cn } from "@/lib/utils";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export function ApplicationModal({ isOpen, onClose, projectTitle }: ApplicationModalProps) {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    linkedin: "",
    github: "",
    proposal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("submitting");
    // Simulate API call
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-xl overflow-hidden rounded-[3rem] bg-white shadow-2xl ring-1 ring-slate-200"
          >
            {/* Header / Background Accent */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 opacity-5" />
            <div className="absolute top-8 right-8 z-20">
               <button 
                  onClick={onClose}
                  className="group h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
               >
                  <X className="h-5 w-5" />
               </button>
            </div>

            <div className="relative z-10 p-8 md:p-10">
               <AnimatePresence mode="wait">
                 {step === "form" ? (
                   <motion.div
                     key="application-form"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="space-y-8"
                   >
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                           <Sparkles className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Apply To Project</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                           Submit Your Proposal
                        </h2>
                        <p className="text-sm font-bold text-slate-500">
                           Applying for: <span className="text-slate-900">{projectTitle}</span>
                        </p>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           {/* Name */}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                              <div className="relative group">
                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                 <input 
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full h-14 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-950 font-bold transition-all outline-none"
                                 />
                              </div>
                           </div>

                           {/* Email */}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                              <div className="relative group">
                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                 <input 
                                    name="email"
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className="w-full h-14 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 text-slate-950 font-bold transition-all outline-none"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mobile Number</label>
                           <div className="relative group">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                              <input 
                                 name="mobile"
                                 required
                                 type="tel"
                                 value={formData.mobile}
                                 onChange={handleChange}
                                 placeholder="+91 98765 43210"
                                 className="w-full h-14 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-950 font-bold transition-all outline-none"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           {/* LinkedIn */}
                           <div className="relative group">
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                              <input 
                                 name="linkedin"
                                 required
                                 value={formData.linkedin}
                                 onChange={handleChange}
                                 placeholder="LinkedIn Profile URL"
                                 className="w-full h-14 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-950 font-bold transition-all outline-none"
                              />
                           </div>

                           {/* GitHub */}
                           <div className="relative group">
                              <GithubIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                              <input 
                                 name="github"
                                 required
                                 value={formData.github}
                                 onChange={handleChange}
                                 placeholder="GitHub Profile URL"
                                 className="w-full h-14 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-950 font-bold transition-all outline-none"
                              />
                           </div>
                        </div>

                        {/* Proposal */}
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Why you're a good fit</label>
                           <textarea 
                              name="proposal"
                              required
                              rows={4}
                              value={formData.proposal}
                              onChange={handleChange}
                              placeholder="Briefly describe your approach and experience..."
                              className="w-full p-6 rounded-[2rem] bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-950 font-bold transition-all outline-none resize-none"
                           />
                        </div>

                        <button 
                           type="submit"
                           className="w-full h-16 mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-extrabold shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           Submit Proposal
                           <Send className="h-5 w-5" />
                        </button>
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
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                        <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative z-10" />
                     </div>
                     <h2 className="text-2xl font-black text-slate-900">Broadcasting to Orbit...</h2>
                     <p className="text-sm font-bold text-slate-500 max-w-[240px]">We're securely submitting your proposal to the project client.</p>
                   </motion.div>
                 ) : (
                   <motion.div
                     key="success-state"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                   >
                     <div className="h-24 w-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-50">
                        <CheckCircle2 className="h-12 w-12" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Proposal Sent!</h2>
                        <p className="text-base font-bold text-slate-500 max-w-xs mx-auto">
                           Your application has been successfully submitted. You'll hear back from the client soon!
                        </p>
                     </div>
                     <button 
                        onClick={onClose}
                        className="mt-4 px-10 h-14 rounded-2xl bg-slate-900 text-white font-extrabold hover:scale-105 active:scale-95 transition-all shadow-xl"
                     >
                        Done
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
