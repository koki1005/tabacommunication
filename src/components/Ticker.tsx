import { createSupabaseServer } from "@/lib/supabase/server";
import { TickerRotator, type TickerItem } from "./TickerRotator";

const FALLBACK_ITEMS: TickerItem[] = [
  {
    id: "fb-0",
    tag: "法律",
    title: "未成年飲酒禁止法",
    body: "20歳未満の飲酒は禁止。違反すると親権者や販売側にも罰則が及ぶ。",
    href: "/law",
  },
  {
    id: "fb-1",
    tag: "法律",
    title: "道路交通法第65条",
    body: "酒気帯び・酒酔いいずれも厳罰。同乗者・酒類提供者にも罰則。",
    href: "/law",
  },
  {
    id: "fb-2",
    tag: "コラム",
    title: "二日酔いの正体",
    body: "アセトアルデヒドが残ってる状態ちゃむ。水と糖分で代謝を助けるのが基本。",
    href: "/columns",
  },
  {
    id: "fb-3",
    tag: "法律",
    title: "健康増進法第25条",
    body: "公共の場・飲食店は原則屋内禁煙。違反は過料の対象。",
    href: "/law",
  },
  {
    id: "fb-4",
    tag: "コラム",
    title: "タールとニコチンの違い",
    body: "タールは発がん性物質の塊、ニコチンは依存性の本体ちゃむ。",
    href: "/columns",
  },
];

export async function Ticker() {
  let items: TickerItem[] = [];
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("columns")
      .select("id,title,body,tag")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data && data.length > 0) {
      items = data.map((r: { id: string; title: string; body: string; tag: string }) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        tag: r.tag === "法律" ? "法律" : "コラム",
        href: r.tag === "法律" ? "/law" : `/columns/${r.id}`,
      }));
    }
  } catch {
    // Supabase not configured yet – fall through to fallback.
  }

  const list = items.length > 0 ? items : FALLBACK_ITEMS;
  return (
    <div className="ticker-shell">
      <TickerRotator items={list} />
    </div>
  );
}
