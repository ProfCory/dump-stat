import { describe, expect, it } from "vitest"
import { AbilityImportSchema } from "@/lib/import/content-schema"

const UNLOCKED_ROLES = ["breakthrough", "setback", "power", "at_will"] as const

describe("Unlocked ability roles (import schema)", () => {
  it("accepts each new role on a round-tripped custom ability", () => {
    for (const role of UNLOCKED_ROLES) {
      const parsed = AbilityImportSchema.parse({
        name: `Sample ${role}`,
        description: `A sample ${role}.`,
        source_type: "class",
        source_name: "Unlocked",
        level_requirement: null,
        ability_role: role,
        eligible_classes: ["Unlocked"],
      })
      expect(parsed.ability_role).toBe(role)
      expect(parsed.eligible_classes).toEqual(["Unlocked"])
    }
  })

  it("still rejects unknown roles", () => {
    expect(() =>
      AbilityImportSchema.parse({
        name: "Bogus",
        description: "Bogus.",
        source_type: "class",
        source_name: "Unlocked",
        level_requirement: null,
        ability_role: "not_a_role",
      }),
    ).toThrow()
  })
})
