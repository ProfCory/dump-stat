import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parseDumpStatExportJson } from "@/lib/import/dump-stat-export-format"
import { ClassFeatureSchema, UsesConfigImportSchema } from "@/lib/import/content-schema"
import { parseApprovedContentManifest } from "@/lib/data/approved-content"

const packPath = path.join(process.cwd(), "public/approved-content/Unlocked.json")
const manifestPath = path.join(process.cwd(), "public/approved-content/manifest.json")

function loadItems() {
  const items = parseDumpStatExportJson(fs.readFileSync(packPath, "utf8"))
  expect(items).not.toBeNull()
  return items!
}

describe("Unlocked approved-content pack", () => {
  it("is a valid dump-stat export with the expected item mix", () => {
    const items = loadItems()
    const byType = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1
      return acc
    }, {})
    expect(byType).toEqual({
      "dnd-class": 1,
      "dnd-class-resource": 5,
      "dnd-subclass": 3,
    })
  })

  it("defines the Unlocked class chassis (d6, no spellcasting, choose-primary)", () => {
    const cls = loadItems().find((i) => i.type === "dnd-class")!.data as Record<string, unknown>
    expect(cls.name).toBe("Unlocked")
    expect(cls.hit_die).toBe(6)
    // Powers are custom abilities, not spells — the class must not drive the spell step.
    expect(cls.spellcasting).toBeNull()
    expect(cls.primary_ability).toEqual(["Charisma", "Dexterity", "Intelligence"])

    const features = cls.features as { level: number; name: string }[]
    // Subclass gate at 3rd, and every ASI milestone present.
    expect(features.some((f) => f.name === "Unlocked Subclass" && f.level === 3)).toBe(true)
    expect(
      features
        .filter((f) => f.name === "Ability Score Improvement")
        .map((f) => f.level)
        .sort((a, b) => a - b),
    ).toEqual([4, 8, 12, 16])
    // Every feature validates against the class-feature schema.
    for (const feature of features) {
      expect(() => ClassFeatureSchema.parse(feature)).not.toThrow()
    }
  })

  it("scales the Wild Die and Power Limit exactly as the class table does", () => {
    const resources = loadItems()
      .filter((i) => i.type === "dnd-class-resource")
      .map((i) => i.data as Record<string, unknown>)

    for (const resource of resources) {
      expect(resource.class_name).toBe("Unlocked")
      expect(() => UsesConfigImportSchema.parse(resource.uses)).not.toThrow()
    }

    const wildDie = resources.find((r) => r.resource_key === "wild_die")!
    expect((wildDie.uses as Record<string, unknown>).dieSidesByLevel).toEqual([
      { level: 2, count: 4 },
      { level: 6, count: 6 },
      { level: 10, count: 8 },
      { level: 14, count: 10 },
      { level: 18, count: 12 },
    ])

    const powerLimit = resources.find((r) => r.resource_key === "power_limit")!
    const limitTable = (powerLimit.uses as { atLevelTable: { level: number; count: number }[] })
      .atLevelTable
    // Highest tier at 1st and 20th matches the table (1 and 9).
    expect(limitTable[0]).toEqual({ level: 1, count: 1 })
    expect(limitTable[limitTable.length - 1]).toEqual({ level: 17, count: 9 })
  })

  it("wires the Breakthrough / Power / At-Will pickers to role-strict pools", () => {
    const cls = loadItems().find((i) => i.type === "dnd-class")!.data as Record<string, unknown>
    const features = cls.features as {
      name: string
      isChoice?: boolean
      choices?: { optionsSource?: string; resourceKey?: string; choiceCountByLevel?: unknown[] }
    }[]

    const bt = features.find((f) => f.name === "Unlocked Breakthroughs")!
    expect(bt.isChoice).toBe(true)
    expect(bt.choices?.optionsSource).toBe("class_breakthroughs")
    // Cumulative BT totals from the class table: 1 at 2nd up to 21 at 18th.
    const btTable = bt.choices?.choiceCountByLevel as { level: number; count: number }[]
    expect(btTable[0]).toEqual({ level: 2, count: 1 })
    expect(btTable[btTable.length - 1]).toEqual({ level: 18, count: 21 })

    const atWill = features.find((f) => f.name === "At-Wills")!
    expect(atWill.choices?.optionsSource).toBe("class_at_wills")
    expect(atWill.choices?.resourceKey).toBe("at_wills")

    const power = features.find((f) => f.name === "Prepared Powers")!
    expect(power.choices?.optionsSource).toBe("class_powers")
    expect(power.choices?.resourceKey).toBe("prepared_powers")
  })

  it("attaches all three subclasses to the Unlocked class", () => {
    const subclasses = loadItems()
      .filter((i) => i.type === "dnd-subclass")
      .map((i) => i.data as Record<string, unknown>)
    expect(subclasses.map((s) => s.name).sort()).toEqual(["The Dip", "The Face", "The Planner"])
    for (const subclass of subclasses) {
      expect(subclass.class_name).toBe("Unlocked")
      expect((subclass.features as unknown[]).length).toBeGreaterThan(0)
    }
  })

  it("is registered in the regenerated approved-content manifest", () => {
    const manifest = parseApprovedContentManifest(
      JSON.parse(fs.readFileSync(manifestPath, "utf8")),
    )
    expect(manifest.packs.some((p) => p.file === "Unlocked.json")).toBe(true)
  })
})
