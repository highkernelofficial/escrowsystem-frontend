"use client";

import { Suspense, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardTopbar } from "@/components/DashboardTopbar";
import { motion } from "framer-motion";
import { SearchProvider, useSearch } from "@/context/SearchContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden selection:bg-sky-100 selection:text-sky-900">
      {/* Decorative RGBY Mesh Gradient System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <motion.div
           animate={{ rotate: 360, x: [0, 50, 0], y: [0, -30, 0] }}
           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
           className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] bg-sky-400/10 rounded-full blur-[150px]"
        />
        <motion.div
           animate={{ rotate: -360, x: [0, -40, 0], y: [0, 60, 0] }}
           transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
           className="absolute -bottom-1/4 -left-1/4 w-[900px] h-[900px] bg-emerald-400/10 rounded-full blur-[150px]"
        />
        <motion.div
           animate={{ scale: [1, 1.2, 1], x: [0, 100, 0] }}
           transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-rose-400/10 rounded-full blur-[180px]"
        />
        <motion.div
           animate={{ scale: [1, 1.4, 1], y: [0, -100, 0] }}
           transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-1/3 right-1/3 w-[700px] h-[700px] bg-amber-400/10 rounded-full blur-[180px]"
        />
      </div>

      {/* Fixed Sidebar */}
      <Suspense fallback={<div className="fixed left-0 top-0 hidden h-full w-64 xl:w-72 bg-gradient-to-b from-sky-50/80 via-emerald-50/80 to-rose-50/80 lg:block z-40" />}>
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 xl:pl-72">
        <DashboardTopbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-6 lg:p-10 relative z-10">
          <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <DashboardContent>{children}</DashboardContent>
    </SearchProvider>
  );
}
