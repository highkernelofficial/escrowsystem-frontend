"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { projects as mockProjects, Project, ProjectWithMilestonesResponse } from "@/lib/mockData";
import { ProjectDetails } from "@/components/ProjectDetails";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { buildUrl } from "@/config/api";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        const fetchUrl = buildUrl(`/api/projects/${id}/with-milestones`);
        console.log("Fetching project from URL:", fetchUrl);

        let response = await fetch(fetchUrl, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json"
          }
        });
        
        // Handle 403/401 (Expired session or invalid token)
        if ((response.status === 403 || response.status === 401) && token) {
          console.warn(`⚠️ [DETAILS] Received ${response.status} with token. Retrying anonymously...`);
          response = await fetch(fetchUrl, {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json"
            }
          });
        }

        if (!response.ok) {
          console.error("Response error:", response.status, response.statusText);
          if (response.status === 404) {
            throw new Error("Project not found");
          }
          throw new Error(`Failed to fetch project details (${response.status})`);
        }

        const data: ProjectWithMilestonesResponse = await response.json();
        console.log("✅ [DETAILS API SUCCESS] Raw Response Data:", data);
        
        // Map backend response to frontend Project type
        const mappedProject: Project = {
          id: data.project.id,
          title: data.project.title,
          description: data.project.description,
          outcome: data.project.expectedOutcome,
          expectedOutcome: data.project.expectedOutcome,
          techStack: data.project.techStack,
          budget: data.project.totalAmount, // Backend uses totalAmount (number)
          status: data.project.status,
          ownerId: data.project.clientId,
          milestones: data.milestones.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            amount: m.amount, // Backend uses amount (number)
            status: m.status,
            percentage: m.percentage,
            createdAt: m.createdAt
          }))
        };

        setProject(mappedProject);
      } catch (err) {
        console.error("Fetch error:", err);
        // Fallback to mock data for demo purposes if ID matches
        const mock = mockProjects.find(p => p.id === id);
        if (mock) {
          setProject(mock);
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-[2rem] border-4 border-slate-100" />
          <Loader2 className="absolute inset-0 h-20 w-20 animate-spin text-slate-900 stroke-[1]" />
        </div>
        <p className="text-slate-500 font-bold animate-pulse">Loading Project Protocol...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="h-20 w-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-400 text-4xl font-black border border-rose-100 shadow-xl shadow-rose-100/50">
          ?
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-rose-900">{error || "Project Not Found"}</h1>
          <p className="text-slate-500 font-medium">This project doesn&apos;t exist or may have been removed.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetails
      project={project}
      onBack={() => router.push("/dashboard")}
      isOwner={project.ownerId === "user_1"}
    />
  );
}
