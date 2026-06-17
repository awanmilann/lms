import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user!.id;

  const upcomingExams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
      examAttempts: { none: { userId } },
    },
    include: { creator: { select: { name: true } } },
    take: 10,
  });

  const recentResults = await prisma.examAttempt.findMany({
    where: { userId, status: { not: "IN_PROGRESS" } },
    include: { exam: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {session?.user?.name}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Ujian Tersedia</h2>
        {upcomingExams.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tidak ada ujian tersedia saat ini.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingExams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Durasi: {exam.duration} menit
                  </div>
                  <Link href={`/student/exams/${exam.id}`}>
                    <Button size="sm">Mulai</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Hasil Terbaru</h2>
        {recentResults.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada hasil ujian.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentResults.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <CardTitle className="text-base">{attempt.exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.status === "GRADED" ? "default" : "secondary"}>
                      {attempt.status === "GRADED" ? "Sudah Dinilai" : "Menunggu"}
                    </Badge>
                    <span className="text-sm font-bold">
                      {attempt.totalScore ?? "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
