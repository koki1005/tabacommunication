import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseService } from "@/lib/supabase/server";
import { polishPost, summarizeThreads } from "@/lib/gemini";

const SUMMARY_TRIGGER = 10;

export async function POST(req: Request) {
  let payload: {
    target_type?: "sake" | "tobacco" | "column";
    target_id?: string;
    display_name?: string | null;
    body?: string;
    device_id?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { target_type, target_id, display_name, body, device_id } = payload;
  if (!target_type || !target_id || !body || body.trim().length === 0) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (body.length > 800) {
    return NextResponse.json({ error: "too long" }, { status: 400 });
  }

  // 1) 整文・健康注記・最小検閲
  let polished: { body: string; is_health_note: boolean; rejected: boolean; reason?: string };
  try {
    polished = await polishPost(body);
  } catch (e: any) {
    // Gemini 未設定でも投稿自体は通す（生のまま、注記なし）
    polished = { body, is_health_note: false, rejected: false };
  }
  if (polished.rejected) {
    return NextResponse.json(
      { error: "rejected", reason: polished.reason ?? "個人特定または攻撃と判定されたちゃむ" },
      { status: 422 }
    );
  }

  // 2) 保存
  const supabase = await createSupabaseServer();
  const { error: insertError, data: inserted } = await supabase
    .from("threads")
    .insert({
      target_type,
      target_id,
      display_name: display_name?.trim() || null,
      body: polished.body,
      is_health_note: polished.is_health_note,
      device_id: device_id ?? null,
    })
    .select("id")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 3) 10件超なら AI 要約を生成・更新（fire-and-await でいいが、失敗は黙殺）
  try {
    const { count } = await supabase
      .from("threads")
      .select("id", { count: "exact", head: true })
      .eq("target_type", target_type)
      .eq("target_id", target_id);
    if ((count ?? 0) > SUMMARY_TRIGGER) {
      const { data: bodies } = await supabase
        .from("threads")
        .select("body")
        .eq("target_type", target_type)
        .eq("target_id", target_id)
        .order("created_at", { ascending: false })
        .limit(80);
      const list = (bodies ?? []).map((r: any) => r.body as string);
      const summary = await summarizeThreads(list);
      const service = createSupabaseService();
      await service.from("ai_summaries").upsert(
        {
          target_type,
          target_id,
          summary,
          source_thread_count: count ?? list.length,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "target_type,target_id" }
      );
    }
  } catch {
    // 要約失敗は投稿そのものを失敗扱いにしない
  }

  return NextResponse.json({ ok: true, id: inserted?.id });
}
