"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Custom SVGs for GitHub and LinkedIn to avoid any library import issues
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

// We have 4 builders now instead of 3. Added standard image placeholders that you can update.
const teamData = [
  {
    name: "Nandita Rai",
    role: "Team Lead",
    imageUrl: "/Nandita.png",
    github: "https://github.com/Nandita29-dev",
    linkedin: "https://www.linkedin.com/in/nandita-rai-510bb82aa/",
    theme: "sky",
    bgLight: "bg-sky-50/80",
    borderLight: "border-sky-200",
    textColor: "text-sky-600",
    gradient: "from-sky-300 to-cyan-500",
    shadow: "hover:shadow-[0_40px_80px_rgba(14,165,233,0.3)]",
    ring: "ring-sky-200",
    glow: "shadow-[0_0_40px_rgba(14,165,233,0.4)]"
  },
  {
    name: "Devanshu Dubey",
    role: "Backend Developer",
    imageUrl: "/Devanshu.png",
    github: "https://github.com/DevanshuDubey06",
    linkedin: "https://www.linkedin.com/in/devanshu-dubey-b1b223330/",
    theme: "purple",
    bgLight: "bg-purple-50/80",
    borderLight: "border-purple-200",
    textColor: "text-purple-600",
    gradient: "from-fuchsia-300 to-purple-500",
    shadow: "hover:shadow-[0_40px_80px_rgba(168,85,247,0.3)]",
    ring: "ring-purple-200",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.4)]"
  },
  {
    name: "Samaksh Mandil",
    role: "Web Developer",
    imageUrl: "/Samaksh.png",
    github: "https://github.com/SAMAKSH-MANDIL",
    linkedin: "https://www.linkedin.com/in/samaksh-mandil-55229a358/",
    theme: "emerald",
    bgLight: "bg-emerald-50/80",
    borderLight: "border-emerald-200",
    textColor: "text-emerald-600",
    gradient: "from-teal-300 to-emerald-500",
    shadow: "hover:shadow-[0_40px_80px_rgba(16,185,129,0.3)]",
    ring: "ring-emerald-200",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]"
  },
  {
    name: "Priyanshu Khare",
    role: "AI & Backend Developer",
    imageUrl: "/Priyanshu.png",
    github: "https://github.com/Priyanshu-Khare-codes",
    linkedin: "https://www.linkedin.com/in/priyanshu-khare-b776a630a/",
    theme: "rose",
    bgLight: "bg-rose-50/80",
    borderLight: "border-rose-200",
    textColor: "text-rose-600",
    gradient: "from-rose-300 to-pink-500",
    shadow: "hover:shadow-[0_40px_80px_rgba(244,63,94,0.3)]",
    ring: "ring-rose-200",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.4)]"
  },
];

export function Team() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 80, scale: 0.9, rotateX: 10 },
    show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring" as const, stiffness: 60, damping: 14 } }
  };

  return (
    <section id="team" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background shapes */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute top-20 right-10 w-[500px] h-[500px] bg-sky-50/70 rounded-full blur-[120px] -z-10" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-emerald-50/70 rounded-full blur-[140px] -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-black tracking-[0.2em] text-cyan-500 uppercase mb-5 block inline-flex items-center gap-2 bg-cyan-50 px-5 py-2 rounded-full border border-cyan-100 shadow-[0_4px_15px_rgba(6,182,212,0.2)]">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
            The Brains Behind
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl drop-shadow-sm">
            Meet the Builders
          </h2>
          <p className="mt-6 text-xl text-slate-600 font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
            A collective of elite developers, researchers, and designers passionate about redefining the future of decentralized work.
          </p>
        </motion.div>

        {/* Updated grid to support 4 columns cleanly: 1 on mobile, 2 on medium, 4 on large displays */}
        <motion.div 
          variants={container}
          initial={false}
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8"
        >
          {teamData.map((member) => (
            <motion.div
              key={member.name}
              variants={cardVariant}
              style={{ perspective: 1200 }}
              className={`group flex flex-col items-center rounded-[2.5rem] border border-white/50 ring-2 ${member.ring} ring-opacity-50 bg-white/90 backdrop-blur-3xl p-6 sm:p-8 lg:px-6 xl:px-8 transition-all duration-700 hover:-translate-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.06),_0_0_30px_rgba(255,255,255,0.8)_inset] ${member.shadow} relative overflow-hidden`}
            >
               {/* Background Glow on Hover */}
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-4 bg-gradient-to-b ${member.gradient} opacity-0 group-hover:opacity-[0.05] blur-3xl transition-opacity duration-1000 rounded-[3rem] -z-10`} />

              {/* Photo Image Avatar */}
              <motion.div 
                 whileHover={{ scale: 1.1, rotate: 5 }}
                 transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                 className="relative mb-6 mt-2"
              >
                {/* Colored pulse ring behind the image */}
                <div className={`absolute inset-0 bg-gradient-to-r ${member.gradient} rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700 animate-pulse ${member.glow}`} />
                
                {/* The actual image container */}
                <div className="relative h-32 w-32 rounded-full border-[6px] border-white shadow-[0_15px_30px_rgba(0,0,0,0.15),_0_0_15px_rgba(255,255,255,1)_inset] overflow-hidden bg-slate-100">
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${member.gradient} z-10 mix-blend-overlay`} />
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-0"
                  />
                </div>
              </motion.div>
              
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight text-center drop-shadow-sm line-clamp-1">{member.name}</h3>
              <p className={`mt-3 text-[10px] xl:text-xs font-black uppercase tracking-[0.15em] ${member.textColor} px-4 py-2 rounded-full ${member.bgLight} border ${member.borderLight} shadow-[0_4px_10px_rgba(0,0,0,0.05),_0_0_10px_rgba(255,255,255,1)_inset] text-center drop-shadow-sm whitespace-nowrap`}>{member.role}</p>
              
              <div className="mt-8 flex gap-4 w-full justify-center">
                <a href={member.github} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 hover:bg-slate-50 hover:${member.textColor} shadow-[0_8px_15px_rgba(0,0,0,0.06),_0_0_10px_rgba(255,255,255,0.8)_inset] hover:shadow-[0_15px_25px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 border border-slate-100 hover:${member.borderLight} transition-all duration-300`}>
                  <span className="sr-only">GitHub</span>
                  <GithubIcon className="h-5 w-5 drop-shadow-sm" />
                </a>
                <a href={member.linkedin} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 hover:bg-slate-50 hover:${member.textColor} shadow-[0_8px_15px_rgba(0,0,0,0.06),_0_0_10px_rgba(255,255,255,0.8)_inset] hover:shadow-[0_15px_25px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 border border-slate-100 hover:${member.borderLight} transition-all duration-300`}>
                  <span className="sr-only">LinkedIn</span>
                  <LinkedinIcon className="h-5 w-5 drop-shadow-sm" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
