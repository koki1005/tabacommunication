import { CatalogCard } from "@/components/CatalogCard";
import { EmptyState } from "@/components/EmptyState";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES = ["すべて", "ビール", "日本酒", "焼酎", "ウイスキー", "チューハイ"];

type Search = { category?: string; sort?: string };

export default async function SakeListPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const category = sp.category && sp.category !== "すべて" ? sp.category : null;
  const sort = sp.sort === "price" ? "price" : sp.sort === "abv" ? "abv" : "name";

  let rows: any[] = [];
  let error: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    let query = supabase.from("sake_with_stats").select("*");
    if (category) query = query.eq("category", category);
    query = query.order(sort, { ascending: true, nullsFirst: false });
    const { data, error: e } = await query;
    if (e) throw e;
    rows = data ?? [];
  } catch (e: any) {
    error = e?.message ?? "Supabase に接続できないちゃむ";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">お酒</h1>
      <Tabs current={category ?? "すべて"} categories={CATEGORIES} sort={sort} />
      <SortBar
        sort={sort}
        category={category ?? "すべて"}
        options={[
          { key: "name", label: "名前" },
          { key: "abv", label: "度数" },
          { key: "price", label: "価格" },
        ]}
      />

      {error ? (
        <EmptyState
          title="DB 未接続"
          hint={`.env に Supabase 情報を入れて、supabase/schema.sql を流したちゃむ❓ — ${error}`}
        />
      ) : rows.length === 0 ? (
        <EmptyState title="まだ銘柄が登録されてないちゃむ" />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5">
          {rows.map((s) => (
            <CatalogCard
              key={s.id}
              kind="sake"
              id={s.id}
              name={s.name}
              category={s.category}
              abv={s.abv}
              price={s.price}
              volume_ml={s.volume_ml}
              image_url={s.image_url}
              description={s.description}
              thread_count={s.thread_count ?? 0}
              has_ai_summary={!!s.has_ai_summary}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Tabs({
  current,
  categories,
  sort,
}: {
  current: string;
  categories: string[];
  sort: string;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((c) => {
        const active = c === current;
        const params = new URLSearchParams();
        if (c !== "すべて") params.set("category", c);
        params.set("sort", sort);
        return (
          <a
            key={c}
            href={`/sake?${params.toString()}`}
            className={
              active
                ? "bg-[color:var(--color-accent-strong)] px-3 py-2 text-xs font-semibold text-[color:var(--color-ink-950)]"
                : "border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-[color:var(--color-ink-200)] hover:bg-white/[0.06]"
            }
          >
            {c}
          </a>
        );
      })}
    </div>
  );
}

function SortBar({
  sort,
  category,
  options,
}: {
  sort: string;
  category: string;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-ink-300)]">
      <span>並び替え</span>
      {options.map((o) => {
        const params = new URLSearchParams();
        if (category !== "すべて") params.set("category", category);
        params.set("sort", o.key);
        const active = sort === o.key;
        return (
          <a
            key={o.key}
            href={`/sake?${params.toString()}`}
            className={
              active
                ? "bg-white/10 px-2 py-1 text-[color:var(--color-ink-100)]"
                : "px-2 py-1 hover:bg-white/5"
            }
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
