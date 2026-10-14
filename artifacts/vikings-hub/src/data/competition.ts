/** Unify known aliases for this season's league without renaming other competitions. */
export function normalizeCompetition(value: string): string {
  const trimmed = value.trim();
  return /^(?:(?:u\s*9|under\s*9)\s+)?division\s*5$/i.test(trimmed)
    ? "U9 Division 5"
    : trimmed;
}
