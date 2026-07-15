"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type Props = { id: number };

export function DeleteRowButton({ id }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/passports/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "…" : "Да"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs rounded-lg border border-foreground/15 text-foreground/50 hover:text-foreground transition-colors"
        >
          Нет
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
      className="px-2.5 py-1 text-xs rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors whitespace-nowrap"
    >
      Удалить
    </button>
  );
}
