import Link from "next/link";
import { SmartImage } from "@/components/SmartImage";
import { yen } from "@/lib/utils";

type Common = {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  description: string | null;
  thread_count?: number;
  has_ai_summary?: boolean;
};

type SakeProps = Common & {
  kind: "sake";
  abv: number | null;
  category: string;
  volume_ml: number | null;
};

type TobaccoProps = Common & {
  kind: "tobacco";
  tar: number | null;
  nicotine: number | null;
  count_per_pack: number | null;
};

export function CatalogCard(props: SakeProps | TobaccoProps) {
  const href = `/${props.kind}/${props.id}`;
  return (
    <Link
      href={href}
      className="card-shine group flex flex-col overflow-hidden rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-strong)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--color-ink-900)]">
        <SmartImage
          src={props.image_url}
          alt={props.name}
          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 33vw"
          fit="contain"
          className="transition group-hover:scale-[1.03]"
        />
        <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
          {props.has_ai_summary ? (
            <span className="badge badge-accent">AI</span>
          ) : null}
          {typeof props.thread_count === "number" && props.thread_count > 0 ? (
            <span className="badge">{props.thread_count}</span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 p-2 sm:p-2.5">
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-[color:var(--color-ink-100)]">
          {props.name}
        </h3>
        <div className="flex flex-col gap-0.5 text-[11px] text-[color:var(--color-ink-300)] sm:flex-row sm:items-center sm:justify-between sm:gap-1">
          {props.kind === "sake" ? (
            <>
              <span className="truncate">
                {props.category} · {props.abv ?? "—"}% · {props.volume_ml != null ? `${props.volume_ml}ml` : "—"}
              </span>
              <span className="shrink-0 text-[color:var(--color-ink-200)]">{yen(props.price)}</span>
            </>
          ) : (
            <>
              <span className="truncate">T{props.tar ?? "—"} · N{props.nicotine ?? "—"} · {props.count_per_pack ?? "—"}本</span>
              <span className="shrink-0 text-[color:var(--color-ink-200)]">{yen(props.price)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
