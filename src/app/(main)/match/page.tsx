import { MatchClient } from "./MatchClient";

export const dynamic = "force-dynamic";

export default function MatchPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-2 border border-[color:var(--color-accent-strong)]/40 bg-[color:var(--color-accent-strong)]/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[color:var(--color-accent-strong)]">
          new in v5
        </div>
        <h1 className="text-2xl font-bold">マッチ診断</h1>
        <p className="text-xs text-[color:var(--color-ink-300)] sm:text-sm">
          3〜4問に答えると、図鑑の中からあなたに合いそうな TOP3 を AI が選ぶちゃむ。押し売り無し、雰囲気で選んで OK ちゃむ。
        </p>
      </header>
      <MatchClient />
    </div>
  );
}
