"use client";

import { motion } from "framer-motion";
import { BrainCircuit, LockKeyhole, Cpu, ArrowRight } from "lucide-react";

export function About() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
  };

  return (
    <section id="aboutus" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative light background elements */}
      <div className="absolute top-0 right-0 -z-10 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white" />
      <div className="absolute bottom-0 left-0 -z-10 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-50/50 via-white to-white" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
           initial={false}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 px-4"
        >
          <span className="text-sm font-black tracking-[0.2em] text-rose-500 uppercase mb-5 block drop-shadow-sm inline-flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-[0_4px_15px_rgba(244,63,94,0.15)]">Platform Core Pillars</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl drop-shadow-sm">
            A New Era of <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400 drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)]">Freelancing</span>
          </h2>
          <p className="mt-8 text-xl text-slate-600 leading-relaxed font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
            We merge the intelligence of cutting-edge AI models with the unshakeable security of blockchain smart contracts to build a platform where trust is mathematical, not optional.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial={false}
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12"
        >
          {/* Card 1: Rose/Red theme */}
          <motion.div
            variants={item}
            className="group relative rounded-[2.5rem] bg-rose-50/30 p-10 border-2 border-rose-100/50 transition-all duration-500 hover:bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(244,63,94,0.25)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-200/20 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150 group-hover:bg-rose-100/30" />
            <div className="mb-8 inline-flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-rose-100 to-rose-200 p-5 text-rose-600 shadow-[0_10px_20px_rgba(244,63,94,0.2),_0_0_15px_rgba(255,255,255,0.8)_inset] group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(244,63,94,0.4),_0_0_20px_rgba(255,255,255,1)_inset] transition-all duration-500 ring-2 ring-white">
              <BrainCircuit className="h-8 w-8 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">AI Validation</h3>
            <p className="text-slate-600 leading-relaxed mb-8 font-medium">
              No more disputes. Our integrated AI analyzes code, design, and text deliverables against the original requirements to instantly validate milestone completions.
            </p>
            <div className="inline-flex items-center text-rose-600 font-extrabold text-sm uppercase tracking-wider group-hover:gap-3 transition-all bg-white px-5 py-2.5 rounded-full shadow-[0_5px_15px_rgba(244,63,94,0.15)] group-hover:shadow-[0_8px_25px_rgba(244,63,94,0.3)] border border-rose-50">
               <span className="drop-shadow-sm">Learn how it works</span>
               <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 drop-shadow-sm" />
            </div>
          </motion.div>

          {/* Card 2: Emerald/Green theme */}
          <motion.div
            variants={item}
            className="group relative rounded-[2.5rem] bg-emerald-50/30 p-10 border-2 border-emerald-100/50 transition-all duration-500 hover:bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.25)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150 group-hover:bg-emerald-100/30" />
            <div className="mb-8 inline-flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-100 to-emerald-200 p-5 text-emerald-600 shadow-[0_10px_20px_rgba(16,185,129,0.2),_0_0_15px_rgba(255,255,255,0.8)_inset] group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(16,185,129,0.4),_0_0_20px_rgba(255,255,255,1)_inset] transition-all duration-500 ring-2 ring-white">
              <LockKeyhole className="h-8 w-8 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">Trustless Payments</h3>
            <p className="text-slate-600 leading-relaxed mb-8 font-medium">
              Funds are locked in transparent smart contracts at the start of a project. Once the AI validates a milestone, payments are released automatically—zero delays.
            </p>
            <div className="inline-flex items-center text-emerald-600 font-extrabold text-sm uppercase tracking-wider group-hover:gap-3 transition-all bg-white px-5 py-2.5 rounded-full shadow-[0_5px_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] border border-emerald-50">
               <span className="drop-shadow-sm">View smart contracts</span>
               <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 drop-shadow-sm" />
            </div>
          </motion.div>

          {/* Card 3: Amber/Yellow theme */}
          <motion.div
            variants={item}
            className="group relative rounded-[2.5rem] bg-amber-50/30 p-10 border-2 border-amber-100/50 transition-all duration-500 hover:bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(245,158,11,0.25)] hover:-translate-y-2 overflow-hidden md:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150 group-hover:bg-amber-100/30" />
            <div className="mb-8 inline-flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-amber-100 to-amber-200 p-5 text-amber-600 shadow-[0_10px_20px_rgba(245,158,11,0.2),_0_0_15px_rgba(255,255,255,0.8)_inset] group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(245,158,11,0.4),_0_0_20px_rgba(255,255,255,1)_inset] transition-all duration-500 ring-2 ring-white">
              <Cpu className="h-8 w-8 drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">Decentralized Arbitration</h3>
            <p className="text-slate-600 leading-relaxed mb-8 font-medium">
              In the rare event of a complex edge case, our fallback decentralized autonomous organization mechanism steps in to ensure extreme fairness.
            </p>
            <div className="inline-flex items-center text-amber-600 font-extrabold text-sm uppercase tracking-wider group-hover:gap-3 transition-all bg-white px-5 py-2.5 rounded-full shadow-[0_5px_15px_rgba(245,158,11,0.15)] group-hover:shadow-[0_8px_25px_rgba(245,158,11,0.3)] border border-amber-50">
               <span className="drop-shadow-sm">Read the whitepaper</span>
               <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 drop-shadow-sm" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
