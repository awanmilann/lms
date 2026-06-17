"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError(`Error: ${result.error} (status: ${result?.status || "unknown"})`);
      setLoading(false);
      return;
    }

    setError(`OK: ${JSON.stringify(result)}`);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">LMS CBT</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            {error && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4 hover:text-primary">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
