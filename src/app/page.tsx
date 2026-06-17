import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight">LMS CBT</h1>
        <p className="text-lg text-muted-foreground">
          Learning Management System dengan Computer-Based Testing.
          Platform ujian online untuk sekolah dan institusi pendidikan.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Daftar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
