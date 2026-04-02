"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus, X, Briefcase, Coins, Layers,
   ArrowRight, Loader2, Sparkles, Wand2, Calendar,
   Trash2, Edit3, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, MilestoneStatus } from "@/lib/mockData";
import { buildUrl } from "@/config/api";

interface Milestone {
   id: string;
   title: string;
   description: string;
   amount: string;
   percentage?: number;
}

interface CreatedProjectResponse {
   id: string | number;
   title?: string;
   description?: string;
   expectedOutcome?: string;
   techStack?: string[];
   totalAmount?: number;
   status?: string;
   milestones?: CreatedMilestoneResponse[];
}

interface CreatedMilestoneResponse {
   id?: string | number;
   projectId?: string | number;
   title?: string;
   description?: string;
   amount?: number;
   percentage?: number | string;
   status?: string;
}

interface PostProjectFormProps {
   onSuccess: (project: Project) => void;
   onCancel: () => void;
}

const MICRO_ALGOS_PER_ALGO = 1_000_000;

function toAlgoValue(algoValue: string | number): number {
   const value = typeof algoValue === "number" ? algoValue : Number(algoValue);
   if (!Number.isFinite(value) || value <= 0) return 0;
   return value;
}

function parseMilestoneInput(
   rawAmount: string,
   totalBudgetAlgo: number
): { amount: number; percentage: number } {
   const trimmed = (rawAmount || "").trim();

   // Supports:
   // "20% of Budget"
   // "20%"
   // "5"
   // "5.5"
   // Plain number is treated as ALGO amount
   const percentMatch = trimmed.match(/^(\d+(\.\d+)?)\s*%/);

   if (percentMatch) {
      const percentage = Number(percentMatch[1]);
      const amount = (totalBudgetAlgo * percentage) / 100;

      return {
         amount,
         percentage,
      };
   }

   const algoAmount = Number(trimmed);

   if (Number.isFinite(algoAmount) && algoAmount > 0) {
      const amount = toAlgoValue(algoAmount);
      const percentage =
         totalBudgetAlgo > 0
            ? Number(((amount / totalBudgetAlgo) * 100).toFixed(2))
            : 0;

      return {
         amount,
         percentage,
      };
   }

   throw new Error(`Invalid milestone amount format: "${rawAmount}"`);
}

