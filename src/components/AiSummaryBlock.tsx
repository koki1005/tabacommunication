export function AiSummaryBlock({
  summary,
  generatedAt,
  count,
}: {
  summary: string;
  generatedAt: string;
  count: number;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-accent)]/40 bg-gradient-to-br from-[color:var(--color-accent)]/15 via-transparent to-[color:var(--color-ink-900)]/40 p-4 sm:p-5">
      <div className="mb-2 flex flex-col gap-1 text-xs text-[color:var(--color-accent-strong)] sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 font-semibold tracking-wider">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent-strong)]" />
          みんなのイメージ（AI要約）
        </span>
        <span className="text-[10px] text-[color:var(--color-ink-300)]">
          {count}件の投稿から / {new Date(generatedAt).toLocaleString("ja-JP")}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-100)]">
        {summary}
      </p>
      <p className="mt-3 text-[10px] text-[color:var(--color-ink-400)]">
        ※ ユーザー投稿を元にAIが要約したものです。事実情報ではありません。
      </p>
    </section>
  );
}
