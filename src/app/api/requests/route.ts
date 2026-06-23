import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let body: { target_type?: "sake" | "tobacco" | "other"; name?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { target_type, name, note } = body;
  if (!target_type || !name || !name.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (name.length > 80 || (note && note.length > 400)) {
    return NextResponse.json({ error: "too long" }, { status: 400 });
  }
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("requests")
    .insert({ target_type, name: name.trim(), note: note?.trim() || null });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
