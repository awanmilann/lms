import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

const statusVariant: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ONGOING: "destructive",
  COMPLETED: "outline",
};

export default async function ExamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exams = await prisma.exam.findMany({
    where: { createdBy: session.user.id },
    include: {
      _count: { select: { examQuestions: true, examAttempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ujian</h1>
          <p className="text-muted-foreground">Kelola semua ujian</p>
        </div>
        <Link href="/teacher/exams/new">
          <Button>Buat Ujian</Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Belum ada ujian. Buat ujian baru untuk memulai.
            </CardContent>
          </Card>
        ) : (
          exams.map((exam) => (
            <Link key={exam.id} href={`/teacher/exams/${exam.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{exam.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{exam.duration} menit</span>
                        <span>{exam._count.examQuestions} soal</span>
                        <span>{exam._count.examAttempts} peserta</span>
                      </div>
                    </div>
                    <Badge variant={statusVariant[exam.status]}>{statusLabel[exam.status]}</Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
