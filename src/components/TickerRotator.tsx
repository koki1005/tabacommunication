"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type TickerItem = {
  id: string;
  title: string;
  body: string;
  tag: "法律" | "コラム";
  href: string;
};

function excerpt(s: string, n = 80) {
  const trimmed = s.replace(/\s+/g, " ").trim();
  return trimmed.length > n ? `${trimmed.slice(0, n)}…` : trimmed;
}

export function TickerRotator({ items }: { items: TickerItem[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const cur = items[idx];
  const isLaw = cur.tag === "法律";

  return (
    <div className="ticker-stage">
      <Link
        key={`${cur.id}-${idx}`}
        href={cur.href}
        className="ticker-card"
      >
        <span
          className={
            isLaw
              ? "ticker-badge ticker-badge-law"
              : "ticker-badge ticker-badge-col"
          }
        >
          {cur.tag}
        </span>
        <div className="ticker-text">
          <div className="ticker-title">{cur.title}</div>
          <div className="ticker-body">{excerpt(cur.body)}</div>
        </div>
      </Link>
    </div>
  );
}
