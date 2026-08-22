/** Human-readable label per CustomAbility.ability_role — shared by the ability editor and the compendium browser's role filter. */
export const ABILITY_ROLE_LABELS: Record<string, string> = {
  discipline: "Discipline package",
  psionic_power: "Psionic power",
  class_talent: "Class talent",
  talent_pool: "Talent pool (e.g. General Psionic Talents)",
  knack: "Knack / trick",
  upgrade: "Upgrade",
  bomb_formula: "Bomb formula",
  discovery: "Discovery",
  alchemist_bomb: "Alchemist bomb",
  breakthrough: "Breakthrough (Unlocked)",
  setback: "Setback (Unlocked)",
  power: "Power (Unlocked)",
  at_will: "At-Will (Unlocked)",
  primary_ability: "Primary Ability (Unlocked)",
}

export function abilityRoleLabel(role: string): string {
  return ABILITY_ROLE_LABELS[role] ?? role.replace(/_/g, " ")
}
