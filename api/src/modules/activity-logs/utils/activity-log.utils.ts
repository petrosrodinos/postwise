// Compares `before`/`after` on the given keys and returns only the fields
// that actually changed, each as { from, to } — used to populate an
// ActivityLog's metadata so updates keep both the previous and new value.
export function diffFields<T extends Record<string, any>>(
  before: T,
  after: T,
  keys: (keyof T)[],
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of keys) {
    const beforeValue = before[key];
    const afterValue = after[key];
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[key as string] = { from: beforeValue, to: afterValue };
    }
  }

  return changes;
}
