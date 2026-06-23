"use client";

import { useState, useTransition } from "react";

export function RequestForm() {
  const [type, setType] = useState<"sake" | "tobacco" | "other">("sake");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ target_type: type, name, note }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        setDone(true);
        setName("");
        setNote("");
      } catch (e: any) {
        setError(e.message ?? "送信に失敗したちゃむ");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 p-4 text-sm text-[color:var(--color-accent-strong)]">
        受け取ったちゃむ。ありがとうちゃむ。
        <button
          type="button"
          onClick={() => setDone(false)}
          className="ml-3 underline"
        >
          もう一件投げる
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-[color:var(--color-ink-300)]">種類</span>
        {[
          { v: "sake", l: "酒" },
          { v: "tobacco", l: "タバコ" },
          { v: "other", l: "その他" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setType(o.v as any)}
            className={
              type === o.v
                ? "rounded-full bg-[color:var(--color-accent-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--color-ink-950)]"
                : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[color:var(--color-ink-200)]"
            }
          >
            {o.l}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="銘柄名（例: ホッピー ブラック）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        className="w-full rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
      />
      <textarea
        placeholder="メモ（あれば。価格や入手場所、推したい理由など）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={400}
        className="w-full resize-y rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-[color:var(--color-ink-400)]">
          {name.length}/80 · note {note.length}/400
        </div>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="w-full rounded-md bg-[color:var(--color-accent-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-ink-950)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? "送信中…" : "リクエストを送る"}
        </button>
      </div>
      {error ? <div className="text-xs text-[color:var(--color-danger-strong)]">{error}</div> : null}
    </form>
  );
}
