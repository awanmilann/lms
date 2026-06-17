"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface Question {
  id: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  text: string;
  options: string | null;
  points: number;
}

interface ExamQuestion {
  id: string;
  orderIndex: number;
  question: Question;
}

interface Attempt {
  id: string;
  startTime: string;
  status: string;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasEssay, setHasEssay] = useState(false);

  const startExam = useCallback(async () => {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });

    if (!res.ok) {
      toast.error("Gagal memulai ujian");
      router.push("/student/exams");
      return;
    }

    const data = await res.json();
    setAttempt(data.attempt);
    setQuestions(data.exam.examQuestions);
    setHasEssay(data.exam.examQuestions.some((eq: ExamQuestion) => eq.question.type === "ESSAY"));

    const duration = data.exam.duration;
    const start = new Date(data.attempt.startTime).getTime();
    const end = start + duration * 60 * 1000;
    const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
    setTimeLeft(remaining);

    // Load saved answers
    if (data.attempt.answers?.length) {
      const saved: Record<string, string> = {};
      for (const a of data.attempt.answers) {
        saved[a.questionId] = a.answer;
      }
      setAnswers(saved);
    }

    setLoading(false);
  }, [examId, router]);

  useEffect(() => {
    startExam();
  }, [startExam]);

  useEffect(() => {
    if (!attempt) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  async function saveAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    await fetch(`/api/attempts/${attempt!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "answer", questionId, answer }),
    });
  }

  async function handleSubmit(auto = false) {
    if (submitting) return;
    if (!auto && !confirm("Yakin ingin mengumpulkan? Jawaban tidak bisa diubah setelah dikumpulkan.")) {
      return;
    }

    setSubmitting(true);
    await fetch(`/api/attempts/${attempt!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", hasEssay }),
    });

    toast.success("Ujian telah dikumpulkan!");
    router.push("/student/exams");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Memuat ujian...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex min-h-screen">
      <Toaster />

      {/* Question navigation sidebar */}
      <aside className="w-64 border-r bg-muted/20 p-4 flex flex-col gap-4 shrink-0">
        <div className="text-center">
          <div className={`text-3xl font-bold font-mono ${timeLeft < 300 ? "text-red-500" : ""}`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">sisa waktu</p>
        </div>

        <div className="text-sm text-center">
          {answeredCount}/{totalQuestions} terjawab
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((eq, i) => (
            <button
              key={eq.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                i === currentIndex
                  ? "ring-2 ring-primary ring-offset-2"
                  : answers[eq.question.id]
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-primary" />
            <span>Terjawab</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-muted" />
            <span>Belum</span>
          </div>
        </div>

        <Button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="w-full"
          variant="default"
        >
          {submitting ? "Mengumpulkan..." : "Kumpulkan"}
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {currentQuestion && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Soal {currentIndex + 1} dari {totalQuestions}</span>
              <span>&middot;</span>
              <span>{currentQuestion.question.points} poin</span>
              <span>&middot;</span>
              <span>{currentQuestion.question.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Esai"}</span>
            </div>

            <div className="text-lg leading-relaxed">
              {currentQuestion.question.text}
            </div>

            {currentQuestion.question.type === "MULTIPLE_CHOICE" && currentQuestion.question.options && (
              <RadioGroup
                value={answers[currentQuestion.question.id] || ""}
                onValueChange={(v) => saveAnswer(currentQuestion.question.id, v)}
              >
                <div className="space-y-3">
                  {JSON.parse(currentQuestion.question.options).map((opt: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50">
                      <RadioGroupItem value={opt} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.question.type === "ESSAY" && (
              <Textarea
                value={answers[currentQuestion.question.id] || ""}
                onChange={(e) => saveAnswer(currentQuestion.question.id, e.target.value)}
                placeholder="Tulis jawaban Anda di sini..."
                rows={8}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                disabled={currentIndex === totalQuestions - 1}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
