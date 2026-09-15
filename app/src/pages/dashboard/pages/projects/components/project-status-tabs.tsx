import { cn } from "@/lib/utils";

export type ProjectStatusFilter = "all" | "active" | "archived";

const TABS: { id: ProjectStatusFilter; label: string }[] = [
  { id: "all", label: "All projects" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
];

interface ProjectStatusTabsProps {
  value: ProjectStatusFilter;
  onChange: (value: ProjectStatusFilter) => void;
}

export function ProjectStatusTabs({ value, onChange }: ProjectStatusTabsProps) {
  return (
    <div className="inline-flex w-fit shrink-0 items-center gap-0.5 self-start rounded-lg bg-muted p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
            value === tab.id && "bg-card text-foreground shadow-sm",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
