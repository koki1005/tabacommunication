import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ColumnRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const THEMES = [
  "すべて",
  "酒",
  "タバコ",
  "性犯罪・青少年",
  "薬物",
  "自転車・道交法",
  "著作権・情報",
  "軽犯罪・公共",
  "賭博・金銭",
  "SNS・ストーカー",
  "その他",
];

function classify(title: string, body: string) {
  const t = `${title} ${body}`;
  // 性犯罪・青少年（淫行条例・不同意性交・盗撮・リベンジポルノ・AV出演）
  if (/淫行|青少年保護|不同意性交|性交同意|リベンジポルノ|私事性的画像|盗撮|性的姿態|AV出演/.test(t)) {
    return "性犯罪・青少年";
  }
  // 薬物（大麻・指定薬物・OD・処方薬譲渡）
  if (/大麻|麻薬|向精神薬|指定薬物|オーバードーズ|薬機法|処方薬/.test(t)) {
    return "薬物";
  }
  // 自転車・道交法（自転車・原付・道交法・電動キックボード・共同危険）
  if (/自転車|道路交通法|道交法|原付|無免許|ヘルメット|電動キックボード|共同危険/.test(t)) {
    return "自転車・道交法";
  }
  // 著作権・情報（違法DL・著作権・不正アクセス・海賊版）
  if (/著作権|違法ダウンロード|違法アップロード|不正アクセス|海賊版|リーチサイト|コピペ/.test(t)) {
    return "著作権・情報";
  }
  // 賭博・金銭（オンラインカジノ・賭博・闇バイト・現金化）
  if (/賭博|カジノ|闇バイト|現金化|特殊詐欺|麻雀.*賭/.test(t)) {
    return "賭博・金銭";
  }
  // SNS・ストーカー（誹謗中傷・つきまとい）
  if (/ストーカー|つきまとい|誹謗中傷|侮辱罪|名誉毀損/.test(t)) {
    return "SNS・ストーカー";
  }
  // タバコ（喫煙・タバコ・健康増進法・加熱式・路上喫煙・20歳未満喫煙）
  if (/喫煙|タバコ|健康増進法|加熱式|路上喫煙|20歳未満ノ者ノ喫煙|未成年.*喫煙/.test(t)) {
    return "タバコ";
  }
  // 酒（飲酒・酒気帯び・アルハラ・酩酊・未成年飲酒・20歳未満飲酒）
  if (/飲酒|酒気帯び|酩酊|アルハラ|二十歳未満ノ者ノ飲酒|未成年.*酒|未成年に酒/.test(t)) {
    return "酒";
  }
  // 軽犯罪・公共（軽犯罪法・器物損壊・落書き・偽造身分証・万引き・喧嘩・置き引き・暴行・傷害）
  if (/軽犯罪|器物損壊|落書き|偽造|万引き|無銭飲食|置き引き|喧嘩|暴行|傷害|窃盗|盗品|騒音/.test(t)) {
    return "軽犯罪・公共";
  }
  // カンニング・代理受験
  if (/カンニング|代理受験|代返/.test(t)) {
    return "軽犯罪・公共";
  }
  return "その他";
}

export default async function LawPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const sp = await searchParams;
  const theme = sp.theme && sp.theme !== "すべて" ? sp.theme : null;

  let rows: ColumnRow[] = [];
  let error: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data, error: e } = await supabase
      .from("columns")
      .select("*")
      .eq("tag", "法律")
      .order("created_at", { ascending: false });
    if (e) throw e;
    rows = data ?? [];
  } catch (e: any) {
    error = e?.message ?? "Supabase に接続できないちゃむ";
  }

  const filtered = theme ? rows.filter((r) => classify(r.title, r.body) === theme) : rows;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">法律</h1>
      <div className="flex flex-wrap gap-1">
        {THEMES.map((th) => {
          const active = (theme ?? "すべて") === th;
          const href = th === "すべて" ? "/law" : `/law?theme=${encodeURIComponent(th)}`;
          return (
            <a
              key={th}
              href={href}
              className={
                active
                  ? "rounded-full bg-[color:var(--color-danger-strong)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-ink-950)]"
                  : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[color:var(--color-ink-200)] hover:bg-white/[0.06]"
              }
            >
              {th}
            </a>
          );
        })}
      </div>

      {error ? (
        <EmptyState title="DB 未接続" hint={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="記事がないちゃむ" />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/columns/${r.id}`}
                className="block rounded-xl border border-[color:var(--color-danger)]/30 bg-gradient-to-b from-[color:var(--color-danger)]/10 to-transparent p-4 transition hover:border-[color:var(--color-danger-strong)]/70 hover:bg-[color:var(--color-danger)]/15 sm:p-5"
              >
                <div className="mb-1 inline-flex items-center gap-2 text-[10px] tracking-widest text-[color:var(--color-danger-strong)]">
                  法律 / {classify(r.title, r.body)}
                </div>
                <h2 className="text-lg font-bold text-[color:var(--color-ink-100)]">{r.title}</h2>
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-200)]">
                  {r.body}
                </p>
                <div className="mt-3 text-[11px] text-[color:var(--color-ink-300)]">
                  詳細と投稿を見るちゃむ →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
