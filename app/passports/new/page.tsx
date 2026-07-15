import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchReferenceData } from "@/lib/passports/api";
import { fetchCriterionSchema } from "@/lib/passports/detail-api";
import { PassportCreateForm } from "./PassportCreateForm";

export const metadata = { title: "Новая запись — Паспортизация" };

export default async function PassportNewPage() {
  const [refs, criterionDisplay] = await Promise.all([fetchReferenceData(), fetchCriterionSchema()]);

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

      <div className="bg-surface rounded-2xl border border-foreground/8 shadow-sm px-6 py-6">
        <PassportCreateForm refs={refs} criterionDisplay={criterionDisplay} />
      </div>
    </div>
  );
}
