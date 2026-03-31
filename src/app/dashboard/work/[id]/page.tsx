"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { projects as mockProjects } from "@/lib/mockData";
import { ProtectedView } from "@/components/ProtectedView";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { MyWorkDetails } from "@/components/MyWorkDetails";
import { ArrowLeft } from "lucide-react";

export default function MyWorkDetailPage() {
  const { isConnected } = useWalletAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!isConnected) {
    return (
      <ProtectedView 
        title="Active Workspace" 
        description="To track your project progress and submit milestones for payment, please connect your Pera Wallet." 
      />
    );
  }

  const project = useMemo(() => {
    // Only show projects assigned to user_1
    return mockProjects.find(p => p.id === id && p.assignedFreelancerId === "user_1") ?? null;
  }, [id]);

  if (!project) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-black">
          404
        </div>
        <h1 className="text-2xl font-black text-slate-900">Work Item Not Found</h1>
        <p className="text-slate-500 font-medium">This project isn&apos;t in your active workspace or you haven&apos;t been assigned to it.</p>
        <button
          onClick={() => router.push("/dashboard?view=work")}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:scale-105 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Work
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
