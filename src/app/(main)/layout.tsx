import { SectionNav } from "@/components/SectionNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[color:var(--color-ink-800)] via-[color:var(--color-ink-700)] to-[color:var(--color-ink-900)] p-4 sm:p-5 md:p-7">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-[color:var(--color-ink-200)]">
            <span className="inline-block h-1.5 w-1.5 bg-[color:var(--color-accent-strong)]" />
            たばこみゅにけーしょん
          </div>
          <h1 className="font-brush text-xl leading-tight sm:text-2xl md:text-4xl">
            酒・タバコの一覧ページ×みんなの声<span className="text-[color:var(--color-accent-strong)]">.</span>
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-ink-200)] sm:mt-3 md:text-sm">
            カードをタップで詳細に飛んで、みんなの偏見や豆知識を読めるし、自分も匿名で書き込めるちゃむ。
          </p>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 hidden h-56 w-56 bg-[color:var(--color-accent)]/10 blur-3xl md:block" />
      </section>

      <SectionNav />

      {children}
    </div>
  );
}