export function PostProjectForm({ onSuccess, onCancel }: PostProjectFormProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isImprovingDesc, setIsImprovingDesc] = useState(false);
   const [isRefiningOutcome, setIsRefiningOutcome] = useState(false);
   const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

   const [formData, setFormData] = useState({
      title: "",
      description: "",
      outcome: "",
      budget: "",
   });

   const [techInput, setTechInput] = useState("");
   const [techStack, setTechStack] = useState<string[]>(["React", "Next.js", "ALGO SDK"]);
   const [milestones, setMilestones] = useState<Milestone[]>([]);

   const improveDescription = async () => {
      setIsImprovingDesc(true);
      await new Promise((r) => setTimeout(r, 1500));
      setFormData((prev) => ({
         ...prev,
         description:
            prev.description +
            "\n\n[AI ENHANCED]: This project aims to revolutionize user engagement by leveraging high-performance decentralized architecture, ensuring seamless scalability and enterprise-grade security for all participants.",
      }));
      setIsImprovingDesc(false);
   };

   const refineOutcome = async () => {
      setIsRefiningOutcome(true);
      await new Promise((r) => setTimeout(r, 1500));
      setFormData((prev) => ({
         ...prev,
         outcome:
            prev.outcome +
            "\n\n[AI REFINED]: A fully optimized, production-ready solution with 99.9% uptime, verified smart contracts on Algorand, and a comprehensive technical documentation suite.",
      }));
      setIsRefiningOutcome(false);
   };

   const generateProjectPlan = async () => {
      setIsGeneratingPlan(true);
      try {
         const token = localStorage.getItem("auth_token");
         if (!token) throw new Error("Please login to generate AI plan.");

         const totalAmountAlgo = toAlgoValue(formData.budget || "0");

         const previewPayload = {
            title: formData.title.trim() || "Untitled Project",
            description: formData.description.trim() || "No description provided.",
            techStack,
            expectedOutcome: formData.outcome.trim() || "No outcome defined.",
            status: "OPEN",
            appId: 0,
            totalAmount: totalAmountAlgo,
         };

         const response = await fetch(buildUrl("/api/projects/generate-milestones-preview"), {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(previewPayload),
         });

         if (!response.ok) {
            throw new Error(`Failed to generate milestones: ${response.status}`);
         }

         const data = await response.json();
         // The API likely returns an array of milestones or a project object with milestones
         const generatedMilestones: Milestone[] = (data.milestones || data || []).map((m: any, i: number) => ({
            id: m.id?.toString() || Math.random().toString(36).slice(2, 11),
            title: m.title || `Milestone ${i + 1}`,
            description: m.description || "",
            amount: m.amount?.toString() || "0",
            percentage: m.percentage || (m.amount && totalAmountAlgo > 0 ? Number(((m.amount / totalAmountAlgo) * 100).toFixed(2)) : 0)
         }));

         setMilestones(generatedMilestones);
      } catch (err: any) {
         console.error("Plan generation error:", err);
         alert(err.message || "Failed to generate AI plan.");
      } finally {
         setIsGeneratingPlan(false);
      }
   };

   const addMilestone = () => {
      const newId = Math.random().toString(36).slice(2, 11);
      setMilestones((prev) => [
         ...prev,
         {
            id: newId,
            title: "New Milestone",
            description: "Describe the goals...",
            amount: "10",
            percentage: 0
         },
      ]);
   };

   const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
      setMilestones((prev) =>
         prev.map((m) => {
            if (m.id !== id) return m;

            const updatedMilestone = { ...m, [field]: value };

            // Recalculate percentage if amount changes and budget is present
            if (field === "amount" && formData.budget) {
               try {
                  const totalBudgetAlgo = toAlgoValue(formData.budget);
                  if (totalBudgetAlgo > 0) {
                     const { percentage } = parseMilestoneInput(value, totalBudgetAlgo);
                     updatedMilestone.percentage = percentage;
                  }
               } catch (e) {
                  // Ignore invalid input during typing
                  console.warn("Invalid milestone amount:", value);
               }
            }

            return updatedMilestone;
         })
      );
   };

   const deleteMilestone = (id: string) => {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
   };

   const handleAddTech = (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const trimmed = techInput.trim();
      if (trimmed && !techStack.includes(trimmed)) {
         setTechStack((prev) => [...prev, trimmed]);
         setTechInput("");
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
         const token = localStorage.getItem("auth_token");

         if (!token) {
            throw new Error("Authentication token not found. Please login again.");
         }

         if (!formData.title.trim()) {
            throw new Error("Project title is required.");
         }

         if (!formData.description.trim()) {
            throw new Error("Project description is required.");
         }

         if (!formData.outcome.trim()) {
            throw new Error("Expected outcome is required.");
         }

         if (!formData.budget || Number(formData.budget) <= 0) {
            throw new Error("Please enter a valid budget.");
         }

         if (!milestones.length) {
            throw new Error("Please add at least one milestone.");
         }

         const totalAmountAlgo = toAlgoValue(formData.budget);

         const projectPayload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            techStack,
            expectedOutcome: formData.outcome.trim(),
            status: "OPEN",
            appId: 0,
            totalAmount: totalAmountAlgo,
            milestones: milestones.map(m => {
               const { amount, percentage } = parseMilestoneInput(m.amount, totalAmountAlgo);
               return {
                  title: m.title,
                  description: m.description,
                  amount: amount,
                  percentage: percentage,
               };
            }),
         };

         console.log("🚀 Confirming project creation...");
         console.log("Project payload:", JSON.stringify(projectPayload, null, 2));

         const projectResponse = await fetch(buildUrl("/api/projects/confirm-create"), {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "true",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(projectPayload),
         });

         if (!projectResponse.ok) {
            const errorText = await projectResponse.text().catch(
               () => "Unknown project creation error"
            );
            console.error("❌ Project confirmation failed:", projectResponse.status, errorText);

            if (projectResponse.status === 403) {
               throw new Error("403 Forbidden: Your session may have expired. Please login again.");
            }

            throw new Error(`Failed to create project: ${projectResponse.status} ${errorText}`);
         }

         const createdProject: CreatedProjectResponse = await projectResponse.json();

         // Use backend ID if available, otherwise fallback to a random ID
         const createdProjectId = createdProject?.id?.toString() || Math.random().toString(36).slice(2, 11);

         console.log("✅ Project confirmed and created:", createdProject);

         const newProject: Project = {
            id: createdProjectId,
            title: createdProject.title || formData.title,
            description: createdProject.description || formData.description,
            outcome: createdProject.expectedOutcome || formData.outcome,
            techStack: createdProject.techStack || techStack,
            budget: `${formData.budget} ALGO`,
            milestones: (createdProject.milestones || []).map((m: any) => ({
               id: m.id?.toString() || Math.random().toString(36).slice(2, 11),
               title: m.title || "Untitled Milestone",
               description: m.description || "",
               amount: m.amount?.toString() || "0",
               status: (m.status?.toLowerCase() as MilestoneStatus) || "pending",
               percentage: m.percentage
            })),
            status: "open",
            ownerId: "user_1",
         };

         onSuccess(newProject);
      } catch (err: any) {
         console.error("Submission error:", err);
         alert(err?.message || "Something went wrong while creating the project.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const containerVariants = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: { staggerChildren: 0.15 },
      },
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      show: {
         opacity: 1,
         y: 0,
         transition: { type: "spring", stiffness: 100, damping: 20 },
      },
   } as const;

   return (
      <motion.div
         variants={containerVariants}
         initial={false}
         animate="show"
         className="mx-auto max-w-4xl space-y-12 pb-20"
      >
         <div className="text-center space-y-4">
            <div className="flex justify-center mb-2">
               <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-2xl shadow-indigo-200">
                  <div className="h-full w-full rounded-[1.4rem] bg-white flex items-center justify-center">
                     <Sparkles className="h-7 w-7 text-indigo-500 animate-pulse" />
                  </div>
               </div>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
               Intelligent{" "}
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500">
                  Project Engine
               </span>
            </h1>
            <p className="text-slate-600 font-bold max-w-lg mx-auto">
               Build, refine, and launch with AI-guided precision on Algorand.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-10">
            <motion.section variants={itemVariants} className="space-y-6">
               <div className="flex items-center gap-3 px-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 ring-1 ring-rose-100">
                     <Briefcase className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Project Information</h2>
               </div>

               <div className="rounded-[2.5rem] border border-slate-100 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           Project Title
                        </label>
                        <input
                           required
                           type="text"
                           placeholder="e.g., Albedo Lending Protocol v2"
                           value={formData.title}
                           onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                           className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-black text-slate-950 placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:outline-none transition-all shadow-sm"
                        />
                     </div>

                     <div className="space-y-2 relative">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Detailed Description
                           </label>
                           <button
                              type="button"
                              onClick={improveDescription}
                              disabled={isImprovingDesc || !formData.description}
                              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-30"
                           >
                              {isImprovingDesc ? (
                                 <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                 <Wand2 className="h-3 w-3" />
                              )}
                              Improve with AI
                           </button>
                        </div>

                        <textarea
                           required
                           rows={4}
                           placeholder="Detail the technical vision and scope..."
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-black text-slate-950 placeholder:text-slate-400/60 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 focus:outline-none transition-all resize-none shadow-sm"
                        />
                     </div>
                  </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="space-y-6">
               <div className="flex items-center gap-3 px-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 ring-1 ring-emerald-100">
                     <TrendingUp className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Tech & Outcome</h2>
               </div>

               <div className="rounded-[2.5rem] border border-slate-100 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           Tech Stack
                        </label>

                        <div className="flex gap-2">
                           <input
                              type="text"
                              placeholder="Add technology..."
                              value={techInput}
                              onChange={(e) => setTechInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddTech(e)}
                              className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-950 placeholder:text-slate-400/60 focus:border-emerald-400 focus:outline-none transition-all shadow-sm"
                           />
                           <button
                              type="button"
                              onClick={handleAddTech}
                              className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                           >
                              <Plus className="h-5 w-5" />
                           </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                           {techStack.map((tech) => (
                              <span
                                 key={tech}
                                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-black text-emerald-600"
                              >
                                 {tech}
                                 <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setTechStack(techStack.filter((t) => t !== tech))}
                                 />
                              </span>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2 relative">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Expected Outcome
                           </label>
                           <button
                              type="button"
                              onClick={refineOutcome}
                              disabled={isRefiningOutcome || !formData.outcome}
                              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-30"
                           >
                              {isRefiningOutcome ? (
                                 <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                 <Sparkles className="h-3 w-3" />
                              )}
                              Refine with AI
                           </button>
                        </div>

                        <textarea
                           required
                           rows={3}
                           placeholder="What does success look like?"
                           value={formData.outcome}
                           onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                           className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-black text-slate-950 placeholder:text-slate-400/60 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 focus:outline-none transition-all resize-none shadow-sm"
                        />
                     </div>
                  </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="space-y-6">
               <div className="flex items-center gap-3 px-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 ring-1 ring-amber-100">
                     <Coins className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Project Economics</h2>
               </div>

               <div className="rounded-[2.5rem] border border-slate-100 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Total Budget (in ALGO)
                     </label>
                     <div className="relative">
                        <input
                           required
                           type="number"
                           placeholder="0.00"
                           value={formData.budget}
                           onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                           className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-5 text-xl font-black text-slate-950 placeholder:text-slate-400/60 focus:border-amber-400 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all shadow-inner"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-amber-200">
                              A
                           </div>
                           <span className="text-sm font-black text-slate-400">ALGO</span>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="space-y-6">
               <div className="flex items-center gap-3 px-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                     <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">AI Project Planning</h2>
               </div>

               {!milestones.length && !isGeneratingPlan ? (
                  <button
                     type="button"
                     onClick={generateProjectPlan}
                     className="w-full rounded-[2.5rem] bg-indigo-600 py-8 text-white font-black text-lg shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 group border-b-8 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
                  >
                     <Sparkles className="h-6 w-6 text-indigo-300 animate-pulse" />
                     Generate Project Plan with AI
                  </button>
               ) : isGeneratingPlan ? (
                  <div className="rounded-[2.5rem] bg-white border border-slate-100 p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
                        <motion.div
                           initial={{ x: "-100%" }}
                           animate={{ x: "100%" }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           className="h-full w-1/3 bg-indigo-500"
                        />
                     </div>
                     <div className="flex justify-center">
                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900">AI Engine Working</h3>
                        <p className="text-sm font-bold text-slate-400">
                           Generating milestones and optimizing timeline...
                        </p>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-8">

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                              Project Milestones
                           </h3>
                           <button
                              type="button"
                              onClick={addMilestone}
                              className="text-xs font-black text-indigo-500 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-all border border-indigo-100 shadow-sm"
                           >
                              <Plus className="h-3.5 w-3.5" /> Add Milestone
                           </button>
                        </div>

                        <div className="grid gap-4">
                           <AnimatePresence>
                              {milestones.map((m, i) => (
                                 <motion.div
                                    key={m.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-100 hover:border-indigo-100 transition-all"
                                 >
                                    <div className="flex items-start justify-between gap-4">
                                       <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black relative overflow-hidden group-hover:bg-indigo-600 transition-colors">
                                          {i + 1}
                                       </div>

                                       <div className="absolute top-4 right-12 opacity-30 group-hover:opacity-100 transition-opacity">
                                          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                                       </div>

                                       <div className="flex-1 space-y-3">
                                          <input
                                             className="w-full text-lg font-black text-slate-950 bg-white rounded-xl border-2 border-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-400 transition-all mb-1 shadow-sm"
                                             value={m.title}
                                             onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                                          />

                                          <textarea
                                             className="w-full text-xs font-black text-slate-600 bg-white rounded-xl border-2 border-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-400 transition-all resize-none shadow-sm"
                                             value={m.description}
                                             onChange={(e) => updateMilestone(m.id, "description", e.target.value)}
                                          />

                                          <div className="flex items-center gap-2">
                                             <Coins className="h-3 w-3 text-amber-500" />
                                             <input
                                                className="text-[10px] font-black text-amber-700 bg-amber-50 rounded-md px-2 py-1 border border-amber-200 focus:outline-none focus:border-amber-400 w-32 shadow-sm"
                                                value={m.amount}
                                                onChange={(e) => updateMilestone(m.id, "amount", e.target.value)}
                                             />
                                             {m.percentage !== undefined && m.percentage > 0 && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                                                   <Sparkles className="h-3 w-3 text-indigo-500" />
                                                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{m.percentage}% of project</span>
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       <button
                                          type="button"
                                          onClick={() => deleteMilestone(m.id)}
                                          className="text-slate-200 hover:text-rose-500 transition-colors"
                                       >
                                          <Trash2 className="h-4 w-4" />
                                       </button>
                                    </div>
                                 </motion.div>
                              ))}
                           </AnimatePresence>
                        </div>
                     </div>
                  </div>
               )}
            </motion.section>

            <motion.section variants={itemVariants} className="pt-10 flex gap-4">
               <button
                  type="button"
                  onClick={onCancel}
                  className="h-20 rounded-[2.5rem] bg-white text-slate-500 font-extrabold px-10 shadow-lg shadow-slate-100 transition-all hover:bg-slate-50 active:scale-95"
               >
                  Cancel
               </button>

               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 group relative h-20 overflow-hidden rounded-[2.5rem] bg-slate-900 text-white font-extrabold shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:grayscale"
               >
                  <div
                     className={cn(
                        "absolute inset-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-transform duration-700 ease-in-out -translate-x-full group-hover:translate-x-0",
                        isSubmitting && "translate-x-0"
                     )}
                  />

                  <div className="relative z-10 flex items-center justify-center gap-3">
                     {isSubmitting ? (
                        <>
                           <Loader2 className="h-6 w-6 animate-spin" />
                           <span>Launching Project Engine...</span>
                        </>
                     ) : (
                        <>
                           <span className="text-xl">Create Decentralized Project</span>
                           <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </>
                     )}
                  </div>
               </button>
            </motion.section>
         </form>
      </motion.div>
   );
}