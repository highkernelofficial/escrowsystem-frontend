"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   ArrowLeft, Lock, BadgeCheck, Clock, CheckCircle2,
   AlertCircle, RotateCcw, Wallet, Trophy, User,
   ChevronRight, ExternalLink, MessageSquare, Briefcase,
   Layers, Code2, Sparkles, TrendingUp, ShieldCheck,
   MoreVertical, ThumbsUp, ThumbsDown, UserMinus, Globe, Play, Loader2,
   Phone, Mail, Link as LinkIcon, Activity, Star, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DisputeModal } from "./DisputeModal";
import { buildUrl } from "@/config/api";
import type { Project, Milestone, MilestoneStatus, Freelancer } from "@/lib/mockData";

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
   const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "applicants">("overview");

   // Local state for the dynamic actions
   const [assignedFreelancer, setAssignedFreelancer] = useState<Freelancer | null>(project.assignedFreelancer || null);
   const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
   const [applicants, setApplicants] = useState<Applicant[]>([]);
   const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
   const [assigningId, setAssigningId] = useState<string | null>(null);
   const [unassigningId, setUnassigningId] = useState<string | null>(null);
   const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
   const [assignedAppId, setAssignedAppId] = useState<string | null>(null);
   const [aiFeedback, setAiFeedback] = useState<Record<string, { score: number, message: string }>>({});

   // Sync local state when project prop changes from the backend
   useEffect(() => {
    if (project) {
        setMilestones(project.milestones || []);
        if (project.assignedFreelancer) {
            setAssignedFreelancer(project.assignedFreelancer);
        }
        fetchApplicants();
    }
   }, [project]);

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

   // Toast State
   const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" | "error" }[]>([]);

   const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
         setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
   };

   const approvedMilestones = milestones.filter(m => m.status === "approved" || m.status === "completed").length;
   const progressPercent = Math.round((approvedMilestones / milestones.length) * 100);

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

   const handleAIEvaluation = (milestoneId: string) => {
      setEvaluatingId(milestoneId);
      // Simulate AI delay
      setTimeout(() => {
         setAiFeedback(prev => ({
            ...prev,
            [milestoneId]: {
               score: Math.floor(Math.random() * 6) + 94, // 94-99 score
               message: "Code meets all requirements. Clean architecture detected. Ready for approval."
            }
         }));
         setEvaluatingId(null);
         addToast("AI Evaluation Complete", "info");
      }, 3000);
   };

   const handleApproveMilestone = (milestoneId: string) => {
      setMilestones(prev =>
         prev.map(m => m.id === milestoneId ? { ...m, status: "completed" as MilestoneStatus } : m)
      );
      addToast("Milestone Approved & Payment Released!");
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

   const handleReleasePayment = (milestoneId: string) => {
      setMilestones(prev =>
         prev.map(m => m.id === milestoneId ? { ...m, status: "completed" as MilestoneStatus } : m)
      );
      addToast("Payment Released successfully to the freelancer!");
   };

   const getStatusColor = (status: string) => {
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
            className="mx-auto max-w-5xl space-y-8 pb-20 px-4"
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
                           <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
                              {project.title}
                           </h1>
                        </div>
                        <div className="flex flex-col items-end gap-2 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] min-w-[180px] shadow-sm">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Budget</span>
                           <span className="text-3xl font-black text-emerald-600">
                              {typeof project.budget === 'number' ? `${project.budget.toLocaleString()} ALGO` : project.budget}
                           </span>
                        </div>
                     </div>

                     {/* Global Progress Bar */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Milestone Progress</p>
                           <p className="text-sm font-black text-slate-900">{approvedMilestones} of {milestones.length} Completed</p>
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
                  Milestones
               </button>
               <button
                  onClick={() => setActiveTab("applicants")}
                  className={cn(
                     "px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 space-y-6">
                              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
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
                              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
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
                                 "relative overflow-hidden rounded-[2.5rem] border border-slate-100 p-8 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50",
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
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-slate-900 uppercase flex items-center gap-3">
                               <Activity className="h-6 w-6 text-indigo-500" /> Milestone Execution Roadmap
                            </h2>
                            <span className="text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100">
                               {milestones.length} Strategic Nodes
                            </span>
                        </div>

                        <div className="relative space-y-12">
                           {/* Timeline vertical line */}
                           <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

                           {milestones.map((m, i) => (
                              <motion.div
                                 key={m.id}
                                 initial={false}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 className="relative pl-24 group"
                              >
                                 {/* Node Indicator */}
                                 <div className={cn(
                                    "absolute left-8 h-5 w-5 rounded-full border-4 border-white shadow-xl z-20 transition-all duration-500 top-10",
                                    m.status === 'completed' || m.status === 'approved' ? "bg-emerald-500 shadow-emerald-200" :
                                    m.status === 'submitted' ? "bg-sky-500 shadow-sky-200 animate-pulse" : "bg-slate-300"
                                 )} />

                                 <div className={cn(
                                    "group relative overflow-hidden rounded-[2.5rem] border bg-white p-8 md:p-10 transition-all hover:shadow-2xl hover:shadow-indigo-500/5",
                                    m.status === 'submitted' ? "border-sky-100 bg-sky-50/10" : "border-slate-100"
                                 )}>
                                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
                                       <div className="space-y-4 flex-1">
                                          <div className="flex items-center gap-3">
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase 0{i + 1}</span>
                                             <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                getStatusColor(m.status)
                                             )}>
                                                {m.status === "submitted" ? "Pending Approval" : m.status}
                                             </span>
                                          </div>
                                          <h3 className="text-2xl font-black text-slate-900 uppercase group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                                          <p className="text-sm font-bold text-slate-500 max-w-xl leading-relaxed">{m.description}</p>

                                          {/* Evidence Link Display */}
                                          {(m.status === "submitted" || m.status === "approved" || m.status === "completed") && (
                                             <div className="pt-4 flex flex-wrap gap-4 items-center">
                                                {m.githubLink ? (
                                                   <a href={`https://${m.githubLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
                                                      <GithubIcon className="h-4 w-4" />
                                                      {m.githubLink}
                                                   </a>
                                                ) : (
                                                   <span className="text-xs font-bold text-slate-400 italic bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">No link provided</span>
                                                )}
                                                
                                                {m.status === "submitted" && (
                                                   <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                                                      <Activity className="h-3 w-3" /> Needs Review
                                                   </div>
                                                )}
                                             </div>
                                          )}

                                          {/* AI Feedback Display */}
                                          <AnimatePresence>
                                             {aiFeedback[m.id] && (
                                                <motion.div
                                                   initial={{ opacity: 0, height: 0 }}
                                                   animate={{ opacity: 1, height: "auto" }}
                                                   className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 relative overflow-hidden"
                                                >
                                                   <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/10 blur-2xl" />
                                                   <div className="relative z-10 flex items-start gap-4">
                                                      <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex flex-col items-center justify-center font-black">
                                                         <span className="text-[8px] uppercase opacity-80">IQ</span>
                                                         <span className="text-sm">{aiFeedback[m.id].score}</span>
                                                      </div>
                                                      <div>
                                                         <h5 className="text-[10px] font-black text-indigo-900 uppercase flex items-center gap-2">
                                                            <Sparkles className="h-3 w-3" /> AI Integrity Check Passed
                                                         </h5>
                                                         <p className="text-xs font-bold text-indigo-700/80 mt-1 leading-relaxed">{aiFeedback[m.id].message}</p>
                                                      </div>
                                                   </div>
                                                </motion.div>
                                             )}
                                          </AnimatePresence>
                                       </div>

                                       <div className="flex flex-col items-end gap-3 min-w-[240px] xl:border-l xl:border-slate-100 xl:pl-8">
                                          <div className="text-right w-full bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col items-end gap-1">
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

                                          {m.status === "submitted" && (
                                             <div className="w-full space-y-2 pt-2">
                                                <button
                                                   onClick={() => handleAIEvaluation(m.id)}
                                                   disabled={evaluatingId === m.id}
                                                   className="w-full h-12 rounded-2xl bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                   {evaluatingId === m.id ? (
                                                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Code...</>
                                                   ) : (
                                                      <><Sparkles className="w-4 h-4" /> Smart Code Audit</>
                                                   )}
                                                </button>
                                                <div className="grid grid-cols-1 gap-2">
                                                   <button
                                                      onClick={() => handleApproveMilestone(m.id)}
                                                      className="h-14 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
                                                   >
                                                      <CheckCircle2 className="h-5 w-5" /> Approve & Pay
                                                   </button>
                                                   <button
                                                      onClick={() => handleDisputeClick(m.id)}
                                                      className="h-12 rounded-2xl bg-white border border-rose-200 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                                   >
                                                      <AlertCircle className="h-4 w-4" /> Raise Dispute
                                                   </button>
                                                </div>
                                             </div>
                                          )}

                                          {m.status === "approved" && (
                                             <div className="w-full pt-2">
                                                <button
                                                   onClick={() => handleReleasePayment(m.id)}
                                                   className="w-full h-16 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                                                >
                                                   <Wallet className="h-5 w-5" /> Release Escrow Funds
                                                </button>
                                             </div>
                                          )}

                                          {m.status === "completed" && (
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
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {applicants.map((app) => (
                                 <div key={app.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
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
                                       <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
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
                                          <div className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
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
