import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sign-out";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-2">
        <div className="mb-6">
          <h1 className="font-bold text-lg">LMS CBT</h1>
          <p className="text-xs text-muted-foreground">{session.user.name}</p>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/teacher" className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors">
            Dashboard
          </Link>
          <Link href="/teacher/questions" className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors">
            Bank Soal
          </Link>
          <Link href="/teacher/exams" className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors">
            Ujian
          </Link>
        </nav>
        <div className="mt-auto">
          <SignOut />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
