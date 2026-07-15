import { type ReactNode } from "react";
import { requireSession } from "@/lib/auth/dal";
import { AppShell } from "./AppShell";

export const metadata = { title: "Паспортизация — Панель управления" };

export default async function PassportsLayout({ children }: { children: ReactNode }) {
  const { user } = await requireSession();

  return <AppShell username={user.username}>{children}</AppShell>;
}
