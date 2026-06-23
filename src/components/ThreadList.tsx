import type { Thread } from "@/lib/types";

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}日前`;
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function ThreadList({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-[color:var(--color-ink-300)]">
        まだ投稿がないちゃむ。最初の偏見、投げていいちゃむ。
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {threads.map((t) => (
        <li
          key={t.id}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
        >
          <div className="flex items-center justify-between gap-2 text-xs text-[color:var(--color-ink-300)]">
            <span className="font-medium text-[color:var(--color-ink-100)]">
              {t.display_name?.trim() || "名無しの先輩"}
            </span>
            <span>{timeAgo(t.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-100)]">
            {t.body}
          </p>
          {t.is_health_note ? (
            <div className="mt-3 rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-[11px] leading-relaxed text-[color:var(--color-danger-strong)]">
              これはユーザーの体験談です。医学的根拠ではありません。
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
