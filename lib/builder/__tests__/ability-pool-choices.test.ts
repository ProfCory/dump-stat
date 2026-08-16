import { describe, expect, it } from "vitest"
import {
  abilitiesForClassByRole,
  aggregateRoleAbilityOptions,
} from "@/lib/builder/ability-pool-choices"
import type { CustomAbility } from "@/lib/types"

function ability(
  partial: Partial<CustomAbility> & Pick<CustomAbility, "id" | "name" | "ability_role">,
): CustomAbility {
  return {
    description: partial.name,
    prerequisites: null,
    characteristics: null,
    attached_to_type: null,
    attached_to_id: null,
    uses: null,
    show_in_builder: true,
    icon: null,
    source: "Unlocked (Homebrew)",
    creator_url: null,
    created_at: "",
    updated_at: "",
    eligible_classes: ["Unlocked"],
    ...partial,
  }
}

const library = [
  ability({ id: "b1", name: "Spellcasting", ability_role: "breakthrough" }),
  ability({ id: "b2", name: "Ghost's Toolkit", ability_role: "breakthrough" }),
  ability({ id: "p1", name: "Kinetic Push", ability_role: "power" }),
  ability({ id: "a1", name: "Minor Arcana", ability_role: "at_will" }),
  // Same role but a different class — must never surface for Unlocked.
  ability({ id: "x1", name: "Other Class BT", ability_role: "breakthrough", eligible_classes: ["Wizard"] }),
  // Role-less Unlocked-eligible row — must NOT leak into a role-strict picker.
  ability({ id: "n1", name: "Roleless", ability_role: null, eligible_classes: ["Unlocked"] }),
]

describe("role-strict ability pools", () => {
  it("returns only same-role, class-eligible abilities", () => {
    const bts = abilitiesForClassByRole(library, ["Unlocked"], "breakthrough")
    expect(bts.map((a) => a.name).sort()).toEqual(["Ghost's Toolkit", "Spellcasting"])
    // Powers and At-Wills never appear in the Breakthrough pool.
    expect(bts.some((a) => a.ability_role !== "breakthrough")).toBe(false)
  })

  it("keeps each picker distinct despite shared eligible_classes", () => {
    expect(abilitiesForClassByRole(library, ["Unlocked"], "power").map((a) => a.name)).toEqual([
      "Kinetic Push",
    ])
    expect(abilitiesForClassByRole(library, ["Unlocked"], "at_will").map((a) => a.name)).toEqual([
      "Minor Arcana",
    ])
  })

  it("aggregates options and drops an already-selected non-repeatable", () => {
    const options = aggregateRoleAbilityOptions({
      customAbilities: library,
      classNames: ["Unlocked"],
      classLevel: 5,
      role: "breakthrough",
      selectedNames: ["Spellcasting"],
    })
    expect(options.map((o) => o.name)).toEqual(["Ghost's Toolkit"])
  })

  it("gates options behind a level requirement", () => {
    const gated = [
      ability({ id: "g1", name: "Late BT", ability_role: "breakthrough", level_requirement: 10 }),
      ...library,
    ]
    const atLevel5 = aggregateRoleAbilityOptions({
      customAbilities: gated,
      classNames: ["Unlocked"],
      classLevel: 5,
      role: "breakthrough",
      selectedNames: [],
    })
    expect(atLevel5.some((o) => o.name === "Late BT")).toBe(false)

    const atLevel10 = aggregateRoleAbilityOptions({
      customAbilities: gated,
      classNames: ["Unlocked"],
      classLevel: 10,
      role: "breakthrough",
      selectedNames: [],
    })
    expect(atLevel10.some((o) => o.name === "Late BT")).toBe(true)
  })
})
