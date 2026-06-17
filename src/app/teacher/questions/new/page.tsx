"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("MULTIPLE_CHOICE");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      type,
      text: form.get("text"),
      points: Number(form.get("points")) || 1,
      categoryId: categoryId || undefined,
    };

    if (type === "MULTIPLE_CHOICE") {
      body.options = options.filter((o) => o.trim());
      body.correctAnswer = correctAnswer;
    }

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/teacher/questions");
      router.refresh();
    }
    setLoading(false);
  }

  function handleOptionChange(i: number, value: string) {
    const next = [...options];
    next[i] = value;
    setOptions(next);
  }

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
    if (correctAnswer === options[i]) setCorrectAnswer("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Soal Baru</h1>
        <p className="text-muted-foreground">Tambahkan soal ke bank soal</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Soal</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                  <SelectItem value="ESSAY">Esai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Soal</Label>
              <Textarea id="text" name="text" required rows={4} placeholder="Tulis soal di sini..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Poin</Label>
              <Input id="points" name="points" type="number" defaultValue={1} min={1} />
            </div>

            {type === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                <Label>Pilihan Jawaban</Label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswer === opt}
                      onChange={() => setCorrectAnswer(opt)}
                      className="shrink-0"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(i)}>
                      X
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  + Tambah Pilihan
                </Button>
                {!correctAnswer && (
                  <p className="text-xs text-muted-foreground">Pilih jawaban benar dengan radio button</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Soal"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
