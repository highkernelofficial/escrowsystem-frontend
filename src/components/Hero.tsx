"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck, CheckCircle2, Clock, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
export function Hero() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, type: "spring" as const, bounce: 0.4 } },
  };

  return (
    <section id="home" className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Animated Pastel Background Blobs - Light Blue Enhanced */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 60, 0],
          y: [0, -40, 0],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 -left-20 -z-10 h-96 w-96 rounded-[40%_60%_70%_30%] bg-sky-200/50 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -80, 0],
          y: [0, 50, 0],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute top-20 -right-20 -z-10 h-[32rem] w-[32rem] rounded-[60%_40%_30%_70%] bg-emerald-200/40 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 40, 0],
          y: [0, -60, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-20 left-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-cyan-200/40 blur-[100px]"
      />

      {/* Sparkles background layer */}
      <div className="absolute inset-0 -z-[5] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-8 items-center">

          {/* Hero Content */}
          <motion.div
            variants={containerVariants}
            initial={false}
            animate="visible"
            className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 relative z-10"
          >
            <motion.div variants={itemVariants} className="mb-8 inline-flex items-center justify-center space-x-3 rounded-full border border-sky-300 bg-sky-50 px-5 py-2 text-sm font-semibold text-sky-700 shadow-[0_8px_20px_rgba(14,165,233,0.15)] transition-transform hover:scale-105 hover:bg-white hover:shadow-[0_12px_30px_rgba(14,165,233,0.25)] cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75 shadow-[0_0_15px_rgba(56,189,248,0.8)]"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,1)]"></span>
              </span>
              <span className="flex items-center gap-2 drop-shadow-sm">Web3 x AI Platform is live <Zap className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" /></span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.1] drop-shadow-sm">
              Freelancing, <br className="hidden md:block" />Powered by <span className="relative inline-block"><span className="absolute -inset-1 rounded-lg bg-sky-100/50 blur backdrop-blur-3xl -z-10 shadow-[0_0_40px_rgba(14,165,233,0.4)]"></span><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-600 drop-shadow-[0_2px_2px_rgba(14,165,233,0.3)]">AI</span></span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-[0_2px_2px_rgba(52,211,153,0.3)]">Smart Contracts</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
              Eliminate trust issues. Our elite AI automatically validates project milestones and triggers instantaneous, secure decentralized payments.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-5 justify-center lg:justify-start items-center">
              <a
                href="/dashboard"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white/80 backdrop-blur-xl border border-sky-200 px-8 font-bold text-slate-700 transition-all hover:scale-105 hover:border-sky-300 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.2)] active:scale-95"
              >
                <span className="relative flex items-center drop-shadow-sm">
                  Explore Projects
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              
              <a
                href="#team"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-slate-100 bg-transparent px-6 font-bold text-slate-500 transition-all hover:text-sky-600 active:scale-95"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 group-hover:bg-sky-50">
                  <Play className="h-4 w-4 text-sky-600 ml-0.5" />
                </div>
                <span className="text-sm">View Demo</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Visual Mock */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, type: "spring", bounce: 0.5 }}
            style={{ perspective: 1200 }}
            className="relative lg:ml-auto w-full max-w-lg mx-auto mt-12 lg:mt-0"
          >
            {/* Main Validation Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-20 rounded-[2rem] border border-white bg-white/80 p-8 shadow-[0_40px_80px_-15px_rgba(14,165,233,0.25),_0_0_40px_rgba(255,255,255,0.8)_inset] backdrop-blur-3xl"
            >
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.05)]" />

              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2 drop-shadow-sm">Milestone Validation <Sparkles className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" /></h3>
                  <p className="text-sm font-bold text-sky-700 bg-sky-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mt-3 shadow-inner ring-1 ring-sky-200 drop-shadow-sm">Frontend Core</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 text-teal-600 shadow-[0_10px_20px_rgba(16,185,129,0.3),_0_0_15px_rgba(255,255,255,0.9)_inset] ring-2 ring-white"
                >
                  <ShieldCheck className="h-7 w-7 drop-shadow-md" />
                </motion.div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <motion.div
                  initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.15)] transition-shadow"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 shadow-[0_4px_10px_rgba(16,185,129,0.2)] ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-5 w-5 drop-shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest drop-shadow-sm">Code Quality</span>
                      <span className="text-[13px] font-black text-emerald-600 drop-shadow-sm">100%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <motion.div initial={false} animate={{ width: "100%" }} transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.15)] transition-shadow"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 shadow-[0_4px_10px_rgba(16,185,129,0.2)] ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-5 w-5 drop-shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest drop-shadow-sm">Tests Passed</span>
                      <span className="text-[13px] font-black text-emerald-600 drop-shadow-sm">24/24</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <motion.div initial={false} animate={{ width: "100%" }} transition={{ delay: 2.1, duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 bg-amber-50/90 p-4 rounded-2xl border border-amber-200/80 shadow-[0_10px_25px_rgba(245,158,11,0.1)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.2)] transition-shadow"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 relative overflow-hidden ring-2 ring-amber-300 shadow-[0_5px_15px_rgba(245,158,11,0.3)]">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[4px] border-amber-400 border-t-transparent border-l-transparent rounded-xl" />
                    <Clock className="h-5 w-5 drop-shadow-md" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-amber-800 block mb-2 uppercase tracking-widest drop-shadow-sm">Processing Smart Contract</span>
                    <div className="h-2.5 w-full rounded-full bg-amber-200/50 overflow-hidden relative shadow-inner">
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                        initial={{ width: "20%" }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.4)] relative overflow-hidden group border-2 border-slate-700/50">
                <div className="absolute inset-0 bg-[linear-gradient(60deg,transparent_20%,rgba(56,189,248,0.2)_50%,transparent_80%)] bg-[length:200%_200%,100%_100%] animate-[shimmer_2s_infinite_linear] opacity-100 transition-opacity" />
                <span className="block text-xs font-bold text-sky-400 mb-2 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">Total Payout Pending</span>
                <span className="text-5xl font-extrabold text-white leading-none tracking-tight drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">2.5 ALGO</span>
              </div>
            </motion.div>

            {/* Floating Elements Enhanced Shadows */}
            <motion.div
              animate={{ y: [0, -25, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-14 -right-10 z-10 rounded-2xl border-2 border-white bg-white/80 p-5 shadow-[0_25px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 shadow-[0_10px_20px_rgba(14,165,233,0.4),_0_0_20px_rgba(255,255,255,0.8)_inset] ring-4 ring-white" />
                <div>
                  <div className="h-3 w-28 rounded-full bg-slate-200 mb-3 shadow-inner" />
                  <div className="h-2.5 w-16 rounded-full bg-slate-100 shadow-inner" />
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 25, 0], x: [0, -15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-14 -left-16 z-30 rounded-2xl border-2 border-white bg-white/90 p-6 shadow-[0_30px_60px_rgba(16,185,129,0.25)] backdrop-blur-2xl"
            >
              <span className="text-emerald-600 font-extrabold flex items-center gap-3 text-sm uppercase tracking-widest drop-shadow-sm">
                <span className="relative flex h-3.5 w-3.5 shadow-md rounded-full bg-emerald-100">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 shadow-[0_0_15px_rgba(52,211,153,0.8)]"></span>
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
                </span>
                Transaction Verified
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              className="absolute top-1/2 -right-20 z-0 h-24 w-24 rounded-full bg-sky-400/30 blur-2xl"
            />
          </motion.div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </section>
  );
}
