import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamStatusToggle } from "./status-toggle";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      examQuestions: {
        orderBy: { orderIndex: "asc" },
        include: { question: { include: { category: { select: { name: true } } } } },
      },
      examAttempts: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!exam) notFound();

  const hasEssay = exam.examQuestions.some((eq) => eq.question.type === "ESSAY");
  const gradedCount = exam.examAttempts.filter((a) => a.status === "GRADED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <Badge>{statusLabel[exam.status]}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{exam.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExamStatusToggle examId={exam.id} currentStatus={exam.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Durasi</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{exam.duration} menit</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Soal</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{exam.examQuestions.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Peserta</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{exam.examAttempts.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Telah Dinilai</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{gradedCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exam.examQuestions.map((eq, i) => (
              <div key={eq.id} className="flex items-center justify-between p-3 border rounded-md text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="line-clamp-1">{eq.question.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {eq.question.type === "MULTIPLE_CHOICE" ? "PG" : "Esai"} &middot; {eq.question.points} poin
                      {eq.question.category && <> &middot; {eq.question.category.name}</>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hasil Peserta</CardTitle>
        </CardHeader>
        <CardContent>
          {exam.examAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada peserta.</p>
          ) : (
            <div className="space-y-2">
              {exam.examAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-md text-sm">
                  <div>
                    <p className="font-medium">{attempt.user.name}</p>
                    <p className="text-xs text-muted-foreground">{attempt.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={attempt.status === "GRADED" ? "default" : "secondary"}>
                      {attempt.status === "IN_PROGRESS" ? "Mengerjakan" : attempt.status === "SUBMITTED" ? "Menunggu" : "Selesai"}
                    </Badge>
                    <span className="font-bold">{attempt.totalScore ?? "-"}</span>
                    {hasEssay && attempt.status === "SUBMITTED" && (
                      <Link href={`/teacher/exams/${exam.id}/grade?attempt=${attempt.id}`}>
                        <Button size="sm" variant="outline">Nilai</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
