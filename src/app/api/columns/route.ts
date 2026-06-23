import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseService } from "@/lib/supabase/server";
import { factcheckColumn, polishPost } from "@/lib/gemini";

export async function POST(req: Request) {
  let payload: {
    title?: string;
    body?: string;
    tag?: string;
    author_name?: string | null;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { title, body, tag, author_name } = payload;
  if (!title || !body || !title.trim() || !body.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (title.length > 80 || body.length > 3000) {
    return NextResponse.json({ error: "too long" }, { status: 400 });
  }

  // 1) 軽い検閲（個人特定情報・特定攻撃のみ弾く）
  let polishedBody = body;
  try {
    const p = await polishPost(body);
    if (p.rejected) {
      return NextResponse.json(
        { error: "rejected", reason: p.reason ?? "個人特定または攻撃と判定されたちゃむ" },
        { status: 422 }
      );
    }
    polishedBody = p.body;
  } catch {
    // Gemini 未設定なら素のまま通す
  }

  // 2) AIファクトチェック（Gemini が無い場合は null のまま保存）
  let factcheck: string | null = null;
  try {
    factcheck = await factcheckColumn(title, polishedBody);
  } catch {
    factcheck = null;
  }

  // 3) 保存
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("columns")
    .insert({
      title: title.trim(),
      body: polishedBody,
      tag: tag?.trim() || "ノウハウ",
      author_name: author_name?.trim() || null,
      is_user_submitted: true,
      ai_factcheck: factcheck,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data?.id });
}
