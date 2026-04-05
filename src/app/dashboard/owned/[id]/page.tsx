"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { ProtectedView } from "@/components/ProtectedView";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import type { Project } from "@/lib/mockData";
import { OwnedProjectDetails } from "@/components/OwnedProjectDetails";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { buildUrl } from "@/config/api";

export default function OwnedProjectDetailPage() {
  const { isConnected, isLoggedIn, setIsLoggedIn } = useWalletAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        const fetchUrl = buildUrl(`/api/projects/me/owned/${id}/with-milestones`);

        console.log(`🚀 [INIT] Fetching owned project detail for ID: ${id} from:`, fetchUrl);

        let response = await fetch(fetchUrl, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.status === 403 || response.status === 401) {
          console.warn(`⚠️ [AUTH] Access denied to owned project ${id} (${response.status})`);

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

        if (!response.ok) {
          if (response.status === 404) {
            setProject(null);
            return;
          }
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ [OWNED API SUCCESS] Raw Data Received:", data);

        const mappedProject: Project = {
          id: data.project.id?.toString() || id,
          title: data.project.title || "Untitled Project",
          description: data.project.description || "No description provided.",
          outcome: data.project.expectedOutcome || "",
          techStack: data.project.techStack || [],
          budget: data.project.totalAmount || 0,
          status: (["created", "funded"].includes(data.project.status?.toLowerCase()) ? "open" : data.project.status?.toLowerCase() as any) || "open",
          milestones: data.milestones || [],
          ownerId: data.project.clientId || "unknown",
          fundingTxnHash: data.project.fundingTxnHash || data.project.funding_txn_hash || null,
        };

        console.log("🎯 [OWNED Mapped Data]:", mappedProject);
        setProject(mappedProject);
      } catch (err) {
        console.error("❌ [OWNED API ERROR]:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch project");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && isLoggedIn) {
      fetchProject();
    }
  }, [id, isConnected, isLoggedIn, setIsLoggedIn]);

  if (!isConnected) {
    return (
      <ProtectedView
        title="Project Management"
        description="To manage your project milestones and escrow funds, please connect your Pera Wallet."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Loading your project metrics...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="h-24 w-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100/50">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Project Not Found</h1>
          <p className="text-slate-500 font-bold max-w-sm">
            {error ? `System Error: ${error}` : "This project doesn't exist or you might not have owner permissions."}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard?view=owned")}
          className="flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Your Projects
        </button>
      </div>
    );
  }

  return (
    <OwnedProjectDetails
      project={project}
      onBack={() => router.push("/dashboard?view=owned")}
    />
  );
}
