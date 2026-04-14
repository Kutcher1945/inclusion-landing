import { Mistral } from "@mistralai/mistralai";
import { NextRequest } from "next/server";

const MISTRAL_API_KEY = "j9Sutdt3RNg0qj5U4yYe1XdYzxIf2KHs";
const client = new Mistral({ apiKey: MISTRAL_API_KEY });

function buildPrompt(data: Record<string, unknown>, lang: "ru" | "en" = "ru"): string {
  const d = data as {
    summary?: { total_all: number; total_objects: number; total_hotels: number; total_hostels: number; total_stops: number; total_entrances: number };
    kozs?: Record<string, { accessible: number; partial: number; inaccessible: number; total: number; pct_accessible: number; pct_partial: number }>;
    objects?: {
      total: number;
      adaptation: { levels: Record<string, number>; average_pct: number; total: number };
      by_district: { district__name_ru: string | null; total: number; k_access: number; o_access: number; s_access: number; z_access: number }[];
    };
    hotels?: { total: number; adaptation: { average_pct: number } };
    hostels?: { total: number; adaptation: { average_pct: number } };
    stops?: { total: number };
  };

  const s = d.summary;
  const kozs = d.kozs;
  const obj = d.objects;

  // Find worst district by K accessibility
  const worstDistrict = obj?.by_district
    ?.filter((r) => r.district__name_ru)
    ?.sort((a, b) => (a.k_access / (a.total || 1)) - (b.k_access / (b.total || 1)))[0];

  const bestDistrict = obj?.by_district
    ?.filter((r) => r.district__name_ru)
    ?.sort((a, b) => (b.k_access / (b.total || 1)) - (a.k_access / (a.total || 1)))[0];

  const isEn = lang === "en";
  const nd   = isEn ? "n/a" : "н/д";
  const fmt  = (n: number | undefined) => n?.toLocaleString(isEn ? "en-US" : "ru-RU") ?? nd;

  const kozsRows = kozs ? Object.entries(kozs).map(([key, v]) => {
    const labels: Record<string, string> = isEn
      ? { kreslo: "W (Wheelchair)", opordvig: "M (Motor/Mobility)", sluh: "H (Hearing)", zrenie: "V (Vision)" }
      : { kreslo: "К (Кресло-коляска)", opordvig: "О (Опорно-двигательная)", sluh: "С (Слух)", zrenie: "З (Зрение)" };
    return isEn
      ? `- ${labels[key] ?? key}: Accessible ${fmt(v.accessible)} (${v.pct_accessible}%), Partial ${fmt(v.partial)} (${v.pct_partial}%), Not accessible ${fmt(v.inaccessible)} (${(100 - v.pct_accessible - v.pct_partial).toFixed(1)}%), Total ${fmt(v.total)}`
      : `- ${labels[key] ?? key}: Доступен ${fmt(v.accessible)} (${v.pct_accessible}%), Частично ${fmt(v.partial)} (${v.pct_partial}%), Не доступен ${fmt(v.inaccessible)} (${(100 - v.pct_accessible - v.pct_partial).toFixed(1)}%), Всего ${fmt(v.total)}`;
  }).join("\n") : nd;

  if (isEn) return `You are an accessibility analyst. You have been given data from the "Inclusion" information system of Almaty city.
Write a concise but insightful analytical summary in English (5–8 paragraphs).

Format: Markdown. Use: ## headings, **bold** for key figures, bullet lists.
IMPORTANT: do NOT wrap the response in \`\`\`markdown ... \`\`\` — write Markdown directly.

DATA:

OVERVIEW:
- Total passports: ${fmt(s?.total_all)}
  - Institutions (objects): ${fmt(s?.total_objects)}
  - Hotels: ${fmt(s?.total_hotels)}
  - Hostels: ${fmt(s?.total_hostels)}
  - Bus stops: ${fmt(s?.total_stops)}
  - Building entrances: ${fmt(s?.total_entrances)}

ACCESSIBILITY BY 4 DISABILITY CATEGORIES (W/M/H/V) — across all passport types:
${kozsRows}

ADAPTATION OF INSTITUTIONS (out of 97 indicators):
- Average adaptation: ${obj?.adaptation?.average_pct ?? nd}%
- Fully adapted (87-97): ${fmt(obj?.adaptation?.levels?.fully)}
- Highly (70-86): ${fmt(obj?.adaptation?.levels?.highly)}
- Moderately (40-69): ${fmt(obj?.adaptation?.levels?.moderately)}
- Poorly (1-39): ${fmt(obj?.adaptation?.levels?.poorly)}
- Not adapted (0): ${fmt(obj?.adaptation?.levels?.none)}

ADAPTATION BY TYPE:
- Hotels: ${d.hotels?.adaptation?.average_pct ?? nd}%
- Hostels: ${d.hostels?.adaptation?.average_pct ?? nd}%

${worstDistrict ? `DISTRICTS — most problematic: ${worstDistrict.district__name_ru} (${worstDistrict.total} objects, wheelchair accessibility: ${worstDistrict.total ? Math.round(worstDistrict.k_access / worstDistrict.total * 100) : 0}%)` : ""}
${bestDistrict ? `DISTRICTS — best: ${bestDistrict.district__name_ru} (${bestDistrict.total} objects, wheelchair accessibility: ${bestDistrict.total ? Math.round(bestDistrict.k_access / bestDistrict.total * 100) : 0}%)` : ""}

Write:
1. Overall assessment of Almaty's accessibility environment
2. Critical issues — with specific numbers
3. Which disability categories (W/M/H/V) are worst off and why it matters
4. Comparison across object types (institutions vs hotels vs hostels)
5. District-level disparities
6. Concrete prioritized recommendations`;

  return `Ты аналитик по вопросам доступной среды. Тебе предоставлены данные из информационной системы «Инклюзия» города Алматы.
Твоя задача — написать краткое, но содержательное аналитическое резюме на русском языке (5–8 абзацев).

Формат ответа — Markdown. Используй: заголовки ##, ###, жирный текст **важное**, маркированные списки.
ВАЖНО: не оборачивай ответ в \`\`\`markdown ... \`\`\` — пиши Markdown напрямую.

Данные:

ОБЩАЯ СВОДКА:
- Всего паспортов: ${fmt(s?.total_all)}
  - Учреждения (объекты): ${fmt(s?.total_objects)}
  - Гостиницы: ${fmt(s?.total_hotels)}
  - Общежития: ${fmt(s?.total_hostels)}
  - Остановки: ${fmt(s?.total_stops)}
  - Подъезды: ${fmt(s?.total_entrances)}

ДОСТУПНОСТЬ ПО 4 КАТЕГОРИЯМ (К/О/С/З) — по всем типам паспортов:
${kozsRows}

АДАПТАЦИЯ УЧРЕЖДЕНИЙ (из 97 показателей):
- Средний % адаптации: ${obj?.adaptation?.average_pct ?? nd}%
- Полностью адаптировано (87-97): ${fmt(obj?.adaptation?.levels?.fully)}
- Высоко (70-86): ${fmt(obj?.adaptation?.levels?.highly)}
- Средне (40-69): ${fmt(obj?.adaptation?.levels?.moderately)}
- Слабо (1-39): ${fmt(obj?.adaptation?.levels?.poorly)}
- Не адаптировано (0): ${fmt(obj?.adaptation?.levels?.none)}

АДАПТАЦИЯ ПО ТИПАМ:
- Гостиницы: ${d.hotels?.adaptation?.average_pct ?? nd}%
- Общежития: ${d.hostels?.adaptation?.average_pct ?? nd}%

${worstDistrict ? `РАЙОНЫ — самый проблемный: ${worstDistrict.district__name_ru} (${worstDistrict.total} объектов, К-доступность: ${worstDistrict.total ? Math.round(worstDistrict.k_access / worstDistrict.total * 100) : 0}%)` : ""}
${bestDistrict ? `РАЙОНЫ — лучший: ${bestDistrict.district__name_ru} (${bestDistrict.total} объектов, К-доступность: ${bestDistrict.total ? Math.round(bestDistrict.k_access / bestDistrict.total * 100) : 0}%)` : ""}

Напиши:
1. Общую оценку состояния доступной среды в Алматы
2. Что критически не так — с конкретными цифрами
3. Какие категории (К/О/С/З) в наихудшем положении и почему это важно
4. Сравнение типов объектов (учреждения vs гостиницы vs общежития)
5. Районную диспропорцию
6. Конкретные рекомендации что приоритизировать`;
}

export async function POST(req: NextRequest) {

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const lang = (body._lang as "ru" | "en" | undefined) ?? "ru";
  const prompt = buildPrompt(body, lang);

  const stream = await client.chat.stream({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    maxTokens: 2500,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const raw  = chunk.data.choices[0]?.delta?.content;
          const text = typeof raw === "string" ? raw : "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
