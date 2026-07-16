"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchPassportDetail, fetchReferenceData } from "@/lib/passports/browser-api";
import { toPassportFormData } from "@/lib/passports/form-data";
import { PassportEditForm } from "./PassportEditForm";
import { DeletePassportButton } from "@/app/passports/DeletePassportButton";
import type { ReferenceData } from "@/lib/passports/types";
import type { PassportFormData } from "@/lib/passports/form-data";
import type { CriterionDisplay } from "@/lib/passports/form-data";

const EMPTY_REFS: ReferenceData = {
  statuses: [], deliveryStatuses: [], districts: [],
  activityTypes: [], activitySubTypes: [], departments: [],
};

type Props = { params: Promise<{ id: string }> };

function PassportDetailContent({ id }: { id: number }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState<string>(`Объект #${id}`);
  const [formData, setFormData] = useState<PassportFormData | null>(null);
  const [criterionDisplay, setCriterionDisplay] = useState<CriterionDisplay[]>([]);
  const [refs, setRefs] = useState<ReferenceData>(EMPTY_REFS);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    Promise.all([fetchPassportDetail(id), fetchReferenceData()]).then(([result, refData]) => {
      setRefs(refData);
      if (result.kind === "unauthorized") { router.push("/login"); return; }
      if (result.kind !== "ok") { setNotFound(true); setLoading(false); return; }

      const { formData: fd, criterionDisplay: cd } = toPassportFormData(result.data);
      setFormData(fd);
      setCriterionDisplay(cd);
      setUpdatedAt(fd.updated_at);
      setTitle(fd.name_ru?.trim() || fd.name_kz?.trim() || `Объект #${id}`);
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <span className="text-sm text-foreground/40">Загрузка…</span>
      </div>
    );
  }

  if (notFound || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2 text-center">
        <p className="text-sm font-medium text-foreground/70">Объект не найден</p>
        <Link href="/passports" className="text-xs text-brand hover:underline">← Вернуться к списку</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/passports"
            className="mt-0.5 inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Список
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-tight">{title}</h1>
            <p className="text-sm text-foreground/40 mt-0.5">
              ID {formData.id} · обновлён {new Date(updatedAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
        <DeletePassportButton id={formData.id} />
      </div>

      <div className="bg-surface rounded-2xl border border-foreground/8 shadow-sm px-6 py-6">
        <PassportEditForm formData={formData} criterionDisplay={criterionDisplay} refs={refs} />
      </div>
    </div>
  );
}

export default function PassportDetailPage({ params }: Props) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return <p className="text-sm text-foreground/50 p-8">Неверный ID</p>;
  }

  return (
    <Suspense>
      <PassportDetailContent id={id} />
    </Suspense>
  );
}
