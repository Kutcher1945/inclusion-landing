"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = { id: number };

export function DeletePassportButton({ id }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/passports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Не удалось удалить запись. Попробуйте ещё раз.");
        setConfirming(false);
        return;
      }
      router.push("/passports");
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/60">Удалить запись?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Удаление…" : "Да, удалить"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-lg border border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          Отмена
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        Удалить
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
