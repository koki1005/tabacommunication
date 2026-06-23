"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/sake", label: "お酒" },
  { href: "/tobacco", label: "タバコ" },
  { href: "/law", label: "法律", danger: true },
  { href: "/columns", label: "コラム" },
  { href: "/vote", label: "人気投票" },
  { href: "/others", label: "その他" },
];

export function SectionNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap">
      {SECTIONS.map((s) => {
        const active = pathname === s.href || pathname.startsWith(s.href + "/");
        return (
          <Link
            key={s.href}
            href={s.href}
            className={
              "flex min-h-11 items-center justify-center px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wider sm:px-3 sm:text-xs sm:tracking-widest " +
              (active
                ? "border border-[color:var(--color-accent-strong)] bg-[color:var(--color-accent-strong)]/15 text-[color:var(--color-accent-strong)]"
                : s.danger
                ? "border border-[color:var(--color-danger)]/50 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger-strong)] hover:bg-[color:var(--color-danger)]/20"
                : "border border-white/15 bg-white/[0.04] text-[color:var(--color-ink-100)] hover:bg-white/[0.08]")
            }
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
