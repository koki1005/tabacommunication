import { NextResponse } from "next/server";
import { consultLegalLine } from "@/lib/gemini";

export async function POST(req: Request) {
  let payload: { situation?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const situation = (payload.situation ?? "").trim();
  if (!situation) {
    return NextResponse.json({ error: "状況を入力してほしいちゃむ" }, { status: 400 });
  }
  if (situation.length > 600) {
    return NextResponse.json({ error: "600文字以内で入れてちゃむ" }, { status: 400 });
  }

  try {
    const result = await consultLegalLine(situation);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "gemini error";
    return NextResponse.json({ error: `AI 呼び出し失敗ちゃむ: ${msg}` }, { status: 502 });
  }
}
