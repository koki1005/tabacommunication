import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function yen(n: number | null | undefined) {
  if (n == null) return "—";
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function ratio(n: number | null | undefined, suffix = "") {
  if (n == null) return "—";
  return `${n}${suffix}`;
}
