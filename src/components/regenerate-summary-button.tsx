"use client";

import { useState, useTransition } from "react";
import { regenerateProjectSummary } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";

type Status = "idle" | "success" | "error";

export function RegenerateSummaryButton({ projectId, label }: { projectId: string; label: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setStatus("idle");
    startTransition(async () => {
      const result = await regenerateProjectSummary(projectId);
      if (result?.error) {
        setStatus("error");
        return;
      }
      setStatus("success");
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      title={status === "success" ? label : label}
      className={`h-8 px-3 ${status === "error" ? "text-red-600" : ""}`}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-1 animate-pulse">
          <span className="animate-spin">↻</span>
          {label}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>↻</span>
          {label}
        </span>
      )}
    </Button>
  );
}
