"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface Answer {
  id: string;
  questionId: string;
  answer: string;
  score: number | null;
  question: {
    id: string;
    text: string;
    type: string;
    points: number;
    correctAnswer: string | null;
  };
}

interface Attempt {
  id: string;
  user: { name: string; email: string };
  answers: Answer[];
}

export default function GradePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = params.id as string;
  const attemptId = searchParams.get("attempt");

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    fetch(`/api/attempts/${attemptId}`)
      .then((r) => r.json())
      .then((data) => {
        setAttempt(data);
        const initial: Record<string, number> = {};
        for (const a of data.answers) {
          initial[a.questionId] = a.score ?? 0;
        }
        setScores(initial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  async function saveScore(answerId: string, questionId: string) {
    const score = scores[questionId] ?? 0;
    await fetch(`/api/answers/${answerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    toast.success("Nilai disimpan");
  }

  async function finishGrading() {
    const answerUpdates = attempt!.answers.map((a) =>
      fetch(`/api/answers/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scores[a.questionId] ?? 0 }),
      })
    );
    await Promise.all(answerUpdates);

    // Calculate total and mark as graded
    const total = Object.values(scores).reduce((sum, s) => sum + (s ?? 0), 0);
    await fetch(`/api/attempts/${attemptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grade", totalScore: total }),
    });

    toast.success("Semua nilai disimpan!");
    router.push(`/teacher/exams/${examId}`);
    router.refresh();
  }

  if (loading) return <p className="p-6">Memuat...</p>;
  if (!attempt) return <p className="p-6">Attempt not found</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold">Nilai Ujian</h1>
        <p className="text-muted-foreground">{attempt.user.name} ({attempt.user.email})</p>
      </div>

      <div className="space-y-4">
        {attempt.answers
          .filter((a) => a.question.type === "ESSAY")
          .map((answer) => (
            <Card key={answer.id}>
              <CardHeader>
                <CardTitle className="text-sm leading-relaxed">{answer.question.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {answer.answer || "(Tidak dijawab)"}
                </div>
                {answer.question.points && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Nilai (max {answer.question.points}):</label>
                    <Input
                      type="number"
                      className="w-24"
                      max={answer.question.points}
                      min={0}
                      value={scores[answer.questionId] ?? 0}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [answer.questionId]: Number(e.target.value),
                        }))
                      }
                    />
                    <Button size="sm" variant="outline" onClick={() => saveScore(answer.id, answer.questionId)}>
                      Simpan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">
          Total: {Object.values(scores).reduce((s, v) => s + (v ?? 0), 0)}
        </p>
        <Button onClick={finishGrading}>Selesai Menilai</Button>
      </div>
    </div>
  );
}
