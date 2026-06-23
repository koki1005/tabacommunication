import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[color:var(--color-ink-950)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
        <Link href="/sake" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="font-brush grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[color:var(--color-ink-700)] text-lg text-[color:var(--color-accent-strong)] sm:h-10 sm:w-10 sm:text-xl">
            煙
          </span>
          <div className="min-w-0 leading-tight">
            <div className="font-brush truncate text-base text-[color:var(--color-ink-100)] sm:text-xl md:text-2xl">
              たばこみゅにけーしょん
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
