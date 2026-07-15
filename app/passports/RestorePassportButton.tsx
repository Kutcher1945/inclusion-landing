"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

type Props = { id: number };

export function RestorePassportButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/passports/${id}/restore`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 transition-colors"
    >
      <RotateCcw className="w-3 h-3" aria-hidden="true" />
      {loading ? "…" : "Восстановить"}
    </button>
  );
}
