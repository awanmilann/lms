"use client";

import { Button } from "./ui/button";

export function SignOut() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Sign Out
    </Button>
  );
}
