"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, Upload } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { WelcomeSplashOverlay } from "@/components/home/welcome-splash-overlay"
import { useAppPresentationMode } from "@/components/settings/use-app-presentation-mode"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/db/client"
import { FEATURE_CARD_IMAGES, LIBRARY_STATS_BACKGROUND } from "@/lib/site-images"
import {
  getCustomHeroBackground,
  HERO_BG_CHANGE_EVENT,
} from "@/lib/site-settings/hero-background"

const SOURCEBOOK_HERO =
  "https://profcory.github.io/5.5e-Sheets/assets/hero-sourcebook.webp"

const features = [
  {
    href: "/builder",
    image: FEATURE_CARD_IMAGES.characterCreation,
    title: "Shape a Character",
    eyebrow: "The builder",
    description:
      "Build step by step with live calculations for species, backgrounds, multiclass levels, spells, and equipment.",
  },
  {
    href: "/compendium",
    image: FEATURE_CARD_IMAGES.compendium,
    title: "Curate the Archive",
    eyebrow: "The compendium",
    description:
      "Browse the bundled SRD, edit its entries, and add the homebrew rules that belong at your table.",
  },
  {
    href: "/characters",
    image: FEATURE_CARD_IMAGES.characterSheet,
    title: "Carry the Legend",
    eyebrow: "The character sheet",
    description:
      "Play with clickable rolls, editable health, spell-slot tracking, conditions, weapons, and table-ready tools.",
  },
  {
    href: "/import",
    image: FEATURE_CARD_IMAGES.importContent,
    title: "Bring Your Own Lore",
    eyebrow: "Import & share",
    description:
      "Import JSON packs, structured homebrew, approved shared content, and Foundry-compatible exports.",
  },
  {
    href: "/characters",
    image: FEATURE_CARD_IMAGES.appearance,
    title: "Make It Yours",
    eyebrow: "Presentation",
    description:
      "Choose a theme, switch between visual and compact modes, and give the workshop your preferred atmosphere.",
  },
  {
    href: "/import",
    image: FEATURE_CARD_IMAGES.exportDatabase,
    title: "Keep the Record",
    eyebrow: "Storage",
    description:
      "Save in your browser, export portable data, and move characters or compendium material between devices.",
  },
]

type LibraryStats = {
  classes: number
  species: number
  backgrounds: number
  spells: number
  feats: number
  subclasses: number
  equipment: number
}

