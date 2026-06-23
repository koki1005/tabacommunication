import { SmartImage } from "@/components/SmartImage";
import { yen } from "@/lib/utils";

type Row = { label: string; value: React.ReactNode };

export function FactSheet({
  name,
  imageUrl,
  description,
  rows,
}: {
  name: string;
  imageUrl: string | null;
  description: string | null;
  rows: Row[];
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:gap-5 sm:p-5 md:grid-cols-[280px_1fr]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[color:var(--color-ink-900)] md:aspect-square">
        <SmartImage src={imageUrl} alt={name} sizes="(min-width: 768px) 280px, 100vw" fit="contain" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="text-[10px] tracking-widest text-[color:var(--color-ink-300)]">
            FACTS / 教科書
          </div>
          <h1 className="mt-1 text-xl font-bold leading-tight text-[color:var(--color-ink-100)] sm:text-2xl">
            {name}
          </h1>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2 sm:gap-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-2 border-b border-white/5 py-1.5">
              <dt className="text-[color:var(--color-ink-300)]">{r.label}</dt>
              <dd className="text-right text-[color:var(--color-ink-100)]">{r.value}</dd>
            </div>
          ))}
        </dl>
        {description ? (
          <p className="text-sm leading-relaxed text-[color:var(--color-ink-200)]">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export { yen };
