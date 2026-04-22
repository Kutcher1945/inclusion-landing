"use client";
import { useState, useRef, useCallback } from "react";
import { Sparkles, RefreshCw, AlertCircle, Copy, Check, Volume2, Square, Loader } from "lucide-react";
import type { DeepAccessibility } from "@/lib/api";

interface Props { deep: DeepAccessibility }
type Status = "idle" | "loading" | "done" | "error";
type SpeechStatus = "idle" | "loading" | "playing" | "paused";

// ── Markdown → plain text (for TTS) ─────────────────────────────────────────

function toPlainText(md: string): string {
  return md
    .replace(/^```[a-z]*\n?/im, "").replace(/\n?```\s*$/im, "")
    .replace(/#{1,4} /g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\|[-| :]+\|/g, "")           // table separator rows
    .replace(/\|(.+?)\|/g, (_, row) =>     // table rows → sentence
      row.split("|").map((c: string) => c.trim()).filter(Boolean).join(", "))
    .replace(/^[-*] /gm, "")
    .replace(/^\d+\. /gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Simple markdown → JSX renderer ──────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0, m: RegExpExecArray | null, key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={key++} className="font-semibold text-neutral-900">{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownBlock({ text }: { text: string }) {
  const cleaned = text
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  const lines = cleaned.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-base font-bold text-neutral-900 mt-6 mb-2 first:mt-0 pb-1 border-b border-neutral-100">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-sm font-semibold text-neutral-800 mt-4 mb-1.5">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }
    if (line.startsWith("#### ")) {
      nodes.push(
        <h4 key={i} className="text-sm font-medium text-neutral-700 mt-3 mb-1">
          {renderInline(line.slice(5))}
        </h4>
      );
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="border-neutral-100 my-3" />);
      i++; continue;
    }
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter((l) => !/^\|[-| :]+\|$/.test(l.trim()));
      nodes.push(
        <div key={`table-${i}`} className="overflow-x-auto my-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {rows[0]?.split("|").filter((_, ci) => ci > 0 && ci < rows[0].split("|").length - 1).map((cell, ci) => (
                  <th key={ci} className="text-left px-3 py-2 bg-neutral-50 border border-neutral-200 font-semibold text-neutral-700">
                    {renderInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="hover:bg-neutral-50">
                  {row.split("|").filter((_, ci) => ci > 0 && ci < row.split("|").length - 1).map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 border border-neutral-200 text-neutral-600 align-top">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^(\s*)[-*] /.test(line)) {
      const items: { indent: number; text: string }[] = [];
      while (i < lines.length && /^(\s*)[-*] /.test(lines[i])) {
        const indent = lines[i].match(/^(\s*)/)?.[1].length ?? 0;
        items.push({ indent, text: lines[i].replace(/^\s*[-*] /, "") });
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-sm text-neutral-700 leading-relaxed" style={{ paddingLeft: `${item.indent * 0.75}rem` }}>
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1 list-decimal list-inside">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm text-neutral-700 leading-relaxed">{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    nodes.push(
      <p key={i} className="text-sm text-neutral-700 leading-relaxed mb-2">{renderInline(line)}</p>
    );
    i++;
  }

  return <>{nodes}</>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Split plain text into ~250-word sentence-aware chunks */
function splitChunks(text: string, maxWords = 250): string[] {
  // Split on sentence boundaries
  const normalized = text.replace(/(\d+)\.(\d+)/g, "$1 point $2");
  const sentences = normalized.match(/[^.!?\n]+[.!?\n]+/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length;
    if (wordCount + words > maxWords && current) {
      chunks.push(current.trim());
      current = "";
      wordCount = 0;
    }
    current += " " + sentence;
    wordCount += words;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/** Fetch one TTS chunk → ObjectURL (mp3) or null on fallback */
async function fetchChunkUrl(chunk: string): Promise<string | null> {
  const res  = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: chunk }),
  });
  const data = await res.json();
  if (data.fallback || !data.audio_data) return null;
  const binary = atob(data.audio_data);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
}

// ── TTS hook ──────────────────────────────────────────────────────────────────

function useTTS(text: string) {
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [progress, setProgress]         = useState<{ current: number; total: number } | null>(null);

  // Queue of pre-fetched URLs to play sequentially
  const queueRef    = useRef<string[]>([]);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const stoppedRef  = useRef(false);
  const pausedRef   = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    // Revoke any queued URLs
    queueRef.current.forEach((u) => URL.revokeObjectURL(u));
    queueRef.current = [];
    setProgress(null);
    setSpeechStatus("idle");
  }, []);

  /** Play URLs from the queue one by one */
  const playQueue = useCallback((urls: string[], index: number) => {
    if (stoppedRef.current || index >= urls.length) {
      if (!stoppedRef.current) { setProgress(null); setSpeechStatus("idle"); }
      return;
    }
    const url   = urls[index];
    const audio = new Audio(url);
    audioRef.current = audio;
    setProgress({ current: index + 1, total: urls.length });
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (!stoppedRef.current && !pausedRef.current) playQueue(urls, index + 1);
    };
    audio.onerror = () => { URL.revokeObjectURL(url); playQueue(urls, index + 1); };
    audio.play();
  }, []);

  const play = useCallback(async () => {
    stop();
    stoppedRef.current = false;
    pausedRef.current  = false;
    setSpeechStatus("loading" as SpeechStatus);

    const plain  = toPlainText(text);
    const chunks = splitChunks(plain, 250);
    setProgress({ current: 0, total: chunks.length });

    try {
      // Generate all chunks in parallel
      const urls = await Promise.all(chunks.map(fetchChunkUrl));

      if (stoppedRef.current) return;

      // Filter out any nulls (failed chunks) — skip them
      const validUrls = urls.filter((u): u is string => u !== null);
      if (!validUrls.length) { setSpeechStatus("idle"); setProgress(null); return; }

      queueRef.current = validUrls;
      setSpeechStatus("playing");
      playQueue(validUrls, 0);
    } catch {
      setSpeechStatus("idle");
      setProgress(null);
    }
  }, [text, stop, playQueue]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    audioRef.current?.pause();
    setSpeechStatus("paused");
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    audioRef.current?.play();
    setSpeechStatus("playing");
  }, []);

  return { speechStatus, progress, play, pause, resume, stop };
}

// ── Component ────────────────────────────────────────────────────────────────

export function AiSummary({ deep }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText]     = useState("");
  const [copied, setCopied] = useState(false);
  const [lang, setLang]     = useState<"ru" | "en">("ru");
  const abortRef            = useRef<AbortController | null>(null);

  const { speechStatus, progress, play, pause, resume, stop } = useTTS(text);

  async function generate(targetLang = lang) {
    stop();
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setStatus("loading");
    setText("");

    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deep, _lang: targetLang }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setText(err.error ?? "Ошибка запроса");
        setStatus("error");
        return;
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setText(full);
      }
      setStatus("done");
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return;
      setText("Не удалось подключиться. Проверьте консоль.");
      setStatus("error");
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              {lang === "en" ? "AI Data Analysis" : "ИИ-анализ данных"}
            </div>
            <div className="text-xs text-neutral-400">Mistral Large · {lang === "en" ? "based on current data" : "на основе текущих данных"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border border-neutral-200 text-xs font-semibold">
            {(["ru", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === lang) return;
                  setLang(l);
                  if (status !== "idle") generate(l);
                }}
                className="px-3 py-1.5 transition-colors"
                style={lang === l
                  ? { background: "#6366f1", color: "white" }
                  : { background: "white", color: "#9ca3af" }
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* TTS controls — shown when text is ready */}
          {status === "done" && (
            <>
              {speechStatus === "idle" && (
                <button
                  onClick={play}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {lang === "en" ? "Listen" : "Озвучить"}
                </button>
              )}
              {speechStatus === ("loading" as SpeechStatus) && (
                <button disabled className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-400 font-medium">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  {progress && progress.total > 1
                    ? `${lang === "en" ? "Generating" : "Генерирую"} ${progress.total} ${lang === "en" ? "parts..." : "частей..."}`
                    : (lang === "en" ? "Generating audio..." : "Генерирую аудио...")}
                </button>
              )}
              {speechStatus === "playing" && (
                <div className="flex items-center gap-1.5">
                  {/* Waveform */}
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2, 3].map((n) => (
                      <div key={n} className="w-0.5 rounded-full bg-indigo-500"
                        style={{ height: `${10 + n * 3}px`, animation: `bounce 0.8s ease-in-out ${n * 0.15}s infinite alternate` }}
                      />
                    ))}
                  </div>
                  {/* Chunk progress */}
                  {progress && progress.total > 1 && (
                    <span className="text-[10px] text-indigo-400 tabular-nums">
                      {progress.current}/{progress.total}
                    </span>
                  )}
                  <button onClick={pause}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-all font-medium"
                  >
                    {lang === "en" ? "Pause" : "Пауза"}
                  </button>
                  <button onClick={stop}
                    className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-all"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              )}
              {speechStatus === "paused" && (
                <div className="flex items-center gap-1">
                  <button onClick={resume}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {lang === "en" ? "Resume" : "Продолжить"}
                  </button>
                  <button onClick={stop}
                    className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-all"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-green-500 mr-1" />{lang === "en" ? "Copied" : "Скопировано"}</>
                  : <><Copy className="w-3.5 h-3.5 mr-1" />{lang === "en" ? "Copy" : "Копировать"}</>}
              </button>
            </>
          )}

          <button
            onClick={() => generate()}
            disabled={status === "loading"}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {status === "loading"
              ? <><RefreshCw className="w-4 h-4 animate-spin" />{lang === "en" ? "Generating..." : "Генерирую..."}</>
              : <><Sparkles className="w-4 h-4" />{status === "idle"
                  ? (lang === "en" ? "Generate Analysis" : "Сгенерировать анализ")
                  : (lang === "en" ? "Refresh" : "Обновить")
                }</>}
          </button>
        </div>
      </div>

      {/* Body */}
      {status === "idle" && (
        <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)" }}>
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="text-sm font-medium text-neutral-700">
            {lang === "en" ? "Ready to analyse" : "Готов к анализу"}
          </div>
          <div className="text-xs text-neutral-400 max-w-sm">
            {lang === "en"
              ? "Mistral Large will analyse data across all passport types, WMHV accessibility categories, adaptation levels and districts — with concrete recommendations."
              : "Mistral Large проанализирует данные по всем типам паспортов, категориям КОЗС, адаптации и районам — и даст конкретные рекомендации."}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="px-6 py-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{text}</p>
        </div>
      )}

      {(status === "loading" || status === "done") && (
        <div className="px-6 py-5">
          <MarkdownBlock text={text} />
          {status === "loading" && (
            <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse rounded-sm align-middle ml-0.5" />
          )}
        </div>
      )}

      {/* Waveform keyframes */}
      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
