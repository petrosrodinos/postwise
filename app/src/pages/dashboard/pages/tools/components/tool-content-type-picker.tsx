import { cn } from "@/lib/utils";
import type { ToolContentType } from "@/features/tools/interfaces/tools.interfaces";
import { TOOL_CONTENT_TYPE_META, TOOL_CONTENT_TYPE_OPTIONS } from "../constants/tool-content-type.constants";

interface ToolContentTypePickerProps {
  value?: ToolContentType;
  onChange: (value: ToolContentType) => void;
  className?: string;
}

// Tools-local equivalent of PlatformPicker — same look, but over Tools'
// own 4-value content-type set (LinkedIn/X/Blog/Email) instead of the
// shared 3-value PostType.
export function ToolContentTypePicker({ value, onChange, className }: ToolContentTypePickerProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-4", className)}>
      {TOOL_CONTENT_TYPE_OPTIONS.map((id) => {
        const meta = TOOL_CONTENT_TYPE_META[id];
        const Icon = meta.icon;
        const selected = value === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              selected ? cn("shadow-sm", meta.accentClassName) : "border-border bg-card hover:border-foreground/25 hover:bg-accent/40",
            )}
          >
            <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full", selected ? "bg-background/70" : "bg-muted text-foreground")}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="block text-sm font-semibold text-foreground">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
