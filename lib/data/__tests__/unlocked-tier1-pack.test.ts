import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parseDumpStatExportJson } from "@/lib/import/dump-stat-export-format"

const packPath = path.join(process.cwd(), "public/approved-content/Unlocked-Tier1.json")

const UNLOCKED_ROLES = new Set(["breakthrough", "at_will", "power", "setback", "primary_ability"])

function loadAbilities() {
  const items = parseDumpStatExportJson(fs.readFileSync(packPath, "utf8"))
  expect(items).not.toBeNull()
  return items!.map((item) => {
    expect(item.type).toBe("dnd-ability")
    return item.data as Record<string, unknown>
  })
}

describe("Unlocked Tier-1 content pack", () => {
  it("contains the expected role mix", () => {
    const byRole = loadAbilities().reduce<Record<string, number>>((acc, ability) => {
      const role = String(ability.ability_role)
      acc[role] = (acc[role] ?? 0) + 1
      return acc
    }, {})
    expect(byRole).toEqual({
      breakthrough: 10,
      at_will: 16,
      power: 18,
      setback: 4,
      primary_ability: 3,
    })
  })

  it("every ability uses an Unlocked role, is Unlocked-eligible, and is described", () => {
    for (const ability of loadAbilities()) {
      expect(UNLOCKED_ROLES.has(String(ability.ability_role))).toBe(true)
      expect(ability.eligible_classes).toEqual(["Unlocked"])
      expect(ability.source).toBe("Unlocked (Homebrew)")
      expect(String(ability.name).length).toBeGreaterThan(0)
      expect(String(ability.description).length).toBeGreaterThan(0)
    }
  })

  it("has unique ability names", () => {
    const names = loadAbilities().map((a) => String(a.name))
    expect(new Set(names).size).toBe(names.length)
  })

  it("every Power spends from the class_resource pool matching its own tier", () => {
    const powers = loadAbilities().filter((a) => a.ability_role === "power")
    expect(powers).toHaveLength(18)
    for (const power of powers) {
      const tierMatch = String(power.description).match(/Power Level (\d)/)
      expect(tierMatch, String(power.name)).not.toBeNull()
      const tier = tierMatch![1]
      expect(power.uses, String(power.name)).toEqual({
        type: "class_resource",
        classResourceKey: `power_use_tier_${tier}`,
        classResourceAmount: 1,
      })
    }
  })

  it("each Primary Ability option grants the matching saving throw", () => {
    const options = loadAbilities().filter((a) => a.ability_role === "primary_ability")
    expect(options.map((a) => String(a.name)).sort()).toEqual([
      "Charisma (Primary Ability)",
      "Dexterity (Primary Ability)",
      "Intelligence (Primary Ability)",
    ])
    for (const ability of options) {
      const abilityName = String(ability.name).replace(" (Primary Ability)", "")
      const characteristics = ability.characteristics as { type: string; values: string[] }[]
      expect(characteristics, abilityName).toHaveLength(1)
      expect(characteristics[0].type).toBe("saving_throws")
      expect(characteristics[0].values).toEqual([abilityName])
    }
  })
})
