import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const availableExams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
      examAttempts: { none: { userId } },
    },
    include: { creator: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  const history = await prisma.examAttempt.findMany({
    where: { userId },
    include: { exam: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ujian Tersedia</h1>
        <div className="grid gap-3 mt-4">
          {availableExams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Tidak ada ujian tersedia.
              </CardContent>
            </Card>
          ) : (
            availableExams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{exam.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {exam.duration} menit &middot; {exam.creator.name}
                      </p>
                    </div>
                    <Link href={`/student/exams/${exam.id}`}>
                      <Button>Mulai</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Riwayat Ujian</h1>
        <div className="grid gap-3 mt-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada riwayat.
              </CardContent>
            </Card>
          ) : (
            history.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{attempt.exam.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={attempt.status === "GRADED" ? "default" : "secondary"}>
                          {attempt.status === "IN_PROGRESS" ? "Belum Selesai" : attempt.status === "SUBMITTED" ? "Menunggu" : "Selesai"}
                        </Badge>
                        <span className="text-sm font-bold">{attempt.totalScore ?? "-"}</span>
                      </div>
                    </div>
                    {attempt.status === "IN_PROGRESS" && (
                      <Link href={`/student/exams/${attempt.examId}`}>
                        <Button variant="outline" size="sm">Lanjutkan</Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
