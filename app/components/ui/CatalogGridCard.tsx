import Image from "next/image";
import type { KeyboardEvent, ReactNode } from "react";

type CatalogGridCardProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  meta: string;
  description: string;
  onActivate: () => void;
  children?: ReactNode;
  imageProps?: {
    unoptimized?: boolean;
    onError?: () => void;
  };
};

export function CatalogGridCard({
  imageSrc,
  imageAlt,
  title,
  meta,
  description,
  onActivate,
  children,
  imageProps,
}: CatalogGridCardProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:-translate-y-1 hover:border-sky-300/40"
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          unoptimized={imageProps?.unoptimized}
          onError={imageProps?.onError}
        />
      </div>

      <div className="space-y-2 p-3">
        <p className="line-clamp-1 font-semibold text-white">{title}</p>
        <p className="text-xs uppercase tracking-wide text-slate-300">{meta}</p>
        <p className="line-clamp-2 text-xs text-slate-400">{description}</p>
        {children}
      </div>
    </article>
  );
}

