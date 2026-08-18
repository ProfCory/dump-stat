import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  ABILITY_ROLE_DEFAULT_ICONS,
  getCompendiumItemIcon,
} from "@/lib/compendium/content-types"
import { abilityRoleLabel } from "@/lib/compendium/ability-role-labels"

describe("Unlocked ability_role default icons", () => {
  it("ships an icon file for every mapped role", () => {
    for (const icon of Object.values(ABILITY_ROLE_DEFAULT_ICONS)) {
      expect(fs.existsSync(path.join(process.cwd(), "public/icons", `${icon}.svg`)), icon).toBe(true)
    }
  })

  it("resolves the role icon for an ability with no custom icon set", () => {
    expect(getCompendiumItemIcon("abilities", { name: "Spellcasting", ability_role: "breakthrough" })).toBe(
      ABILITY_ROLE_DEFAULT_ICONS.breakthrough,
    )
    expect(getCompendiumItemIcon("abilities", { name: "Grave-Touched", ability_role: "setback" })).toBe(
      ABILITY_ROLE_DEFAULT_ICONS.setback,
    )
    expect(getCompendiumItemIcon("abilities", { name: "Kinetic Push", ability_role: "power" })).toBe(
      ABILITY_ROLE_DEFAULT_ICONS.power,
    )
    expect(getCompendiumItemIcon("abilities", { name: "Minor Arcana", ability_role: "at_will" })).toBe(
      ABILITY_ROLE_DEFAULT_ICONS.at_will,
    )
  })

  it("prefers a saved custom icon over the role default", () => {
    expect(
      getCompendiumItemIcon("abilities", {
        name: "Spellcasting",
        ability_role: "breakthrough",
        icon: "custom-icon",
      }),
    ).toBe("custom-icon")
  })

  it("falls back to the abilities tab default for roles without a mapped icon", () => {
    expect(getCompendiumItemIcon("abilities", { name: "Open Mind", ability_role: "class_talent" })).toBe(
      "magic-trident",
    )
  })

  it("labels every Unlocked role distinctly", () => {
    expect(abilityRoleLabel("breakthrough")).toBe("Breakthrough (Unlocked)")
    expect(abilityRoleLabel("setback")).toBe("Setback (Unlocked)")
    expect(abilityRoleLabel("power")).toBe("Power (Unlocked)")
    expect(abilityRoleLabel("at_will")).toBe("At-Will (Unlocked)")
  })
})
