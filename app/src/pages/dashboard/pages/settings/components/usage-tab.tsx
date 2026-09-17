import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Sparkles, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useAiUsage, useAiUsageSummary } from "@/features/ai-usage/hooks/use-ai-usage";
import type { AiUsageFeature, AiUsageType } from "@/features/ai-usage/interfaces/ai-usage.interfaces";
import { useOrganisationMembers } from "@/features/organisations/hooks/use-organisations";
import { AiUsageTypeFilterOptions, getAiUsageTypeLabel } from "@/config/constants/dropdowns/ai-usage/ai-usage-type-filter.options";
import { AiUsageFeatureFilterOptions, getAiUsageFeatureLabel } from "@/config/constants/dropdowns/ai-usage/ai-usage-feature-filter.options";

interface UsageTabProps {
  organisationId: string;
}

function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function UsageTab({ organisationId }: UsageTabProps) {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<AiUsageType | "all">("all");
  const [feature, setFeature] = useState<AiUsageFeature | "all">("all");
  const [userId, setUserId] = useState<string | "all">("all");

  const filters = {
    ...(type !== "all" && { type }),
    ...(feature !== "all" && { feature }),
    ...(userId !== "all" && { user_id: userId }),
  };

  const { data: members } = useOrganisationMembers(organisationId);
  const { data: summary, isPending: isSummaryPending } = useAiUsageSummary(organisationId, filters);
  const { data, isPending } = useAiUsage(organisationId, { page, limit: 20, ...filters });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total cost</CardTitle>
            <DollarSign className="h-4 w-4 text-brass" />
          </CardHeader>
          <CardContent>
            {isSummaryPending ? <Skeleton className="h-8 w-20" /> : <div className="font-display text-3xl font-semibold">{formatCost(summary?.total_cost ?? 0)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-coral" />
          </CardHeader>
          <CardContent>
            {isSummaryPending ? <Skeleton className="h-8 w-16" /> : <div className="font-display text-3xl font-semibold">{summary?.total_generations ?? 0}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Tokens used</CardTitle>
            <Coins className="h-4 w-4 text-violet" />
          </CardHeader>
          <CardContent>
            {isSummaryPending ? <Skeleton className="h-8 w-20" /> : <div className="font-display text-3xl font-semibold">{(summary?.total_tokens ?? 0).toLocaleString()}</div>}
          </CardContent>
        </Card>
      </div>

      {!isSummaryPending && summary && summary.by_feature.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breakdown by feature</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Generations</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.by_feature.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell>{getAiUsageFeatureLabel(row.feature)}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{formatCost(row.total_cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-lg text-sm text-muted-foreground">Every AI generation and its cost for this organisation.</p>
          <div className="flex flex-wrap gap-2">
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as AiUsageType | "all");
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by type" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AiUsageTypeFilterOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={feature}
              onValueChange={(value) => {
                setFeature(value as AiUsageFeature | "all");
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by feature" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AiUsageFeatureFilterOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={userId}
              onValueChange={(value) => {
                setUserId(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by member" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                {(members ?? []).map((member) => (
                  <SelectItem key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isPending ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-3.5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-3.5 w-14" />
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
                <TableHead>Member</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-sm font-medium">{event.user?.name ?? "System"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getAiUsageTypeLabel(event.type)}</Badge>
                      <span className="text-sm text-muted-foreground">{getAiUsageFeatureLabel(event.feature)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{event.model}</TableCell>
                  <TableCell className="text-right text-sm">{formatCost(event.total_cost)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {data && data.pagination.total_pages > 1 && (
          <Pagination currentPage={page} totalPages={data.pagination.total_pages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
