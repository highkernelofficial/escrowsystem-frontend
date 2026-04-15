"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import { ProtectedView } from "@/components/ProtectedView";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import type { Project } from "@/lib/mockData";
import { buildUrl } from "@/config/api";
import {
  Search, ArrowRight, Briefcase, Loader2, RefreshCw
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isConnected,
    walletAddress,
    isLoggedIn,
    setIsLoggedIn,
    login,
    isLoading: authLoading
  } = useWalletAuth();
  const view = searchParams.get("view") ?? "all";
  const { searchQuery, setSearchQuery } = useSearch();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");

        // 🛡️ [GUARD] Don't fetch for protected views if user is not logged in/token cleared
        if ((view === "owned" || view === "work") && (!token || !isLoggedIn)) {
          console.log(`🛡️ [FETCH GUARD] Ignoring fetch for "${view}" view because user is not authenticated.`);
          setIsLoading(false);
          return;
        }

        let endpoint = "/api/projects/with-milestones";
        if (view === "owned") {
          endpoint = "/api/projects/me/owned/with-milestones";
        } else if (view === "work") {
          endpoint = "/api/projects/me/workspace/with-milestones";
        }

        const fetchUrl = buildUrl(endpoint);
        console.log(`🚀 [INIT] Fetching projects for view "${view}" from:`, fetchUrl);

        let response = await fetch(fetchUrl, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        // Handle 403 Forbidden or 401 Unauthorized (Expired Session)
        if (response.status === 403 || response.status === 401) {
          console.warn(`⚠️ [AUTH] API returned ${response.status} for view: ${view}`);

          if (view === "all") {
            if (token) {
              console.log("🔄 [RETRY] Falling back to public fetch for 'all' view...");
              response = await fetch(fetchUrl, {
                headers: { "ngrok-skip-browser-warning": "true" }
              });
            } else {
              // It was already a public fetch without token, just let line 81 handle it
              console.warn("⚠️ [AUTH] Public fetch failed. Check backend/ngrok status.");
            }
          } else {
            // For protected views (owned/work), clear the session as it's invalid
            console.error("🛑 [SESSION EXPIRED] Clearing auth token and resetting login state.");
            localStorage.removeItem("auth_token");
            setIsLoggedIn(false);
            throw new Error("Your session has expired. Please connect and login again.");
          }
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ [API SUCCESS] Fetched Projects for view "${view}":`, data);

        const mappedProjects: Project[] = data.map((item: any) => ({
          id: item.project.id?.toString() || Math.random().toString(),
          title: item.project.title || "Untitled Project",
          description: item.project.description || "No description provided.",
          outcome: item.project.expectedOutcome || "",
          techStack: item.project.techStack || [],
          budget: `${item.project.totalAmount || 0} ALGO`,
          status: (["created", "funded"].includes(item.project.status?.toLowerCase()) ? "open" : item.project.status?.toLowerCase() as any) || "open",
          milestones: item.milestones || [],
          ownerId: item.project.clientId || "unknown",
          fundingTxnHash: item.project.fundingTxnHash || item.project.funding_txn_hash || null,
        }));

        setAllProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [view, isConnected, isLoggedIn]);

  // 🔄 Auto-trigger login when on private views and connected but not logged in
  useEffect(() => {
    if ((view === "owned" || view === "work") && isConnected && !isLoggedIn && !authLoading) {
      console.log("🔄 [PAGE] Auto-triggering login...");
      const timer = setTimeout(() => {
        login();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [view, isConnected, isLoggedIn, authLoading, login]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      // Since 'owned' and 'work' views now fetch filtered data from the backend, 
      // we only need to apply the search filter here.
      return matchesSearch;
    });
  }, [allProjects, searchQuery, view, walletAddress]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1 },
  };

  const handleViewDetails = (id: string) => {
    if (view === "owned") router.push(`/dashboard/owned/${id}`);
    else if (view === "work") router.push(`/dashboard/work/${id}`);
    else router.push(`/dashboard/projects/${id}`);
  };

  // 🛡️ [GATE 1] Wallet must be connected for private views
  if ((view === "owned" || view === "work") && !isConnected) {
    return (
      <ProtectedView
        title={view === "owned" ? "My Projects" : "My Workspace"}
        description={`To manage your ${view === "owned" ? "owned" : "active"} projects and secure milestones, please connect your Pera Wallet.`}
      />
    );
  }

  // 🔐 [GATE 2] Session must be active (Signed Message) for private views
  if ((view === "owned" || view === "work") && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-slate-100 shadow-2xl">
        <div className="h-24 w-24 rounded-[3rem] bg-indigo-50 flex items-center justify-center text-indigo-500 mb-8 animate-pulse shadow-xl shadow-indigo-100">
          <RefreshCw className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Authentication Required</h2>
        <p className="max-w-md text-slate-500 font-bold mb-10 leading-relaxed text-lg">
          Your wallet is connected, but your session has expired. Please sign a verification message to securely access your data.
        </p>
        <button
          onClick={login}
          disabled={authLoading}
          className="group relative px-12 h-16 rounded-2xl bg-indigo-500 text-white font-black text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-indigo-200"
        >
          {authLoading ? (
            <span className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              Sign to Authenticate
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key={view}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header logic */}
      {view === "all" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Explore Projects
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Browse and bid on the most innovative Web3 and AI projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">
              Showing <span className="text-slate-900 font-black">{filteredProjects.length}</span> projects
            </span>
          </div>
        </div>
      )}

      {view === "owned" && (
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Your Projects
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Manage and track the projects you have posted on the platform.
          </p>
        </div>
      )}

      {view === "work" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Your Active Workspace
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Track your progress, submit milestones, and manage active contracts.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 h-14 rounded-2xl bg-indigo-500 text-white font-extrabold shadow-xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
          >
            Explore New Projects
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Scanning the ecosystem for projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 relative z-10"
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={itemVariants}>
              <ProjectCard
                project={project}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        view === "work" ? (
          <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/40 p-16 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
            <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-100">
              <Briefcase className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">No Active Projects Yet</h3>
            <p className="text-lg font-bold text-slate-500 max-w-lg">
              You haven&apos;t been assigned any projects yet. Explore the marketplace and submit a proposal!
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-10 h-16 rounded-2xl bg-slate-900 text-white font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"
            >
              Find Your First Project
            </button>
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 py-20 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-inner">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No projects found</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              Clear Search
            </button>
          </div>
        )
      )}
    </motion.div>
  );
}
