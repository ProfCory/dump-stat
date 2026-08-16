import type { ReactNode } from "react"
import { SOURCEBOOK_HERO_IMAGE } from "@/lib/site-images"

/**
 * Sourcebook-styled page header that carries the home page hero artwork across
 * the app. Renders as a self-contained dark banner strip so it can sit above the
 * light "parchment" working surfaces without affecting their readability.
 */
export function SourcebookBanner({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  /** Optional controls rendered on the right (e.g. import / new buttons). */
  actions?: ReactNode
  /** Tighter vertical footprint for tool pages (e.g. the builder wizard). */
  compact?: boolean
}) {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-[#d0b478]/25 bg-[#0d0c0b] text-[#ece3d2]"
      style={{
        backgroundImage: `url(${SOURCEBOOK_HERO_IMAGE})`,
        backgroundPosition: "center 28%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,7,6,.95) 0%, rgba(7,7,6,.74) 46%, rgba(7,7,6,.36) 100%), linear-gradient(0deg, rgba(7,7,6,.86), transparent 62%)",
        }}
      />
      <div className="absolute -right-24 top-8 -z-10 h-64 w-64 rounded-full bg-[#315f50]/20 blur-[80px]" />

      <div
        className={`mx-auto flex w-[min(1180px,calc(100%-2rem))] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
          compact ? "py-6 sm:py-7" : "py-10 sm:py-12"
        }`}
      >
        <div className="min-w-0">
          {eyebrow ? (
            <p
              className={`font-bold uppercase tracking-[0.22em] text-[#edcd85] ${
                compact ? "mb-2 text-[11px]" : "mb-3 text-xs"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`font-normal leading-[0.95] tracking-[-0.03em] text-[#f1e9da] [text-shadow:0_4px_24px_rgba(0,0,0,.7)] ${
              compact
                ? "text-[clamp(1.7rem,4vw,2.5rem)]"
                : "text-[clamp(2.1rem,5vw,3.4rem)]"
            }`}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`max-w-2xl leading-7 text-[#cbc0af] ${
                compact ? "mt-2 text-sm" : "mt-4 text-base"
              }`}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}
