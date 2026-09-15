import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder = "Add and press Enter", className }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  function confirmRemove() {
    if (pendingRemoveIndex === null) return;
    onChange(value.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  }

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function startEditing(index: number) {
    setEditingIndex(index);
    setEditingDraft(value[index]);
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const trimmed = editingDraft.trim();
    const next = [...value];
    if (trimmed) {
      next[editingIndex] = trimmed;
    } else {
      next.splice(editingIndex, 1);
    }
    onChange(next);
    setEditingIndex(null);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditingIndex(null);
    }
  }

  return (
    <div
      className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-2 text-sm focus-within:ring-1 focus-within:ring-ring", className)}
    >
      {value.map((tag, index) =>
        editingIndex === index ? (
          <input
            key={`${tag}-${index}`}
            autoFocus
            value={editingDraft}
            onChange={(event) => setEditingDraft(event.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
            className="h-6 min-w-[60px] max-w-[220px] rounded-full border-none bg-secondary px-2.5 py-1 text-xs font-medium text-foreground outline-none ring-1 ring-ring"
          />
        ) : (
          <span
            key={`${tag}-${index}`}
            onClick={() => startEditing(index)}
            className="inline-flex cursor-text items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background"
          >
            {tag}
            <button
              type="button"
              className="opacity-60 hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                setPendingRemoveIndex(index);
              }}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ),
      )}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 border-none bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
      />

      <ConfirmationDialog
        isOpen={pendingRemoveIndex !== null}
        onClose={() => setPendingRemoveIndex(null)}
        onConfirm={confirmRemove}
        title="Remove tag?"
        description={pendingRemoveIndex !== null ? `"${value[pendingRemoveIndex]}" will be removed.` : ""}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
