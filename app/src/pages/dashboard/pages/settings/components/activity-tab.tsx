import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { generateInitials } from "@/features/auth/utils/auth.utils";
import { useActivityLogs } from "@/features/activity-logs/hooks/use-activity-logs";
import type { ActivityLogAction } from "@/features/activity-logs/interfaces/activity-logs.interfaces";
import { ActivityLogActionFilterOptions } from "@/config/constants/dropdowns/activity-logs/activity-log-action-filter.options";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { getActivityLogChanges } from "../utils/activity-log-changes.utils";

interface ActivityTabProps {
  organisationId: string;
}

export function ActivityTab({ organisationId }: ActivityTabProps) {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActivityLogAction | "all">("all");

  const { data, isPending } = useActivityLogs(organisationId, {
    page,
    limit: 20,
    ...(action !== "all" && { action }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-lg text-sm text-muted-foreground">A record of everything that's happened in this organisation.</p>
        <Select
          value={action}
          onValueChange={(value) => {
            setAction(value as ActivityLogAction | "all");
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by action" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ActivityLogActionFilterOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-64" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-3.5 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((log) => {
              const changes = getActivityLogChanges(log.metadata);
              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{log.user ? generateInitials(log.user.name) : "SY"}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{log.user?.name ?? "System"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getDropdownOptionLabel(ActivityLogActionFilterOptions, log.action)}</Badge>
                        <span className="text-sm text-muted-foreground">{log.description}</span>
                      </div>
                      {changes.length > 0 && (
                        <div className="flex flex-col gap-0.5 border-l-2 border-border pl-2.5">
                          {changes.map((change) => (
                            <div key={change.field} className="text-xs text-muted-foreground">
                              <span className="font-medium capitalize">{change.field}: </span>
                              <span className="line-through opacity-70">{change.from}</span>
                              <span className="mx-1" aria-hidden>
                                →
                              </span>
                              <span className="text-foreground">{change.to}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {data && data.pagination.total_pages > 1 && (
        <Pagination currentPage={page} totalPages={data.pagination.total_pages} onPageChange={setPage} />
      )}
    </div>
  );
}
