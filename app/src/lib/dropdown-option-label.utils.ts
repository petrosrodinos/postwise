interface DropdownOption<T> {
  id: T;
  label: string;
}

// Shared reader for `{ id, label }[]` option arrays defined under
// `config/constants/dropdowns/`. Use this instead of a local `find()` helper
// per component.
export function getDropdownOptionLabel<T extends string>(options: DropdownOption<T>[], id: T | string | null | undefined, fallback = "—"): string {
  if (!id) return fallback;
  return options.find((option) => option.id === id)?.label ?? fallback;
}
