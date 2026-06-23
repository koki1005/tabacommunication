import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ColumnRow } from "@/lib/types";
import { ColumnSubmitForm } from "./ColumnSubmitForm";

export const dynamic = "force-dynamic";

export default async function ColumnsPage() {
  let rows: ColumnRow[] = [];
  let error: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data, error: e } = await supabase
      .from("columns")
      .select("*")
      .neq("tag", "法律")
      .order("created_at", { ascending: false });
    if (e) throw e;
    rows = (data ?? []) as ColumnRow[];
  } catch (e: any) {
    error = e?.message ?? "Supabase に接続できないちゃむ";
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">コラム</h1>
      <ColumnSubmitForm />

      {error ? (
        <EmptyState title="DB 未接続" hint={error} />
      ) : rows.length === 0 ? (
        <EmptyState title="まだコラムがないちゃむ" />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/columns/${r.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[color:var(--color-accent-strong)]/60 hover:bg-white/[0.06] sm:p-5"
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] tracking-widest text-[color:var(--color-ink-300)]">
                  <span>{r.tag}</span>
                  {r.is_user_submitted ? (
                    <span className="badge">ユーザー投稿</span>
                  ) : null}
                  {r.ai_factcheck ? (
                    <span className="badge badge-accent">AIチェック済み</span>
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold text-[color:var(--color-ink-100)]">
                  {r.title}
                </h2>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-200)]">
                  {r.body}
                </p>
                {r.author_name ? (
                  <div className="mt-2 text-[10px] text-[color:var(--color-ink-400)]">
                    by {r.author_name}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
