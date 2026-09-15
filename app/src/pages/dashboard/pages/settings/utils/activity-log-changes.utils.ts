interface ActivityLogFieldChange {
  from: unknown;
  to: unknown;
}

const MAX_VALUE_LENGTH = 60;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "empty";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "empty";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;
}

function formatFieldName(field: string): string {
  return field.replace(/_/g, " ");
}

// Reads `metadata.changes` (an ActivityLog's before/after diff, written by
// the API's diffFields helper) into a display-ready list of
// { field, from, to } rows — empty when the log has no recorded changes
// (e.g. a create/delete event).
export function getActivityLogChanges(
  metadata: Record<string, unknown> | null | undefined,
): { field: string; from: string; to: string }[] {
  const changes = metadata?.changes as Record<string, ActivityLogFieldChange> | undefined;
  if (!changes) return [];

  return Object.entries(changes).map(([field, change]) => ({
    field: formatFieldName(field),
    from: formatValue(change.from),
    to: formatValue(change.to),
  }));
}
