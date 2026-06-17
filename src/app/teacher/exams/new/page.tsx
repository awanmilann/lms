"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  category: { name: string } | null;
}

export default function NewExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then(setQuestions)
      .catch(() => {});
  }, []);

  function toggleQuestion(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedIds.size === 0) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        duration: Number(form.get("duration")),
        startTime: form.get("startTime"),
        endTime: form.get("endTime"),
        token: form.get("token") || null,
        questionIds: Array.from(selectedIds),
      }),
    });

    if (res.ok) {
      const exam = await res.json();
      router.push(`/teacher/exams/${exam.id}`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Ujian Baru</h1>
        <p className="text-muted-foreground">Atur jadwal dan pilih soal untuk ujian</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Ujian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Ujian</Label>
              <Input id="title" name="title" required placeholder="e.g. Ujian Tengah Semester" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Textarea id="description" name="description" placeholder="Deskripsi ujian..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (menit)</Label>
                <Input id="duration" name="duration" type="number" required defaultValue={60} min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token/Password (opsional)</Label>
                <Input id="token" name="token" placeholder="Kosongkan jika tidak perlu" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Waktu Mulai</Label>
                <Input id="startTime" name="startTime" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Waktu Selesai</Label>
                <Input id="endTime" name="endTime" type="datetime-local" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilih Soal</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada soal.{" "}
                <a href="/teacher/questions/new" className="underline">
                  Buat soal dulu
                </a>
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.map((q) => (
                  <label
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedIds.has(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                    />
                    <div className="text-sm">
                      <p className="leading-relaxed">{q.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.type === "MULTIPLE_CHOICE" ? "PG" : "Esai"} &middot; {q.points} poin
                        {q.category && <> &middot; {q.category.name}</>}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {selectedIds.size} soal dipilih
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || selectedIds.size === 0}>
            {loading ? "Menyimpan..." : "Buat Ujian"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
