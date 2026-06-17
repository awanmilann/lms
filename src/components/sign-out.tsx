"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignOut() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </Button>
  );
}
