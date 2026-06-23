"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/deviceId";

type Item = { id: string; name: string };

const VOTED_KEY = "tabacommunication_voted";

function readVoted(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VOTED_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeVoted(target: "sake" | "tobacco") {
  const v = readVoted();
  v[target] = true;
  window.localStorage.setItem(VOTED_KEY, JSON.stringify(v));
}

export function VotePanel({
  items,
  target_type,
}: {
  items: Item[];
  target_type: "sake" | "tobacco";
}) {
  const router = useRouter();
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDone(!!readVoted()[target_type]);
  }, [target_type]);

  const disabled = !first || !second || !third || pending || done;

  function options(exclude: string[]) {
    return items.filter((i) => !exclude.includes(i.id));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            target_type,
            device_id: getDeviceId(),
            picks: [
              { rank: 1, target_id: first },
              { rank: 2, target_id: second },
              { rank: 3, target_id: third },
            ],
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (res.status === 409) {
            writeVoted(target_type);
            setDone(true);
            return;
          }
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        writeVoted(target_type);
        setDone(true);
        router.refresh();
      } catch (e: any) {
        setError(e.message ?? "投票に失敗したちゃむ");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-md border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent)]/10 px-3 py-2 text-xs text-[color:var(--color-accent-strong)]">
        この端末はもう投票したちゃむ。ありがとうちゃむ。
      </div>
    );
  }

  if (items.length < 3) {
    return (
      <div className="text-xs text-[color:var(--color-ink-300)]">
        投票に必要な銘柄が3つ集まってないちゃむ。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[
        { rank: 1, value: first, setter: setFirst, pts: 3 },
        { rank: 2, value: second, setter: setSecond, pts: 2 },
        { rank: 3, value: third, setter: setThird, pts: 1 },
      ].map(({ rank, value, setter, pts }) => (
        <label key={rank} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-[color:var(--color-ink-300)]">
            {rank}位 ({pts}pt)
          </span>
          <select
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-[color:var(--color-ink-900)] px-2 py-2 text-sm text-[color:var(--color-ink-100)] outline-none focus:border-[color:var(--color-accent-strong)]"
          >
            <option value="">— 選ぶ —</option>
            {options(
              rank === 1
                ? [second, third]
                : rank === 2
                ? [first, third]
                : [first, second]
            ).map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        className="w-full rounded-md bg-[color:var(--color-accent-strong)] px-3 py-2 text-sm font-semibold text-[color:var(--color-ink-950)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "送信中…" : "投票する"}
      </button>
      {error ? <div className="text-xs text-[color:var(--color-danger-strong)]">{error}</div> : null}
    </div>
  );
}
