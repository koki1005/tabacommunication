"use client";

import Link from "next/link";
import { useState } from "react";

type Target = "sake" | "tobacco";

const SAKE_QUESTIONS = [
  {
    key: "strength",
    label: "アルコールの強さは？",
    options: ["弱めがいい", "標準くらい", "強めが好き", "気にしない"],
  },
  {
    key: "taste",
    label: "味の好み",
    options: ["甘い", "すっきり", "苦い・辛口", "クセが強いの好き"],
  },
  {
    key: "budget",
    label: "1本の予算は？",
    options: ["〜300円", "〜600円", "〜1000円", "値段は気にしない"],
  },
  {
    key: "scene",
    label: "飲むシーン",
    options: ["一人で家飲み", "友達と", "イベント・初めて", "ちびちび長時間"],
  },
] as const;

const TOBACCO_QUESTIONS = [
  {
    key: "intensity",
    label: "重さの好み",
    options: ["軽めがいい", "標準", "重めが好き", "メンソール派"],
  },
  {
    key: "tar",
    label: "タールの強さ",
    options: ["1〜3mg", "4〜7mg", "8mg〜", "気にしない"],
  },
  {
    key: "budget",
    label: "予算（1箱）",
    options: ["〜500円", "〜700円", "気にしない"],
  },
  {
    key: "scene",
    label: "シーン",
    options: ["気分転換にたまに", "毎日のお供", "人と話しながら"],
  },
] as const;

type Pick = {
  id: string;
  name: string;
  reason: string;
  price?: number | null;
  abv?: number | null;
  category?: string;
  volume_ml?: number | null;
  tar?: number | null;
  nicotine?: number | null;
  count_per_pack?: number | null;
};

export function MatchClient() {
  const [target, setTarget] = useState<Target | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picks, setPicks] = useState<Pick[] | null>(null);

  const questions = target === "sake" ? SAKE_QUESTIONS : target === "tobacco" ? TOBACCO_QUESTIONS : [];
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.key]);

  function reset() {
    setTarget(null);
    setAnswers({});
    setPicks(null);
    setError(null);
  }

  async function submit() {
    if (!target) return;
    setLoading(true);
    setError(null);
    setPicks(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, answers }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "リクエスト失敗ちゃむ");
      setPicks(json.picks as Pick[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーちゃむ");
    } finally {
      setLoading(false);
    }
  }

  if (picks) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">
            あなたに合いそうな {target === "sake" ? "お酒" : "タバコ"} TOP{picks.length}
          </h2>
          <button
            onClick={reset}
            className="border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs hover:bg-white/[0.08]"
          >
            もう一度診断
          </button>
        </div>
        <ol className="space-y-3">
          {picks.map((p, i) => (
            <li
              key={p.id}
              className="border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06] sm:p-4"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center bg-[color:var(--color-accent-strong)] text-sm font-bold text-[color:var(--color-ink-950)]">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/${target}/${p.id}`}
                    className="block text-base font-bold text-[color:var(--color-ink-100)] hover:text-[color:var(--color-accent-strong)] sm:text-lg"
                  >
                    {p.name}
                  </Link>
                  <div className="text-[11px] text-[color:var(--color-ink-300)]">
                    {target === "sake"
                      ? `${p.category ?? "—"} · ${p.abv ?? "—"}% · ${p.volume_ml ?? "—"}ml · ¥${p.price ?? "—"}`
                      : `T${p.tar ?? "—"} · N${p.nicotine ?? "—"} · ${p.count_per_pack ?? "—"}本 · ¥${p.price ?? "—"}`}
                  </div>
                  <p className="text-xs leading-relaxed text-[color:var(--color-ink-200)] sm:text-sm">
                    {p.reason}
                  </p>
                  <Link
                    href={`/${target}/${p.id}`}
                    className="inline-block pt-1 text-[11px] font-semibold text-[color:var(--color-accent-strong)] hover:underline"
                  >
                    詳細・みんなの声を見る →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[color:var(--color-ink-200)]">どっち診断するちゃむ？</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTarget("sake")}
            className="border border-white/15 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.08]"
          >
            <div className="text-xs text-[color:var(--color-ink-300)]">お酒</div>
            <div className="text-lg font-bold">SAKE</div>
            <div className="mt-1 text-[10px] text-[color:var(--color-ink-300)]">4問・約30秒</div>
          </button>
          <button
            onClick={() => setTarget("tobacco")}
            className="border border-white/15 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.08]"
          >
            <div className="text-xs text-[color:var(--color-ink-300)]">タバコ</div>
            <div className="text-lg font-bold">TOBACCO</div>
            <div className="mt-1 text-[10px] text-[color:var(--color-ink-300)]">4問・約30秒</div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[color:var(--color-ink-300)]">
        <span>診断対象：{target === "sake" ? "お酒" : "タバコ"}</span>
        <button onClick={reset} className="underline hover:text-[color:var(--color-ink-100)]">
          対象を変える
        </button>
      </div>
      <ol className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.key} className="space-y-2 border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            <div className="text-sm font-semibold text-[color:var(--color-ink-100)]">
              <span className="mr-2 text-[color:var(--color-accent-strong)]">Q{idx + 1}</span>
              {q.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt) => {
                const active = answers[q.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                    className={
                      "border px-3 py-1.5 text-xs transition " +
                      (active
                        ? "border-[color:var(--color-accent-strong)] bg-[color:var(--color-accent-strong)]/15 text-[color:var(--color-accent-strong)]"
                        : "border-white/15 bg-white/[0.04] text-[color:var(--color-ink-200)] hover:bg-white/[0.08]")
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {error ? (
        <div className="border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 p-3 text-xs text-[color:var(--color-danger-strong)]">
          {error}
        </div>
      ) : null}
      <button
        onClick={submit}
        disabled={!allAnswered || loading}
        className="w-full bg-[color:var(--color-accent-strong)] py-3 text-sm font-bold text-[color:var(--color-ink-950)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "AI が選んでるちゃむ…" : "TOP3 を見せて"}
      </button>
    </div>
  );
}
