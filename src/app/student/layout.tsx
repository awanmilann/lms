import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOut } from "@/components/sign-out";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
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
          <Link href="/student" className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors">
            Dashboard
          </Link>
          <Link href="/student/exams" className="text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors">
            Ujian Saya
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