export default function HomePage() {
  const { isCompactOnly } = useAppPresentationMode()
  const [stats, setStats] = useState<LibraryStats>({
    classes: 0,
    species: 0,
    backgrounds: 0,
    spells: 0,
    feats: 0,
    subclasses: 0,
    equipment: 0,
  })
  const [heroBackground, setHeroBackground] = useState(SOURCEBOOK_HERO)

  useEffect(() => {
    const syncHero = () => {
      setHeroBackground(getCustomHeroBackground() ?? SOURCEBOOK_HERO)
    }
    syncHero()
    window.addEventListener(HERO_BG_CHANGE_EVENT, syncHero)
    return () => window.removeEventListener(HERO_BG_CHANGE_EVENT, syncHero)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      const db = createClient()
      const [
        { count: classes },
        { count: species },
        { count: backgrounds },
        { count: spells },
        { count: feats },
        { count: subclasses },
        { count: equipment },
      ] = await Promise.all([
        db.from("classes").select("*", { count: "exact", head: true }),
        db.from("species").select("*", { count: "exact", head: true }),
        db.from("backgrounds").select("*", { count: "exact", head: true }),
        db.from("spells").select("*", { count: "exact", head: true }),
        db.from("feats").select("*", { count: "exact", head: true }),
        db.from("subclasses").select("*", { count: "exact", head: true }),
        db.from("equipment").select("*", { count: "exact", head: true }),
      ])
      setStats({
        classes: classes ?? 0,
        species: species ?? 0,
        backgrounds: backgrounds ?? 0,
        spells: spells ?? 0,
        feats: feats ?? 0,
        subclasses: subclasses ?? 0,
        equipment: equipment ?? 0,
      })
    }
    void fetchStats()
  }, [])

  const libraryStatItems = [
    { value: stats.classes, label: "Classes" },
    { value: stats.subclasses, label: "Subclasses" },
    { value: stats.species, label: "Species" },
    { value: stats.backgrounds, label: "Backgrounds" },
    { value: stats.spells, label: "Spells" },
    { value: stats.feats, label: "Feats" },
    { value: stats.equipment, label: "Equipment" },
  ]

  return (
    <div id="home-root" className="min-h-screen bg-[#0d0c0b] text-[#ece3d2]">
      <WelcomeSplashOverlay />
      <MainNav variant="sourcebook" />

      <main id="home-main">
        <section
          id="hero-section"
          className="relative isolate min-h-[760px] overflow-hidden border-b border-[#d0b478]/20 bg-[#090908] lg:min-h-[calc(100svh-4rem)]"
          style={
            isCompactOnly
              ? undefined
              : {
                  backgroundImage: `url(${heroBackground})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }
          }
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: isCompactOnly
                ? "radial-gradient(circle at 75% 25%, rgba(85,64,110,.32), transparent 38%), linear-gradient(135deg,#090908,#17130f)"
                : "linear-gradient(90deg, rgba(7,7,6,.97) 0%, rgba(7,7,6,.78) 37%, rgba(7,7,6,.14) 70%, rgba(7,7,6,.28) 100%), linear-gradient(0deg, rgba(7,7,6,.88), transparent 44%)",
            }}
          />
          <div className="absolute -right-24 top-24 -z-10 h-96 w-96 rounded-full bg-[#315f50]/20 blur-[90px]" />
          <div className="absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-[#5f211f]/25 blur-[90px]" />

          <div className="mx-auto flex min-h-[696px] w-[min(1180px,calc(100%-2rem))] items-center py-20 sm:w-[min(1180px,calc(100%-3rem))] lg:min-h-[calc(100svh-4rem)]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-[42rem] lg:pr-8"
            >
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#edcd85]">
                Dump Stat · A 5.5e character workshop
              </p>
              <h1
                className="max-w-[11ch] text-[clamp(3.7rem,8vw,7rem)] font-normal leading-[0.88] tracking-[-0.045em] text-[#f1e9da] [text-shadow:0_6px_34px_rgba(0,0,0,.72)]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Build the hero. Keep the legend.
              </h1>
              <div className="mt-9 h-px w-32 bg-gradient-to-r from-[#edcd85] to-transparent" />
              <p
                className="mt-7 max-w-[36rem] text-lg leading-8 text-[#cbc0af] sm:text-xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                A full SRD compendium, automatic character calculations, homebrew editors,
                and import workflows—ready for the rules and stories you bring to the table.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/builder"
                  className="inline-flex items-center justify-center gap-3 border border-[#f0d897] bg-gradient-to-br from-[#e4c579] to-[#a9874d] px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#1b150e] shadow-[0_10px_36px_rgba(0,0,0,.4)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Create a character
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/compendium"
                  className="inline-flex items-center justify-center gap-3 border border-[#d0b478]/35 bg-black/40 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#ece3d2] backdrop-blur-sm transition hover:border-[#edcd85]/70 hover:text-[#edcd85]"
                >
                  <BookOpen className="h-4 w-4" />
                  Open the compendium
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#ece3d2]/10 bg-black/35 backdrop-blur-sm">
            <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] grid-cols-3 divide-x divide-[#ece3d2]/10 py-4 text-center sm:w-[min(1180px,calc(100%-3rem))]">
              {["SRD 5.2.1 bundled", "Homebrew ready", "Saved in your browser"].map((item) => (
                <p key={item} className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b9ad99] sm:text-xs">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section id="features-section" className="relative overflow-hidden bg-[#0d0c0b] px-4 py-24 sm:px-6">
          <div className="absolute left-[10%] top-16 h-64 w-64 rounded-full bg-[#5f211f]/10 blur-[100px]" />
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-12 grid gap-8 border-b border-[#d0b478]/20 pb-10 md:grid-cols-[1fr_1.1fr] md:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#edcd85]">
                  The workshop
                </p>
                <h2
                  className="text-[clamp(2.7rem,6vw,5rem)] font-normal leading-none tracking-[-0.04em] text-[#ece3d2]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Everything the character needs.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#b9ad99] md:justify-self-end">
                Build, browse, play, import, and preserve your collection without turning the
                homepage into a control panel from an accounting dungeon.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: Math.min(index * 0.08, 0.3) }}
                >
                  <Link
                    href={feature.href}
                    className="group relative flex min-h-[25rem] overflow-hidden border border-[#d0b478]/20 bg-[#17140f] shadow-[0_18px_60px_rgba(0,0,0,.22)] transition duration-300 hover:-translate-y-1 hover:border-[#edcd85]/45 hover:shadow-[0_24px_70px_rgba(0,0,0,.38)]"
                  >
                    {!isCompactOnly ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={feature.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05] group-hover:saturate-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a09] via-[#0b0a09]/85 to-[#0b0a09]/15" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1813] to-[#0b0a09]" />
                    )}
                    <div className="relative mt-auto p-7">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#edcd85]">
                        {feature.eyebrow}
                      </p>
                      <h3
                        className="text-3xl font-normal tracking-[-0.025em] text-[#f1e9da]"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#c8bdad]">{feature.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#edcd85]">
                        Enter
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="library-stats-section"
          className="relative isolate overflow-hidden border-t border-[#d0b478]/20 px-4 py-24 sm:px-6"
          style={
            isCompactOnly
              ? { background: "linear-gradient(135deg,#17130f,#090908)" }
              : {
                  backgroundImage: `url(${LIBRARY_STATS_BACKGROUND})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                }
          }
        >
          {!isCompactOnly ? <div className="absolute inset-0 -z-10 bg-[#090908]/85" /> : null}
          <div className="mx-auto max-w-[1180px] border border-[#d0b478]/25 bg-[#0d0c0b]/80 p-7 shadow-[0_24px_80px_rgba(0,0,0,.35)] backdrop-blur-md sm:p-10 lg:p-14">
            <div className="flex flex-col gap-6 border-b border-[#d0b478]/20 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#edcd85]">
                  The living archive
                </p>
                <h2
                  className="text-4xl font-normal tracking-[-0.035em] text-[#ece3d2] sm:text-5xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Your library at a glance
                </h2>
                <p className="mt-3 text-[#b9ad99]">Content currently stored on this device.</p>
              </div>
              <Link
                href="/import"
                className="inline-flex items-center justify-center gap-3 border border-[#f0d897] bg-gradient-to-br from-[#e4c579] to-[#a9874d] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.13em] text-[#1b150e] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <Upload className="h-4 w-4" />
                Import more lore
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[#d0b478]/15 sm:grid-cols-4 lg:grid-cols-7">
              {libraryStatItems.map((stat) => (
                <div key={stat.label} className="bg-[#0d0c0b]/95 px-3 py-7 text-center">
                  <p
                    className="text-4xl text-[#edcd85]"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9f9482]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        id="home-footer"
        className="mt-auto w-full shrink-0 border-t border-[#d0b478]/20 bg-[#0a0908] px-4 py-5 [--foreground:#ece3d2] [--muted-foreground:#b9ad99] [--primary:#edcd85]"
      />
    </div>
  )
}
