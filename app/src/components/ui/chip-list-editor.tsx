import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";

interface ChipListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}

export function ChipListEditor({ value, onChange, placeholder = "Add and press Enter", emptyLabel, className }: ChipListEditorProps) {
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  function confirmRemove() {
    if (pendingRemoveIndex === null) return;
    onChange(value.filter((_, i) => i !== pendingRemoveIndex));
    setPendingRemoveIndex(null);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onChange([...value, trimmed]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
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
    <div className={cn("flex flex-col gap-2.5", className)}>
      {value.length === 0 ? (
        emptyLabel && <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {value.map((item, index) =>
            editingIndex === index ? (
              <li key={`${item}-${index}`}>
                <Input
                  autoFocus
                  value={editingDraft}
                  onChange={(e) => setEditingDraft(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={commitEdit}
                />
              </li>
            ) : (
              <li
                key={`${item}-${index}`}
                onClick={() => startEditing(index)}
                className="flex cursor-text items-start justify-between gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 break-words">{item}</span>
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPendingRemoveIndex(index);
                  }}
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ),
          )}
        </ul>
      )}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} />
        </div>
        <Button type="button" variant="outline" onClick={commit} disabled={!draft.trim()}>
          Add
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={pendingRemoveIndex !== null}
        onClose={() => setPendingRemoveIndex(null)}
        onConfirm={confirmRemove}
        title="Remove this item?"
        description={pendingRemoveIndex !== null ? `"${value[pendingRemoveIndex]}" will be removed.` : ""}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
