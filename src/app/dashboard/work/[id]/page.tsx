"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedView } from "@/components/ProtectedView";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { MyWorkDetails } from "@/components/MyWorkDetails";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { buildUrl } from "@/config/api";
import type { Project, ProjectWithMilestonesResponse } from "@/lib/mockData";

export default function MyWorkDetailPage() {
  const { isConnected, isLoggedIn, setIsLoggedIn } = useWalletAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!id || !isConnected || !isLoggedIn) return;

      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("auth_token");
        const fetchUrl = buildUrl(`/api/projects/me/workspace/${id}/with-milestones`);

        console.log(`🚀 [INIT] Fetching Workspace Detail (ID: ${id})...`);

        const response = await fetch(fetchUrl, {
          headers: {
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.status === 403 || response.status === 401) {
          console.warn(`⚠️ [AUTH] Access denied to work project ${id} (${response.status})`);

          if (token) {
            console.error("🛑 [SESSION EXPIRED] Clearing auth token and resetting login state.");
            localStorage.removeItem("auth_token");
            setIsLoggedIn(false);
            throw new Error("Your session has expired. Please connect and login again.");
          } else {
            console.log("🛡️ [AUTH] Missing token for protected route. Redirecting to auth gate.");
            throw new Error("Authentication required to view project details.");
          }
        }

        if (response.status === 404) {
          throw new Error("Project not found in your workspace.");
        }

        if (!response.ok) {
          const logMsg = await response.text().catch(() => "N/A");
          console.error("❌ [400 ERROR DEBUG] Body:", logMsg);
          throw new Error(`Failed to load project details: ${response.status}`);
        }

        const data: ProjectWithMilestonesResponse = await response.json();
        console.log("✅ [SUCCESS] Workspace Project Detail Loaded:", data);

        // Map backend response to frontend Project interface
        const mappedProject: Project = {
          id: data.project.id,
          title: data.project.title,
          description: data.project.description,
          outcome: data.project.expectedOutcome || "",
          techStack: data.project.techStack || [],
          budget: `${data.project.totalAmount || 0} ALGO`,
          status: (data.project.status?.toLowerCase() as any) || "assigned",
          ownerId: data.project.clientId,
          milestones: (data.milestones || []).map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            amount: `${m.amount} ALGO`,
            status: (m.status?.toLowerCase() as any) || "pending",
            percentage: m.percentage,
            txnHash: m.txnHash,
            githubLink: "" // Will be handled during submission
          }))
        };

        setProject(mappedProject);
      } catch (err) {
        console.error("❌ [ERROR] Workspace Detail Fetch Failed:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetail();
  }, [id, isConnected, isLoggedIn, setIsLoggedIn]);

  if (!isConnected || !isLoggedIn) {
    return (
      <ProtectedView
        title="Active Workspace"
        description="To track your project progress and submit milestones for payment, please connect your Pera Wallet."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Secured Workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="h-20 w-20 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 uppercase">Detail Retrieval Failed</h1>
          <p className="text-slate-500 font-bold max-w-md">{error || "This project isn&apos;t in your active workspace."}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard?view=work")}
          className="flex items-center gap-2 rounded-[1.5rem] bg-slate-900 px-8 py-4 text-xs font-black uppercase text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <MyWorkDetails
      project={project}
      onBack={() => router.push("/dashboard?view=work")}
    />
  );
}
