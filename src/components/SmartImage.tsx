"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  fit?: "cover" | "contain";
};

export function SmartImage({ src, alt, sizes, className, fit = "cover" }: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="grid h-full w-full place-items-center bg-[color:var(--color-ink-900)] text-[color:var(--color-ink-400)]">
        <span className="text-[10px] tracking-widest">NO IMAGE</span>
      </div>
    );
  }

  if (fit === "contain") {
    return (
      <>
        <div aria-hidden className="absolute inset-0 bg-white" />
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`object-contain ${className ?? ""}`}
          onError={() => setErrored(true)}
          unoptimized
        />
      </>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}
