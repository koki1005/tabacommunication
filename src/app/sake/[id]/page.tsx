import { notFound } from "next/navigation";
import { FactSheet, yen } from "@/components/FactSheet";
import { ThreadList } from "@/components/ThreadList";
import { PostForm } from "@/components/PostForm";
import { AiSummaryBlock } from "@/components/AiSummaryBlock";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Sake, Thread, AiSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SakeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const [{ data: sake }, { data: threads }, { data: summary }] = await Promise.all([
    supabase.from("sake").select("*").eq("id", id).maybeSingle<Sake>(),
    supabase
      .from("threads")
      .select("*")
      .eq("target_type", "sake")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: Thread[] }>,
    supabase
      .from("ai_summaries")
      .select("*")
      .eq("target_type", "sake")
      .eq("target_id", id)
      .maybeSingle<AiSummary>(),
  ]);

  if (!sake) notFound();

  const list = threads ?? [];

  return (
    <div className="space-y-6">
      <FactSheet
        name={sake.name}
        imageUrl={sake.image_url}
        description={sake.description}
        rows={[
          { label: "種類", value: sake.category },
          { label: "度数", value: sake.abv != null ? `${sake.abv}%` : "—" },
          { label: "価格", value: yen(sake.price) },
          { label: "内容量", value: sake.volume_ml != null ? `${sake.volume_ml}ml` : "—" },
          { label: "販売店舗", value: sake.stores?.join("・") || "—" },
          { label: "製造会社", value: sake.maker || "—" },
          { label: "発売年", value: sake.released_year || "—" },
        ]}
      />

      {summary && list.length > 10 ? (
        <AiSummaryBlock
          summary={summary.summary}
          generatedAt={summary.generated_at}
          count={summary.source_thread_count}
        />
      ) : null}

      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-[color:var(--color-ink-100)]">
            掲示板
            <span className="ml-2 text-xs font-normal text-[color:var(--color-ink-300)]">
              {list.length}件の生の声
            </span>
          </h2>
        </header>
        <PostForm targetType="sake" targetId={sake.id} />
        <ThreadList threads={list} />
      </section>
    </div>
  );
}
