"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const TAGS = ["ノウハウ", "歴史", "体験談", "豆知識"];

export function ColumnSubmitForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("ノウハウ");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/columns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title,
            body,
            tag,
            author_name: author.trim() || null,
          }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
        setTitle("");
        setBody("");
        setAuthor("");
        setOpen(false);
        if (j.id) router.push(`/columns/${j.id}`);
        else router.refresh();
      } catch (e: any) {
        setError(e.message ?? "投稿に失敗したちゃむ");
      }
    });
  }

  if (!open) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/5 p-4">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-semibold text-[color:var(--color-ink-100)]">
              自分のコラムを投稿する
            </div>
            <div className="text-xs text-[color:var(--color-ink-300)]">
              投稿すると Gemini がAIファクトチェックを付けてくれるちゃむ。
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-[color:var(--color-accent-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-ink-950)]"
          >
            書く
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-[color:var(--color-accent)]/40 bg-white/[0.03] p-5"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[color:var(--color-ink-300)]">タグ</span>
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={
              tag === t
                ? "rounded-full bg-[color:var(--color-accent-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--color-ink-950)]"
                : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[color:var(--color-ink-200)]"
            }
          >
            {t}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="タイトル（例：缶チューハイのABV別の回り方）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
        className="w-full rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
      />
      <textarea
        placeholder="本文。実体験ベースでもうんちくでもOK。AIが妥当性のコメントを付けるちゃむ。"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        maxLength={3000}
        className="w-full resize-y rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2 text-sm leading-relaxed text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
      />
      <input
        type="text"
        placeholder="名乗る場合の表示名（空欄なら匿名）"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        maxLength={20}
        className="w-full rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)] md:max-w-xs"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-[color:var(--color-ink-400)]">
          {title.length}/80 · {body.length}/3000
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-md border border-white/10 px-3 py-2.5 text-sm text-[color:var(--color-ink-200)] sm:flex-none"
          >
            やめる
          </button>
          <button
            type="submit"
            disabled={pending || !title.trim() || !body.trim()}
            className="flex-1 rounded-md bg-[color:var(--color-accent-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-ink-950)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {pending ? "AIチェック中…" : "投稿する"}
          </button>
        </div>
      </div>
      {error ? (
        <div className="text-xs text-[color:var(--color-danger-strong)]">{error}</div>
      ) : null}
    </form>
  );
}
