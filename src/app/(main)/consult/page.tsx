import { ConsultClient } from "./ConsultClient";

export const dynamic = "force-dynamic";

export default function ConsultPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-2 border border-[color:var(--color-danger)]/50 bg-[color:var(--color-danger)]/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[color:var(--color-danger-strong)]">
          new in v5 · 使い捨て
        </div>
        <h1 className="text-2xl font-bold">アウト／セーフ相談</h1>
        <p className="text-xs text-[color:var(--color-ink-300)] sm:text-sm">
          「これってアリ❓」を具体的に書くと、日本の現行法ベースで判定するちゃむ。送信内容も結果も
          <span className="font-bold text-[color:var(--color-ink-100)]"> 保存しない </span>
          ちゃむ。ページを閉じたら消えるちゃむ。
        </p>
      </header>
      <ConsultClient />
    </div>
  );
}
