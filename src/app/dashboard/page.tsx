import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "TEACHER" || session.user.role === "ADMIN") {
    redirect("/teacher");
  }
  redirect("/student");
}
