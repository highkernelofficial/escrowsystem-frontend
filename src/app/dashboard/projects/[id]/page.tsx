"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { projects as mockProjects } from "@/lib/mockData";
import { ProjectDetails } from "@/components/ProjectDetails";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const project = useMemo(() => {
    return mockProjects.find(p => p.id === id) ?? null;
  }, [id]);

  if (!project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-black">
          404
        </div>
        <h1 className="text-2xl font-black text-slate-900">Project Not Found</h1>
        <p className="text-slate-500 font-medium">This project doesn&apos;t exist or may have been removed.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:scale-105 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </button>
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
