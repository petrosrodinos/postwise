import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowBar } from "@/components/ui/workflow-bar";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { StyleDnaStrand } from "@/components/ui/style-dna-strand";
import { TagInput } from "@/components/ui/tag-input";
import { ChipListEditor } from "@/components/ui/chip-list-editor";
import { PostStatusFilterOptions } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { PostStatuses } from "@/features/posts/interfaces/posts.interfaces";
import { usePosts } from "@/features/posts/hooks/use-posts";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { Routes } from "@/routes/routes";
import type { Project } from "@/features/projects/interfaces/projects.interfaces";

const ALL_STATUSES = Object.values(PostStatuses);

type EditableSection = "pillars" | "ideas" | "instructions";

interface OverviewTabProps {
  project: Project;
  onViewAllPosts: () => void;
}

export function OverviewTab({ project, onViewAllPosts }: OverviewTabProps) {
  const counts = project.post_status_counts ?? {};
  const { data: recentPostsPage, isPending } = usePosts({ project_id: project.id, limit: 4 });
  const recentPosts = recentPostsPage?.data ?? [];

  const { mutate: updateProject, isPending: isSaving } = useUpdateProject();
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [draft, setDraft] = useState<string[]>([]);

  function startEditing(section: EditableSection) {
    setDraft(project[section]);
    setEditingSection(section);
  }

  function cancelEditing() {
    setEditingSection(null);
  }

  function saveEditing(section: EditableSection) {
    updateProject(
      { id: project.id, dto: { [section]: draft } },
      { onSuccess: () => setEditingSection(null) },
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <WorkflowBar counts={counts} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ALL_STATUSES.map((status) => (
                <div key={status}>
                  <div className="text-lg font-semibold">{counts[status] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">{getDropdownOptionLabel(PostStatusFilterOptions, status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent generated posts</CardTitle>
            <Button type="button" variant="link" onClick={onViewAllPosts} className="h-auto p-0 text-xs font-semibold text-brass-ink">
              View all →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts generated yet.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{post.title || post.hook || post.body?.slice(0, 60) || "Untitled post"}</span>
                  <PostStatusTag status={post.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Content pillars</CardTitle>
            {editingSection !== "pillars" && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing("pillars")} aria-label="Edit content pillars">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === "pillars" ? (
              <div className="flex flex-col gap-3">
                <TagInput value={draft} onChange={setDraft} placeholder="Add a pillar and press Enter" className="w-full" />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={() => saveEditing("pillars")} loading={isSaving} disabled={isSaving}>
                    Save
                  </Button>
                </div>
              </div>
            ) : project.pillars.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pillars set.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {project.pillars.map((pillar) => (
                  <Badge key={pillar} variant="pill">
                    {pillar}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Ideas</CardTitle>
            {editingSection !== "ideas" && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing("ideas")} aria-label="Edit ideas">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === "ideas" ? (
              <div className="flex flex-col gap-3">
                <ChipListEditor
                  value={draft}
                  onChange={setDraft}
                  placeholder="Add a rough topic, angle or note"
                  emptyLabel="No ideas yet — add one below."
                  className="w-full"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={() => saveEditing("ideas")} loading={isSaving} disabled={isSaving}>
                    Save
                  </Button>
                </div>
              </div>
            ) : project.ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas set.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {project.ideas.map((idea, index) => (
                  <li key={`${idea}-${index}`} className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                    {idea}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Instructions</CardTitle>
            {editingSection !== "instructions" && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing("instructions")} aria-label="Edit instructions">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === "instructions" ? (
              <div className="flex flex-col gap-3">
                <ChipListEditor
                  value={draft}
                  onChange={setDraft}
                  placeholder="Add a rule the AI should always follow"
                  emptyLabel="No instructions yet — add one below."
                  className="w-full"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={() => saveEditing("instructions")} loading={isSaving} disabled={isSaving}>
                    Save
                  </Button>
                </div>
              </div>
            ) : project.instructions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No instructions set.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {project.instructions.map((instruction, index) => (
                  <li key={`${instruction}-${index}`} className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                    {instruction}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Style profiles in use</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!project.style_profiles || project.style_profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No style profiles attached.</p>
            ) : (
              project.style_profiles.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{link.style_profile.name}</div>
                    <StyleDnaStrand traits={link.style_profile} className="mt-1 w-24" />
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{link.style_profile.posts_analyzed} posts</span>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" asChild className="mt-1">
              <Link to={Routes.dashboard.style_profiles}>Manage style profiles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
