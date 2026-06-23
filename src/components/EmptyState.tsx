export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <div className="text-sm text-[color:var(--color-ink-200)]">{title}</div>
      {hint ? (
        <div className="mt-1 text-xs text-[color:var(--color-ink-400)]">{hint}</div>
      ) : null}
    </div>
  );
}
