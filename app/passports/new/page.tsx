"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchReferenceData, fetchCriterionSchema } from "@/lib/passports/browser-api";
import { PassportCreateForm } from "./PassportCreateForm";
import type { ReferenceData } from "@/lib/passports/types";
import type { CriterionDisplay } from "@/lib/passports/form-data";

const EMPTY_REFS: ReferenceData = {
  statuses: [], deliveryStatuses: [], districts: [],
  activityTypes: [], activitySubTypes: [], departments: [],
};

function PassportNewContent() {
  const [loading, setLoading] = useState(true);
  const [refs, setRefs] = useState<ReferenceData>(EMPTY_REFS);
  const [criterionDisplay, setCriterionDisplay] = useState<CriterionDisplay[]>([]);

  useEffect(() => {
    Promise.all([fetchReferenceData(), fetchCriterionSchema()]).then(([refData, schema]) => {
      setRefs(refData);
      setCriterionDisplay(schema);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <span className="text-sm text-foreground/40">Загрузка…</span>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-foreground/8 shadow-sm px-6 py-6">
      <PassportCreateForm refs={refs} criterionDisplay={criterionDisplay} />
    </div>
  );
}

export default function PassportNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/passports"
          className="mt-0.5 inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Список
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-tight">Новая запись</h1>
          <p className="text-sm text-foreground/40 mt-0.5">
            Заполните основные поля — остальное можно дополнить после создания
          </p>
        </div>
      </div>
      <Suspense>
        <PassportNewContent />
      </Suspense>
    </div>
  );
}
