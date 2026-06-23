import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";

type Payload = {
  target_type?: "sake" | "tobacco";
  device_id?: string;
  picks?: { rank: 1 | 2 | 3; target_id: string }[];
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { target_type, device_id, picks } = body;
  if (!target_type || !device_id || !Array.isArray(picks) || picks.length === 0) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const ranks = new Set(picks.map((p) => p.rank));
  if (ranks.size !== picks.length) {
    return NextResponse.json({ error: "duplicate rank" }, { status: 400 });
  }
  const ids = new Set(picks.map((p) => p.target_id));
  if (ids.size !== picks.length) {
    return NextResponse.json({ error: "duplicate target" }, { status: 400 });
  }

  const service = createSupabaseService();

  const { count } = await service
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("target_type", target_type)
    .eq("device_id", device_id);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "already voted" }, { status: 409 });
  }

  const rows = picks.map((p) => ({
    target_type,
    target_id: p.target_id,
    rank: p.rank,
    device_id,
  }));
  const { error } = await service.from("votes").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
