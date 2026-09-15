import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

interface EditableListCardProps {
  title: string;
  emptyLabel: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  isPending: boolean;
}

function EditableListCard({ title, emptyLabel, placeholder, items, onChange, isPending }: EditableListCardProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 break-words">{item}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={isPending} />
          <Button type="button" variant="outline" onClick={submit} disabled={isPending || !draft.trim()}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface IdeasInstructionsTabProps {
  project: Project;
}

export function IdeasInstructionsTab({ project }: IdeasInstructionsTabProps) {
  const { mutate, isPending } = useUpdateProject();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <EditableListCard
        title="Ideas"
        emptyLabel="No ideas yet."
        placeholder="Add an idea"
        items={project.ideas}
        isPending={isPending}
        onChange={(ideas) => mutate({ id: project.id, dto: { ideas } })}
      />
      <EditableListCard
        title="Instructions"
        emptyLabel="No instructions yet."
        placeholder="Add an instruction"
        items={project.instructions}
        isPending={isPending}
        onChange={(instructions) => mutate({ id: project.id, dto: { instructions } })}
      />
    </div>
  );
}
