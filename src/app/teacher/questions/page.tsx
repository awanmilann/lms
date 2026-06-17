import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function QuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const questions = await prisma.question.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bank Soal</h1>
          <p className="text-muted-foreground">Kelola semua soal ujian</p>
        </div>
        <Link href="/teacher/questions/new">
          <Button>Tambah Soal</Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada soal. Buat soal baru untuk memulai.
            </CardContent>
          </Card>
        ) : (
          questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium leading-relaxed">
                      {q.text}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Esai"}
                      </Badge>
                      {q.category && (
                        <span className="text-xs text-muted-foreground">{q.category.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{q.points} poin</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
