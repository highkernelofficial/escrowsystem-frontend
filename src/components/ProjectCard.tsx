"use client";

import { motion } from "framer-motion";
import { Clock, Briefcase, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/mockData";

interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: string) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const statusTheme = {
    open: {
      badge: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50",
      dot: "bg-emerald-500",
      hoverShadow: "hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.3)]",
      titleHover: "group-hover:text-emerald-600",
      techHover: "group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100",
      buttonHover: "group-hover:bg-emerald-500 group-hover:shadow-emerald-500/40"
    },
    assigned: {
      badge: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50",
      dot: "bg-amber-500",
      hoverShadow: "hover:shadow-[0_20px_60px_-10px_rgba(245,158,11,0.3)]",
      titleHover: "group-hover:text-amber-600",
      techHover: "group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100",
      buttonHover: "group-hover:bg-amber-500 group-hover:shadow-amber-500/40"
    },
    completed: {
      badge: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50",
      dot: "bg-rose-500",
      hoverShadow: "hover:shadow-[0_20px_60px_-10px_rgba(244,63,94,0.3)]",
      titleHover: "group-hover:text-rose-600",
      techHover: "group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-100",
      buttonHover: "group-hover:bg-rose-500 group-hover:shadow-rose-500/40"
    },
  };

  const theme = statusTheme[project.status as keyof typeof statusTheme] || statusTheme.open;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 25 } }
  } as const;

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      onClick={() => onViewDetails(project.id)}
      className={cn("group relative flex flex-col rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all cursor-pointer overflow-hidden border-2 border-white", theme.hoverShadow)}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Header with Status and Icon */}
      <div className="flex items-center justify-between mb-5">
        <div className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
          theme.badge
        )}>
          {project.status === "open" && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          {project.status}
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1">
        <h3 className={cn("text-xl font-extrabold text-slate-900 transition-colors mb-2 leading-tight", theme.titleHover)}>
          {project.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Colorful Tech Stack Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech, index) => {
            const techColors = [
              "bg-rose-50 text-rose-600 border-rose-100",
              "bg-emerald-50 text-emerald-600 border-emerald-100",
              "bg-sky-50 text-sky-600 border-sky-100",
              "bg-amber-50 text-amber-600 border-amber-100",
            ];
            const chipColor = techColors[index % techColors.length];
            return (
              <span 
                 key={tech} 
                 className={cn("rounded-lg px-2.5 py-1 text-[10px] font-black border shadow-sm transition-colors", chipColor, theme.techHover)}
              >
                 {tech}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer Info: Budget, Milestones and Action */}
      <div className="mt-auto border-t border-slate-50 pt-5 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</span>
             <span className="text-sm font-black text-slate-900 drop-shadow-sm">{project.budget}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestones</span>
             <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                {project.milestones.length}
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500/50" />
             </span>
          </div>
        </div>

        <motion.div 
           whileHover={project.status === "open" ? { scale: 1.1, x: 2, y: -2 } : {}}
           className={cn(
             "h-10 w-10 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200", 
             project.status === "open" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 border border-slate-200",
             project.status === "open" && theme.buttonHover
           )}
        >
           {project.status === "open" ? (
             <ArrowUpRight className="h-5 w-5" />
           ) : project.status === "completed" ? (
             <CheckCircle2 className="h-5 w-5 text-emerald-500" />
           ) : (
             <Clock className="h-5 w-5 text-amber-500" />
           )}
        </motion.div>
      </div>
    </motion.div>
  );
}
