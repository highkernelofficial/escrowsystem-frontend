"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Lock, BadgeCheck, Clock, CheckCircle2, 
  AlertCircle, RotateCcw, Wallet, Trophy, User, 
  ChevronRight, ExternalLink, MessageSquare, Briefcase, 
  Layers, Code2, Sparkles, TrendingUp, ShieldCheck,
  Send, Loader2, Globe, Link as LinkIcon,
  Terminal, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, Milestone, MilestoneStatus } from "@/lib/mockData";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

interface MyWorkDetailsProps {
  project: Project;
  onBack: () => void;
}

export function MyWorkDetails({ project, onBack }: MyWorkDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "milestones">("milestones");
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const approvedMilestones = milestones.filter(m => m.status === "approved" || m.status === "completed").length;
  const progressPercent = Math.round((approvedMilestones / milestones.length) * 100);

  const handleMilestoneSubmit = (milestoneId: string) => {
    const link = submissionLinks[milestoneId];
    if (!link || !link.trim()) {
      addToast("Please provide a GitHub link", "error");
      return;
    }

    setSubmittingId(milestoneId);
    // Simulate Blockchain Submission
    setTimeout(() => {
      setMilestones(prev => 
        prev.map(m => m.id === milestoneId ? { ...m, status: "submitted", githubLink: link } : m)
      );
      setSubmittingId(null);
      addToast("Milestone Evidence Submitted!");
    }, 2000);
  };

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case "completed":
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10";
      case "submitted": return "bg-sky-50 text-sky-600 border-sky-100 ring-sky-500/10";
      case "pending": return "bg-slate-50 text-slate-400 border-slate-100 ring-slate-500/10";
      case "dispute": return "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 25 } }
  } as const;

  return (
    <div className="relative">
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
                toast.type === "success" ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"
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
        className="mx-auto max-w-5xl space-y-8 pb-32 px-4"
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
        <motion.div variants={itemVariants} className="relative rounded-[3rem] bg-white p-1 shadow-2xl shadow-slate-200/50 overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 opacity-20" />
           <div className="relative rounded-[2.8rem] bg-white p-8 md:p-12 overflow-hidden">
              <div className="relative z-10 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center gap-3">
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-800 flex items-center gap-2">
                             <Briefcase className="h-3 w-3" />
                             Work Space
                          </span>
                          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                             <ShieldCheck className="h-3 w-3" />
                             Escrow Verified
                          </div>
                       </div>
                       <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight uppercase">
                          {project.title}
                       </h1>
                    </div>
                    <div className="flex flex-col items-end gap-2 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] min-w-[180px] shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Value</span>
                       <span className="text-3xl font-black text-indigo-600">{project.budget}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall Progress</p>
                       <p className="text-sm font-black text-slate-900">{approvedMilestones} of {milestones.length} Step{milestones.length > 1 ? 's' : ''} Completed</p>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                       <motion.div
                          key={progressPercent}
                          initial={false}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-3xl w-fit">
           <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                 "px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                 activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              Overview
           </button>
           <button
              onClick={() => setActiveTab("milestones")}
              className={cn(
                 "px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                 activeTab === "milestones" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              Milestone Timeline
           </button>
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[500px]">
           <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                 <motion.div
                    key="overview-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                 >
                    <div className="lg:col-span-2 space-y-6">
                       <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm space-y-8">
                          <div className="space-y-4">
                             <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <Briefcase className="h-5 w-5 text-indigo-500" /> Project Scope
                             </h3>
                             <p className="text-slate-600 leading-relaxed font-bold bg-slate-50/50 p-6 rounded-3xl border border-slate-100">{project.description}</p>
                          </div>

                          <div className="pt-6 border-t border-slate-100">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" /> Goal & Outcome
                             </h4>
                             <p className="text-slate-800 font-bold italic">"{project.outcome}"</p>
                          </div>

                          <div className="pt-6 border-t border-slate-100">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Code2 className="h-4 w-4 text-indigo-500" /> Technology Stack
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {project.techStack.map(tech => (
                                   <span key={tech} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100 uppercase tracking-widest shadow-sm">
                                      {tech}
                                   </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Escrow Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</span>
                                    <span className="font-black text-slate-900 text-xs">Milestone-Based</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status</span>
                                    <span className="font-black text-emerald-700 text-xs flex items-center gap-1 uppercase"><Lock className="w-3 h-3" /> Locked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === "milestones" && (
                 <motion.div
                    key="milestones-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12 pb-20"
                 >
                    <div className="flex items-center justify-between px-2">
                       <h2 className="text-2xl font-black text-slate-900 uppercase flex items-center gap-3">
                          <Activity className="h-6 w-6 text-indigo-500" /> Execution Timeline
                       </h2>
                    </div>

                    <div className="relative space-y-12">
                       {/* Timeline vertical line */}
                       <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100/80 rounded-full" />

                       {milestones.map((m, i) => (
                          <motion.div
                             key={m.id}
                             variants={itemVariants}
                             className="relative pl-24 group"
                          >
                             {/* Node Indicator */}
                             <div className={cn(
                                "absolute left-8 top-10 h-5 w-5 rounded-full border-4 border-white shadow-xl z-10 transition-colors duration-500",
                                m.status === 'completed' || m.status === 'approved' ? "bg-emerald-500" :
                                m.status === 'submitted' ? "bg-sky-500 animate-pulse" : "bg-slate-300"
                             )} />

                             {/* Milestone Card */}
                             <div className={cn(
                                "rounded-[2.5rem] border bg-white p-8 md:p-10 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden relative",
                                m.status === 'pending' ? "border-indigo-100" : "border-slate-100 grayscale hover:grayscale-0 transition-all duration-700"
                             )}>
                                {/* Glass Backdrop Accent */}
                                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/[0.02] rounded-full blur-3xl -z-0" />
                                
                                <div className="relative z-10 space-y-6">
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div className="space-y-2">
                                         <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Step {i + 1}</span>
                                            <span className={cn(
                                               "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                               getStatusColor(m.status)
                                            )}>
                                               {m.status}
                                            </span>
                                         </div>
                                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors underline decoration-indigo-500/0 decoration-2 underline-offset-4 group-hover:decoration-indigo-500/100">
                                            {m.title}
                                         </h3>
                                      </div>
                                      <div className="flex flex-col md:items-end">
                                         <span className="text-[10px] font-black uppercase text-slate-400">Release On Approval</span>
                                         <span className="text-2xl font-black text-emerald-600">{m.amount}</span>
                                      </div>
                                   </div>

                                   <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-2xl">{m.description}</p>

                                   {/* INTERACTIVE SUBMISSION PANEL (IF PENDING) */}
                                   {m.status === 'pending' && (
                                       <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
                                           <div className="relative flex-1 group">
                                               <GithubIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                               <input 
                                                   type="text"
                                                   value={submissionLinks[m.id] || ""}
                                                   onChange={(e) => setSubmissionLinks(prev => ({...prev, [m.id]: e.target.value}))}
                                                   placeholder="github.com/repository-url"
                                                   className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-900 text-slate-900 font-bold transition-all outline-none text-sm"
                                               />
                                           </div>
                                           <button 
                                               onClick={() => handleMilestoneSubmit(m.id)}
                                               disabled={submittingId === m.id}
                                               className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                           >
                                               {submittingId === m.id ? (
                                                  <><Loader2 className="h-4 w-4 animate-spin" /> BROADCASTING...</>
                                               ) : (
                                                  <><Terminal className="h-4 w-4" /> SUBMIT EVIDENCE</>
                                               )}
                                           </button>
                                       </div>
                                   )}

                                   {/* SUBMITTED VIEW */}
                                   {m.status === 'submitted' && (
                                      <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                         <div className="flex items-center gap-3 bg-sky-50 px-5 py-3 rounded-2xl border border-sky-100">
                                            <Globe className="h-4 w-4 text-sky-500" />
                                            <span className="text-[10px] font-black text-sky-700 truncate max-w-[250px]">{m.githubLink}</span>
                                         </div>
                                         <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                                            <AlertCircle className="h-3 w-3" /> Awaiting Arbitration
                                         </div>
                                      </div>
                                   )}

                                   {/* APPROVED / COMPLETED VIEW */}
                                   {(m.status === 'approved' || m.status === 'completed') && (
                                      <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                                         <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
                                            <Globe className="h-4 w-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-700">{m.githubLink}</span>
                                         </div>
                                         <div className="flex items-center gap-2 h-10 w-10 bg-emerald-100 rounded-full justify-center text-emerald-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                         </div>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </motion.div>
                       ))}

                       {/* END OF TIMELINE ACCENT */}
                       <div className="ml-[38px] h-10 w-1 bg-gradient-to-b from-slate-100/80 to-transparent rounded-full" />
                    </div>

                    <div className="mt-16 mx-auto max-w-3xl text-center space-y-4">
                       <div className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" /> Smart Contract Secured
                       </div>
                       <p className="text-sm font-bold text-slate-400 px-12">
                          Once all milestones are marked as completed, the remaining project funds and your reputation score will be automatically updated on the protocol ledger.
                       </p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
