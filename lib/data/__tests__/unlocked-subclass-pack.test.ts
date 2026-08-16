import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parseDumpStatExportJson } from "@/lib/import/dump-stat-export-format"

const packPath = path.join(process.cwd(), "public/approved-content/Unlocked-Subclass.json")

const SUBCLASSES = ["The Face", "The Dip", "The Planner"]

function loadAbilities() {
  const items = parseDumpStatExportJson(fs.readFileSync(packPath, "utf8"))
  expect(items).not.toBeNull()
  return items!.map((item) => {
    expect(item.type).toBe("dnd-ability")
    return item.data as Record<string, unknown>
  })
}

describe("Unlocked subclass breakthrough pack", () => {
  it("every entry is a breakthrough scoped to exactly one Unlocked subclass", () => {
    for (const ability of loadAbilities()) {
      expect(ability.ability_role).toBe("breakthrough")
      const eligible = ability.eligible_classes as string[]
      expect(eligible).toHaveLength(1)
      expect(SUBCLASSES).toContain(eligible[0])
      expect([6, 14, 18]).toContain(ability.level_requirement)
      expect(ability.source).toBe("Unlocked (Homebrew)")
    }
  })

  it("gives each subclass at least two options per advancement tier", () => {
    const abilities = loadAbilities()
    for (const subclass of SUBCLASSES) {
      for (const tier of [6, 14, 18]) {
        const count = abilities.filter(
          (a) =>
            (a.eligible_classes as string[])[0] === subclass && a.level_requirement === tier,
        ).length
        expect(count, `${subclass} @ ${tier}`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it("has unique names", () => {
    const names = loadAbilities().map((a) => String(a.name))
    expect(new Set(names).size).toBe(names.length)
  })
})
