import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder = "Add and press Enter", className }: TagInputProps) {
  const [draft, setDraft] = useState("");

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

  return (
    <div
      className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-2 text-sm focus-within:ring-1 focus-within:ring-ring", className)}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
          {tag}
          <button
            type="button"
            className="opacity-60 hover:opacity-100"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 border-none bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
