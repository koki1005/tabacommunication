"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/deviceId";
import type { TargetType } from "@/lib/types";

export function PostForm({
  targetType,
  targetId,
  placeholder,
}: {
  targetType: TargetType;
  targetId: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/threads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            target_type: targetType,
            target_id: targetId,
            display_name: name.trim() || null,
            body,
            device_id: getDeviceId(),
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        setBody("");
        setName("");
        router.refresh();
      } catch (e: any) {
        setError(e.message ?? "投稿に失敗したちゃむ");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <input
          type="text"
          placeholder="表示名（空欄なら名無しの先輩）"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="w-full rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2.5 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)] md:max-w-xs"
        />
      </div>
      <textarea
        placeholder={placeholder ?? "生の感想、偏見、豆知識、体験談。読みやすさは AI が軽く整えるちゃむ。"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={800}
        className="w-full resize-y rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-3 py-2.5 text-sm leading-relaxed text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-[color:var(--color-ink-400)]">
          {body.length} / 800
        </div>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="w-full rounded-md bg-[color:var(--color-accent-strong)] px-4 py-2.5 text-sm font-semibold text-[color:var(--color-ink-950)] transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? "送信中…" : "投稿する"}
        </button>
      </div>
      {error ? <div className="text-xs text-[color:var(--color-danger-strong)]">{error}</div> : null}
    </form>
  );
}
