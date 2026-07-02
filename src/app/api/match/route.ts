import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { matchRecommend, SafetyBlockedError } from "@/lib/gemini";

type MatchBody = {
  target?: "sake" | "tobacco";
  answers?: Record<string, string>;
};

export async function POST(req: Request) {
  let payload: MatchBody;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { target, answers } = payload;
  if (target !== "sake" && target !== "tobacco") {
    return NextResponse.json({ error: "target must be sake or tobacco" }, { status: 400 });
  }
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "answers required" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  let candidates: Array<Record<string, unknown> & { id: string; name: string }> = [];
  try {
    if (target === "sake") {
      const { data, error } = await supabase
        .from("sake")
        .select("id, name, category, abv, price, volume_ml, description")
        .limit(60);
      if (error) throw error;
      candidates = (data ?? []) as typeof candidates;
    } else {
      const { data, error } = await supabase
        .from("tobacco")
        .select("id, name, price, tar, nicotine, count_per_pack, description")
        .limit(60);
      if (error) throw error;
      candidates = (data ?? []) as typeof candidates;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "supabase error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "図鑑にまだ銘柄が無いちゃむ" },
      { status: 404 },
    );
  }

  let picks: Array<{ id: string; reason: string }> = [];
  try {
    picks = await matchRecommend(target, answers, candidates);
  } catch (e: unknown) {
    if (e instanceof SafetyBlockedError) {
      return NextResponse.json(
        { error: "AI が回答を拒否したちゃむ。回答内容をやわらかく変えて、もう一度診断してほしいちゃむ。" },
        { status: 400 },
      );
    }
    const msg = e instanceof Error ? e.message : "gemini error";
    return NextResponse.json({ error: `AI 呼び出し失敗ちゃむ: ${msg}` }, { status: 502 });
  }

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const enriched = picks
    .map((p) => {
      const item = byId.get(p.id);
      return item ? { ...item, reason: p.reason } : null;
    })
    .filter(Boolean);

  return NextResponse.json({ ok: true, target, picks: enriched });
}
