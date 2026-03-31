"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Lock, BadgeCheck, Clock, CheckCircle2, 
  AlertCircle, RotateCcw, Wallet, Trophy, User, 
  ChevronRight, ExternalLink, MessageSquare, Briefcase, 
  Layers, Code2, Sparkles, TrendingUp, ShieldCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationModal } from "@/components/ApplicationModal";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import type { Project, Milestone, Freelancer, MilestoneStatus } from "@/lib/mockData";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  isOwner?: boolean; // Simulate role-based UI
}

export function ProjectDetails({ project, onBack, isOwner = false }: ProjectDetailsProps) {
  const { 
    isConnected, 
    isLoading, 
    connectWallet 
  } = useWalletAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  // Simple calculation for progress bar
  const approvedMilestones = project.milestones.filter(m => m.status === "approved").length;
  const progressPercent = Math.round((approvedMilestones / project.milestones.length) * 100);

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10";
      case "submitted": return "bg-sky-50 text-sky-600 border-sky-100 ring-sky-500/10";
      case "pending": return "bg-slate-50 text-slate-400 border-slate-100 ring-slate-500/10";
      case "dispute": return "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10";
      case "reassigned": return "bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "submitted": return <BadgeCheck className="h-3.5 w-3.5" />;
      case "pending": return <Clock className="h-3.5 w-3.5" />;
      case "dispute": return <AlertCircle className="h-3.5 w-3.5" />;
      case "reassigned": return <RotateCcw className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
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
    <motion.div
      variants={containerVariants}
      initial={false}
      animate="show"
      className="mx-auto max-w-5xl space-y-8 pb-20 px-4"
    >
      {/* Top Navigation */}
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="group flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 transition-colors"
      >
        <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-400 group-hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Marketplace
      </motion.button>

      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="relative rounded-[3rem] bg-white p-1 shadow-2xl shadow-slate-200/50 overflow-hidden group">
        {/* Gradient Border Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-sky-400 to-emerald-400 opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
        
        <div className="relative rounded-[2.8rem] bg-white p-8 md:p-12 overflow-hidden">
          {/* Abstract Background Accents */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl" />
          <div className="absolute top-1/2 -left-24 h-48 w-48 rounded-full bg-emerald-50/50 blur-3xl -translate-y-1/2" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    project.status === "open" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    project.status === "assigned" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {project.status}
                  </span>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <Lock className="h-3 w-3" />
                    Funds Locked in Escrow
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
                  {project.title}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-2 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] min-w-[180px] shadow-sm">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Budget</span>
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-200">A</div>
                    <span className="text-3xl font-black text-slate-900">{project.budget}</span>
                 </div>
              </div>
            </div>

            {/* Progress Bar (at top of details as requested) */}
            <div className="space-y-3">
               <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Progress</p>
                  <p className="text-sm font-black text-slate-900">{approvedMilestones} of {project.milestones.length} Milestones Complete</p>
               </div>
               <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={false} 
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  />
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Project Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* DESCRIPTION */}
          <motion.section variants={itemVariants} className="rounded-[2.5rem] bg-white border border-slate-100 p-8 md:p-10 shadow-xl shadow-slate-100/50 space-y-6">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                  <Briefcase className="h-5 w-5" />
               </div>
               <h2 className="text-xl font-black text-slate-900">Project Overview</h2>
            </div>
            <p className="text-lg font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
            
            <div className="pt-6 space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> Tech Stack
               </h3>
               <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <motion.span 
                      key={tech} 
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={cn(
                        "px-4 py-2 rounded-2xl text-xs font-black border tracking-wide cursor-default shadow-sm",
                        i % 4 === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                        i % 4 === 1 ? "bg-sky-50 text-sky-600 border-sky-100" :
                        i % 4 === 2 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}
                    >
                      {tech}
                    </motion.span>
                  ))}
               </div>
            </div>

            <div className="pt-6 space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Expected Outcome
               </h3>
               <div className="rounded-2xl bg-indigo-50/30 border border-indigo-50 p-6">
                  <p className="text-base font-bold text-slate-700 italic">"{project.outcome}"</p>
               </div>
            </div>
          </motion.section>

          {/* MILESTONES */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                     <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Structured Milestones</h2>
               </div>
            </div>

            <div className="space-y-4 relative">
               <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100" />
               {project.milestones.map((m, i) => (
                 <motion.div
                   key={m.id}
                   variants={itemVariants}
                   whileHover={{ x: 10, transition: { duration: 0.2 } }}
                   className="relative group ml-4"
                 >
                    {/* Circle Dot */}
                    <div className={cn(
                      "absolute -left-6 top-8 h-4 w-4 rounded-full border-2 border-white shadow-md z-10",
                      m.status === "approved" ? "bg-emerald-500" : m.status === "pending" ? "bg-slate-300" : "bg-sky-500"
                    )} />
                    
                    <div className="ml-10 relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-100 group-hover:border-indigo-200 transition-all">
                       {/* Ghost Index Number */}
                       <div className="absolute -right-4 -bottom-6 text-8xl font-black text-slate-50 pointer-events-none select-none">
                          0{i + 1}
                       </div>
                       
                       <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 tracking-tighter">OCT {i + 1}</span>
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                  getStatusColor(m.status)
                                )}>
                                  {getStatusIcon(m.status)}
                                  {m.status}
                                </span>
                             </div>
                             <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{m.title}</h3>
                             <p className="text-sm font-bold text-slate-500 max-w-md">{m.description}</p>
                          </div>
                          <div className="flex flex-col md:items-end gap-1">
                             <span className="text-[10px] font-black uppercase text-slate-400">Release Amount</span>
                             <span className="text-xl font-black text-amber-600">{m.amount}</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
          </motion.section>
        </div>

        {/* RIGHT COLUMN: Actions & Stakeholders */}
        <div className="space-y-8">
           {/* ACTION CARD */}
           <motion.section variants={itemVariants} className="sticky top-28 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-indigo-200/40 overflow-hidden group">
              <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-8">
                 <div className="space-y-4">
                    <h2 className="text-2xl font-black">Ready to Start?</h2>
                    <p className="text-sm font-bold text-slate-400">Apply now to work on this premium protocol project.</p>
                 </div>

                 {/* PRIMARY ACTIONS */}
                 <div className="space-y-3 pt-4">
                    {!isConnected ? (
                      <button 
                        onClick={connectWallet}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 h-16 rounded-2xl font-extrabold shadow-xl transition-all outline-none ring-offset-2 bg-white text-slate-900 hover:scale-[1.02] active:scale-95 border-2 border-slate-700/10 hover:border-sky-400 group/connect"
                      >
                         {isLoading ? (
                           <>
                             <Loader2 className="h-5 w-5 animate-spin" />
                             <span>Connecting...</span>
                           </>
                         ) : (
                           <>
                             <Wallet className="h-5 w-5 text-sky-500 transition-transform group-hover/connect:rotate-12" />
                             <span>Connect Wallet to Apply</span>
                           </>
                         )}
                      </button>
                    ) : (
                      <button 
                        onClick={() => project.status === "open" && setIsApplyModalOpen(true)}
                        disabled={project.status !== "open"}
                        className={cn(
                          "w-full flex items-center justify-center gap-3 h-16 rounded-2xl font-extrabold shadow-xl transition-all outline-none ring-offset-2",
                          project.status === "open" 
                            ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:scale-[1.02] active:scale-95 focus:ring-4 focus:ring-indigo-500/20" 
                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        )}
                      >
                         {project.status === "open" ? "Apply for Project" : "Applications Closed"}
                         {project.status === "open" ? <ChevronRight className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </button>
                    )}
                 </div>

                 <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-5 w-5 text-emerald-400" />
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Escrow Verified</p>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                 </div>
              </div>
           </motion.section>


        </div>
      </div>

      <ApplicationModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        projectTitle={project.title} 
      />
    </motion.div>
  );
}
