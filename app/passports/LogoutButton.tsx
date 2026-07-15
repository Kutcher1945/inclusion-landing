"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { compact?: boolean };

export function LogoutButton({ compact = false }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        title="Выйти"
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
          "text-foreground/35 hover:text-foreground hover:bg-foreground/[0.06]",
          isPending && "opacity-40 cursor-not-allowed",
        )}
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "text-sm px-3.5 py-1.5 rounded-lg border transition-colors",
        "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5",
        isPending && "opacity-50 cursor-not-allowed",
      )}
    >
      {isPending ? "Выход…" : "Выйти"}
    </button>
  );
}
