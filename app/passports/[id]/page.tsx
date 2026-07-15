export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { fetchPassportDetail } from "@/lib/passports/detail-api";
import { fetchReferenceData } from "@/lib/passports/api";
import { toPassportFormData } from "@/lib/passports/form-data";
import { PassportEditForm } from "./PassportEditForm";
import { DeletePassportButton } from "@/app/passports/DeletePassportButton";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Паспорт #${id} — Паспортизация` };
}

export default async function PassportDetailPage({ params }: Props) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (!Number.isFinite(id) || id <= 0) notFound();

  const [fetchResult, refs] = await Promise.all([
    fetchPassportDetail(id),
    fetchReferenceData(),
  ]);

  if (fetchResult.kind !== "ok") {
    if (fetchResult.kind === "unauthorized") redirect("/login");
    notFound(); // covers "not_found" and "error"
  }

  const passport = fetchResult.data;
  const { formData, criterionDisplay } = toPassportFormData(passport);
  const title = formData.name_ru?.trim() || formData.name_kz?.trim() || `Объект #${id}`;

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
              ID {formData.id} · обновлён {new Date(formData.updated_at).toLocaleDateString("ru-RU")}
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
