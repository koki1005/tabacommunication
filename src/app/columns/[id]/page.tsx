import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadList } from "@/components/ThreadList";
import { PostForm } from "@/components/PostForm";
import { AiSummaryBlock } from "@/components/AiSummaryBlock";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ColumnRow, Thread, AiSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ColumnDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const [{ data: col }, { data: threads }, { data: summary }] = await Promise.all([
    supabase.from("columns").select("*").eq("id", id).maybeSingle<ColumnRow>(),
    supabase
      .from("threads")
      .select("*")
      .eq("target_type", "column")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: Thread[] }>,
    supabase
      .from("ai_summaries")
      .select("*")
      .eq("target_type", "column")
      .eq("target_id", id)
      .maybeSingle<AiSummary>(),
  ]);

  if (!col) notFound();

  const list = threads ?? [];
  const isLaw = col.tag === "法律";

  return (
    <div className="space-y-6">
      <div className="text-xs">
        <Link
          href={isLaw ? "/law" : "/columns"}
          className="text-[color:var(--color-ink-300)] hover:text-[color:var(--color-ink-100)]"
        >
          ← {isLaw ? "法律" : "コラム"}一覧へ
        </Link>
      </div>

      <article
        className={
          isLaw
            ? "rounded-2xl border border-[color:var(--color-danger)]/40 bg-gradient-to-b from-[color:var(--color-danger)]/15 to-transparent p-4 sm:p-6"
            : "rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6"
        }
      >
        <div
          className={
            isLaw
              ? "mb-2 inline-flex items-center gap-2 text-[10px] tracking-widest text-[color:var(--color-danger-strong)]"
              : "mb-2 inline-flex items-center gap-2 text-[10px] tracking-widest text-[color:var(--color-ink-300)]"
          }
        >
          {col.tag}
          {col.is_user_submitted ? <span className="badge">ユーザー投稿</span> : null}
        </div>
        <h1 className="text-xl font-bold leading-tight text-[color:var(--color-ink-100)] sm:text-2xl">
          {col.title}
        </h1>
        {col.author_name ? (
          <div className="mt-1 text-xs text-[color:var(--color-ink-300)]">
            投稿者：{col.author_name}
          </div>
        ) : null}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-100)]">
          {col.body}
        </p>
      </article>

      {col.ai_factcheck ? (
        <section className="rounded-2xl border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 p-4 sm:p-5">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[color:var(--color-accent-strong)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent-strong)]" />
            AIファクトチェック
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-100)]">
            {col.ai_factcheck}
          </p>
          <p className="mt-3 text-[10px] text-[color:var(--color-ink-400)]">
            ※ AIによる一次資料との照合コメントです。最終判断は一次資料にあたってください。
          </p>
        </section>
      ) : null}

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
              {list.length}件の声
            </span>
          </h2>
        </header>
        <PostForm targetType="column" targetId={col.id} />
        <ThreadList threads={list} />
      </section>
    </div>
  );
}
