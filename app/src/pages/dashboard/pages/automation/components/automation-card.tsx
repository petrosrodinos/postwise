import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DnaBadge } from "@/components/ui/dna-badge";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AutomationOutputStages, type Automation } from "@/features/automations/interfaces/automations.interfaces";
import { useDeleteAutomation, useUpdateAutomation } from "@/features/automations/hooks/use-automations";
import { getAutomationFrequencyLabel } from "@/config/constants/dropdowns/automations/automation-frequency-form.options";
import { getAutomationOutputStageLabel } from "@/config/constants/dropdowns/automations/automation-output-stage-form.options";
import { WeekdayOptions } from "@/config/constants/dropdowns/shared/weekday.options";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

const OUTPUT_STAGE_STYLE: Record<string, string> = {
  [AutomationOutputStages.DRAFT]: "bg-secondary text-secondary-foreground",
  [AutomationOutputStages.REVIEW]: "bg-coral-soft text-coral",
  [AutomationOutputStages.PUBLISH]: "bg-teal-soft text-teal",
};

interface AutomationCardProps {
  automation: Automation;
  project: Project;
  onEdit: () => void;
}

export function AutomationCard({ automation, project, onEdit }: AutomationCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: updateAutomation } = useUpdateAutomation();
  const { mutate: deleteAutomation, isPending: isDeleting } = useDeleteAutomation();

  const styleProfile = project.style_profiles?.find((link) => link.style_profile_id === automation.style_profile_id)?.style_profile;

  const scheduleSummary = [
    getAutomationFrequencyLabel(automation.frequency),
    automation.frequency === "WEEKLY" && automation.days_of_week.length > 0
      ? automation.days_of_week.map((day) => WeekdayOptions.find((option) => option.id === day)?.label).join(", ")
      : null,
    `${automation.time_of_day} ${automation.timezone}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", automation.is_active ? "bg-brass-soft text-brass-ink" : "bg-muted text-muted-foreground")}>
            <Repeat2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{automation.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{scheduleSummary}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Switch
            checked={automation.is_active}
            onCheckedChange={(checked) => updateAutomation({ id: automation.id, dto: { is_active: checked } })}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteOpen(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="pill">{project.title}</Badge>
        {styleProfile && <DnaBadge name={styleProfile.name} traits={styleProfile} />}
        <Badge variant="pill" className={OUTPUT_STAGE_STYLE[automation.output_stage]}>
          {getAutomationOutputStageLabel(automation.output_stage)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{automation.posts_per_run} posts per run</span>
        <span>
          {automation.is_active
            ? automation.next_run_at
              ? `Next run ${formatDistanceToNow(new Date(automation.next_run_at), { addSuffix: true })}`
              : "Next run pending"
            : "Paused"}
        </span>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteAutomation(automation.id, { onSuccess: () => setIsDeleteOpen(false) })}
        title="Delete automation?"
        description={`"${automation.name}" will stop running and can't be recovered.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
