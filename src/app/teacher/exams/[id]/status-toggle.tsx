"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const statusFlow: Record<string, string> = {
  DRAFT: "PUBLISHED",
  PUBLISHED: "COMPLETED",
};

const label: Record<string, string> = {
  DRAFT: "Publish",
  PUBLISHED: "Akhiri Ujian",
};

export function ExamStatusToggle({ examId, currentStatus }: { examId: string; currentStatus: string }) {
  const router = useRouter();

  if (currentStatus === "COMPLETED" || currentStatus === "ONGOING") return null;

  async function handleToggle() {
    const nextStatus = statusFlow[currentStatus];
    if (!nextStatus) return;

    await fetch(`/api/exams/${examId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    router.refresh();
  }

  return (
    <Button onClick={handleToggle} variant={currentStatus === "DRAFT" ? "default" : "destructive"} size="sm">
      {label[currentStatus]}
    </Button>
  );
}
