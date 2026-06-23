import { CatalogCard } from "@/components/CatalogCard";
import { EmptyState } from "@/components/EmptyState";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Search = { sort?: string };

export default async function TobaccoListPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const sort =
    sp.sort === "tar" ? "tar" :
    sp.sort === "nicotine" ? "nicotine" :
    sp.sort === "price" ? "price" : "name";

  let rows: any[] = [];
  let error: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data, error: e } = await supabase
      .from("tobacco_with_stats")
      .select("*")
      .order(sort, { ascending: true, nullsFirst: false });
    if (e) throw e;
    rows = data ?? [];
  } catch (e: any) {
    error = e?.message ?? "Supabase に接続できないちゃむ";
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">タバコ</h1>
      <SortBar
        sort={sort}
        options={[
          { key: "name", label: "名前" },
          { key: "tar", label: "タール" },
          { key: "nicotine", label: "ニコチン" },
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
          {rows.map((t) => (
            <CatalogCard
              key={t.id}
              kind="tobacco"
              id={t.id}
              name={t.name}
              price={t.price}
              tar={t.tar}
              nicotine={t.nicotine}
              count_per_pack={t.count_per_pack}
              image_url={t.image_url}
              description={t.description}
              thread_count={t.thread_count ?? 0}
              has_ai_summary={!!t.has_ai_summary}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SortBar({
  sort,
  options,
}: {
  sort: string;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-ink-300)]">
      <span>並び替え</span>
      {options.map((o) => {
        const params = new URLSearchParams();
        params.set("sort", o.key);
        const active = sort === o.key;
        return (
          <a
            key={o.key}
            href={`/tobacco?${params.toString()}`}
            className={
              active
                ? "rounded-md bg-white/10 px-2 py-1 text-[color:var(--color-ink-100)]"
                : "rounded-md px-2 py-1 hover:bg-white/5"
            }
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
