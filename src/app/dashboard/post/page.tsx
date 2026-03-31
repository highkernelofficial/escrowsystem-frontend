"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PostProjectForm } from "@/components/PostProjectForm";
import { ProtectedView } from "@/components/ProtectedView";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import type { Project } from "@/lib/mockData";

export default function PostProjectPage() {
  const router = useRouter();
  const { isConnected } = useWalletAuth();
  const [, setPostedProjects] = useState<Project[]>([]);

  if (!isConnected) {
    return (
      <ProtectedView 
        title="Post a New Project" 
        description="To post a new project, secure your escrow funds, and hire elite talent, please connect your Pera Wallet first." 
      />
    );
  }

  const handleSuccess = (newProject: Project) => {
    // Store new project in sessionStorage so owned/[id] can access it
    const existing = JSON.parse(sessionStorage.getItem("localProjects") || "[]");
    sessionStorage.setItem("localProjects", JSON.stringify([newProject, ...existing]));
    // Redirect to the newly created project's owned detail page
    router.push(`/dashboard/owned/${newProject.id}`);
  };

  return (
    <PostProjectForm
      onSuccess={handleSuccess}
      onCancel={() => router.push("/dashboard")}
    />
  );
}
