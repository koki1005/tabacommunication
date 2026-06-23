import { createSupabaseServer } from "@/lib/supabase/server";
import { VotePanel } from "./VotePanel";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Item = { id: string; name: string };
type Ranked = Item & { score: number };

async function fetchAll() {
  const supabase = await createSupabaseServer();
  const [sake, tobacco, votes] = await Promise.all([
    supabase.from("sake").select("id,name").order("name"),
    supabase.from("tobacco").select("id,name").order("name"),
    supabase.from("votes").select("target_type,target_id,rank"),
  ]);
  return {
    sake: (sake.data ?? []) as Item[],
    tobacco: (tobacco.data ?? []) as Item[],
    votes: (votes.data ?? []) as { target_type: "sake" | "tobacco"; target_id: string; rank: 1 | 2 | 3 }[],
    error: sake.error?.message ?? tobacco.error?.message ?? votes.error?.message ?? null,
  };
}

function rank(items: Item[], votes: { target_id: string; rank: 1 | 2 | 3 }[]): Ranked[] {
  const score = new Map<string, number>();
  for (const v of votes) {
    const w = v.rank === 1 ? 3 : v.rank === 2 ? 2 : 1;
    score.set(v.target_id, (score.get(v.target_id) ?? 0) + w);
  }
  return items
    .map((it) => ({ ...it, score: score.get(it.id) ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

export default async function VotePage() {
  const { sake, tobacco, votes, error } = await fetchAll();
  if (error) {
    return (
      <div className="space-y-4">
        <EmptyState title="DB 未接続" hint={error} />
      </div>
    );
  }
  const sakeVotes = votes.filter((v) => v.target_type === "sake");
  const tobaccoVotes = votes.filter((v) => v.target_type === "tobacco");
  const sakeRank = rank(sake, sakeVotes);
  const tobaccoRank = rank(tobacco, tobaccoVotes);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">人気投票</h1>
      <section className="grid gap-6 md:grid-cols-2">
        <VoteSection title="酒" items={sake} ranked={sakeRank} target_type="sake" />
        <VoteSection title="タバコ" items={tobacco} ranked={tobaccoRank} target_type="tobacco" />
      </section>
    </div>
  );
}

function VoteSection({
  title,
  items,
  ranked,
  target_type,
}: {
  title: string;
  items: Item[];
  ranked: Ranked[];
  target_type: "sake" | "tobacco";
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-[color:var(--color-ink-100)]">{title}</h2>
      <VotePanel items={items} target_type={target_type} />
      <div>
        <h3 className="mb-2 text-xs tracking-widest text-[color:var(--color-ink-300)]">
          現在のランキング
        </h3>
        {ranked.length === 0 ? (
          <div className="text-sm text-[color:var(--color-ink-300)]">まだ投票がないちゃむ。</div>
        ) : (
          <ol className="space-y-1.5">
            {ranked.slice(0, 10).map((r, i) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={
                      i === 0
                        ? "inline-grid h-6 w-6 place-items-center rounded-full bg-[color:var(--color-accent-strong)] text-xs font-bold text-[color:var(--color-ink-950)]"
                        : "inline-grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs"
                    }
                  >
                    {i + 1}
                  </span>
                  <span className="text-[color:var(--color-ink-100)]">{r.name}</span>
                </span>
                <span className="text-xs text-[color:var(--color-ink-300)]">{r.score} pt</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
