import { notFound } from "next/navigation";
import { FactSheet, yen } from "@/components/FactSheet";
import { ThreadList } from "@/components/ThreadList";
import { PostForm } from "@/components/PostForm";
import { AiSummaryBlock } from "@/components/AiSummaryBlock";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Tobacco, Thread, AiSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TobaccoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const [{ data: t }, { data: threads }, { data: summary }] = await Promise.all([
    supabase.from("tobacco").select("*").eq("id", id).maybeSingle<Tobacco>(),
    supabase
      .from("threads")
      .select("*")
      .eq("target_type", "tobacco")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: Thread[] }>,
    supabase
      .from("ai_summaries")
      .select("*")
      .eq("target_type", "tobacco")
      .eq("target_id", id)
      .maybeSingle<AiSummary>(),
  ]);

  if (!t) notFound();

  const list = threads ?? [];

  return (
    <div className="space-y-6">
      <FactSheet
        name={t.name}
        imageUrl={t.image_url}
        description={t.description}
        rows={[
          { label: "価格", value: yen(t.price) },
          { label: "タール", value: t.tar != null ? `${t.tar} mg` : "—" },
          { label: "ニコチン", value: t.nicotine != null ? `${t.nicotine} mg` : "—" },
          { label: "1箱の本数", value: t.count_per_pack ? `${t.count_per_pack}本` : "—" },
          { label: "販売店舗", value: t.stores?.join("・") || "—" },
          { label: "製造会社", value: t.maker || "—" },
          { label: "発売年", value: t.released_year || "—" },
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
        <PostForm targetType="tobacco" targetId={t.id} />
        <ThreadList threads={list} />
      </section>
    </div>
  );
}
