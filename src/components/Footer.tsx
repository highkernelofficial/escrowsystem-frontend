import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-lg shadow-sky-500/20 overflow-hidden group-hover:scale-110 transition-transform duration-300">
            <Hexagon className="h-6 w-6 relative z-10" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:drop-shadow-sm transition-all">
            Freelance<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-600">AI</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-slate-500">
          <a href="#" className="hover:text-sky-600 transition-colors hover:drop-shadow-sm">Terms of Service</a>
          <a href="#" className="hover:text-sky-600 transition-colors hover:drop-shadow-sm">Privacy Policy</a>
          <a href="#" className="hover:text-sky-600 transition-colors hover:drop-shadow-sm">Documentation</a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} FreelanceAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
