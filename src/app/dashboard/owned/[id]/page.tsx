"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { projects as mockProjects } from "@/lib/mockData";
import type { Project } from "@/lib/mockData";
import { OwnedProjectDetails } from "@/components/OwnedProjectDetails";
import { ArrowLeft } from "lucide-react";

export default function OwnedProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sessionProject, setSessionProject] = useState<Project | null>(null);

  // Load newly created projects from sessionStorage (created via PostProjectForm)
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem("localProjects") || "[]") as Project[];
      const found = stored.find(p => p.id === id);
      if (found) setSessionProject(found);
    } catch {
      // ignore parse errors
    }
  }, [id]);

  const project = useMemo<Project | null>(() => {
    // First check sessionStorage (newly created projects)
    if (sessionProject) return sessionProject;
    // Then check mock data (owned by user_1)
    return mockProjects.find(p => p.id === id && p.ownerId === "user_1") ?? null;
  }, [id, sessionProject]);

  if (!project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-black">
          404
        </div>
        <h1 className="text-2xl font-black text-slate-900">Project Not Found</h1>
        <p className="text-slate-500 font-medium">This owned project doesn&apos;t exist or you may not have access.</p>
        <button
          onClick={() => router.push("/dashboard?view=owned")}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:scale-105 transition-all"
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
