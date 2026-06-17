import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
  const session = await auth();
  const userId = session!.user!.id;

  const [totalQuestions, totalExams, activeExams] = await Promise.all([
    prisma.question.count({ where: { category: { questions: { some: {} } } } }),
    prisma.exam.count({ where: { createdBy: userId } }),
    prisma.exam.count({ where: { createdBy: userId, status: "PUBLISHED" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/questions/new">
            <Button>Buat Soal</Button>
          </Link>
          <Link href="/teacher/exams/new">
            <Button variant="outline">Buat Ujian</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Soal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ujian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalExams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ujian Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeExams}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
