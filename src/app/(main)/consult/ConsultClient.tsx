"use client";

import { useState } from "react";

type Result = {
  verdict: "アウト" | "グレー" | "セーフ";
  reason: string;
  laws: string;
  one_liner: string;
};

const EXAMPLES = [
  "大学のサークルの新歓で先輩が後輩に飲ませてもいい？",
  "20歳の自分が、19歳の友達に1杯だけ酒を勧めるのはどう？",
  "自宅のベランダでタバコ吸うのは法律的にOK？",
  "コンビニで買った酒を路上で飲み歩くのはアリ？",
];

const VERDICT_STYLE: Record<Result["verdict"], string> = {
  アウト:
    "border-[color:var(--color-danger)]/60 bg-[color:var(--color-danger)]/15 text-[color:var(--color-danger-strong)]",
  グレー: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  セーフ: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
};

export function ConsultClient() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function submit() {
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "リクエスト失敗ちゃむ");
      setResult({
        verdict: json.verdict,
        reason: json.reason,
        laws: json.laws,
        one_liner: json.one_liner,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーちゃむ");
    } finally {
      setLoading(false);
    }
  }

  function discard() {
    setSituation("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[color:var(--color-ink-200)]">
          状況を書いてちゃむ（600文字以内）
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          maxLength={600}
          rows={5}
          placeholder="例：大学のサークルの新歓で、20歳の自分が19歳の同級生にビールを勧めようとしている。これってアウト？"
          className="w-full resize-y border border-white/10 bg-[color:var(--color-ink-900)] p-3 text-sm text-[color:var(--color-ink-100)] outline-none placeholder:text-[color:var(--color-ink-400)] focus:border-[color:var(--color-accent-strong)]/60"
        />
        <div className="flex items-center justify-between text-[10px] text-[color:var(--color-ink-400)]">
          <span>送信しても保存はしないちゃむ</span>
          <span>{situation.length} / 600</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-ink-400)]">
          書くこと迷ったら
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setSituation(ex)}
              className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[color:var(--color-ink-300)] hover:bg-white/[0.06]"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 p-3 text-xs text-[color:var(--color-danger-strong)]">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={!situation.trim() || loading}
          className="flex-1 bg-[color:var(--color-accent-strong)] py-3 text-sm font-bold text-[color:var(--color-ink-950)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "判定中ちゃむ…" : "アウト／セーフ 判定"}
        </button>
        {result || situation ? (
          <button
            onClick={discard}
            className="border border-white/15 bg-white/[0.04] px-4 text-xs hover:bg-white/[0.08]"
          >
            破棄
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-3 border border-white/10 bg-white/[0.03] p-4">
          <div className={`inline-flex items-center gap-2 border px-3 py-1.5 text-sm font-bold ${VERDICT_STYLE[result.verdict]}`}>
            判定：{result.verdict}
          </div>
          <p className="text-sm leading-relaxed text-[color:var(--color-ink-100)]">
            {result.reason}
          </p>
          {result.laws ? (
            <div className="border-t border-white/10 pt-3 text-[11px] text-[color:var(--color-ink-300)]">
              <span className="font-bold text-[color:var(--color-ink-200)]">関係しそうな法律：</span>
              {result.laws}
            </div>
          ) : null}
          {result.one_liner ? (
            <div className="border-l-2 border-[color:var(--color-accent-strong)] pl-3 text-sm italic text-[color:var(--color-ink-200)]">
              {result.one_liner}
            </div>
          ) : null}
          <div className="pt-1 text-[10px] text-[color:var(--color-ink-400)]">
            AI 判定は参考情報ちゃむ。重大なケースは専門家に確認してちゃむ。送信内容も結果もサーバに保存してないちゃむ。
          </div>
        </div>
      ) : null}
    </div>
  );
}
