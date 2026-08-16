import type { CustomAbility } from "@/lib/types"
import {
  isChoicePrerequisiteMet,
  parseMinimumLevelFromPrerequisite,
  type ChoicePrerequisiteContext,
} from "@/lib/builder/choice-prerequisite"

/**
 * Selectable pools for the Unlocked class's semantic ability roles
 * (breakthrough / power / at_will). Unlike knacks, matching here is
 * role-strict: an option must carry the exact `ability_role` AND name the
 * class in `eligible_classes`. This keeps each picker distinct — a Breakthrough
 * picker never surfaces Powers or At-Wills even though they all share
 * eligible_classes: ["Unlocked"].
 */

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

function classNameMatches(abilityClass: string, classKey: string): boolean {
  const left = normalizeName(abilityClass)
  const right = classKey
  if (!left || !right) return false
  if (left === right) return true
  // Tolerate "Unlocked" vs "Unlocked (Variant)" style naming on either side.
  return left.includes(right) || right.includes(left)
}

export function abilitiesForClassByRole(
  customAbilities: CustomAbility[],
  classNames: string[],
  role: NonNullable<CustomAbility["ability_role"]>,
): CustomAbility[] {
  const classKeys = classNames.map(normalizeName).filter(Boolean)
  return customAbilities.filter((ability) => {
    if (ability.ability_role !== role) return false
    const eligible = ability.eligible_classes ?? []
    if (eligible.length === 0) return false
    return classKeys.some((classKey) =>
      eligible.some((name) => classNameMatches(name, classKey)),
    )
  })
}

export type RoleAbilityOption = {
  name: string
  description: string
  prerequisite?: string | null
  level_requirement?: number | null
  repeatable?: boolean | null
}

export function aggregateRoleAbilityOptions(params: {
  customAbilities: CustomAbility[]
  classNames: string[]
  classLevel: number
  role: NonNullable<CustomAbility["ability_role"]>
  selectedNames: string[]
  knownSpellNames?: string[]
  subclassName?: string | null
}): RoleAbilityOption[] {
  const abilities = abilitiesForClassByRole(params.customAbilities, params.classNames, params.role)
  const selected = params.selectedNames
  const context: ChoicePrerequisiteContext = {
    classLevel: params.classLevel,
    selectedAbilityNames: selected,
    knownSpellNames: params.knownSpellNames,
    subclassName: params.subclassName,
  }

  const options: RoleAbilityOption[] = []
  for (const ability of abilities) {
    const eligible = isChoicePrerequisiteMet(ability.prerequisites, context, {
      levelRequirement:
        ability.level_requirement ?? parseMinimumLevelFromPrerequisite(ability.prerequisites),
    })
    if (!eligible) continue
    const countInSelection = selected.filter(
      (name) => normalizeName(name) === normalizeName(ability.name),
    ).length
    if (!ability.repeatable && countInSelection > 0) continue
    options.push({
      name: ability.name,
      description: ability.description ?? "",
      prerequisite: ability.prerequisites,
      level_requirement: ability.level_requirement ?? null,
      repeatable: ability.repeatable ?? false,
    })
  }

  return options.sort((a, b) => a.name.localeCompare(b.name))
}
