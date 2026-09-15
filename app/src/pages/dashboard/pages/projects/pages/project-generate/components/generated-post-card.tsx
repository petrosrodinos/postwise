import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DnaBadge } from "@/components/ui/dna-badge";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { getPostStatusLabel } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { useRepurposePost, useUpdatePost } from "@/features/posts/hooks/use-posts";
import { PostStatuses, PostTypes, type Post, type UpdatePostDto } from "@/features/posts/interfaces/posts.interfaces";
import type { ProjectStyleProfileLink } from "@/features/projects/interfaces/projects.interfaces";

const EDITABLE_STATUSES = [PostStatuses.DRAFT, PostStatuses.REVIEW, PostStatuses.READY];

interface GeneratedPostCardProps {
  post: Post;
  platform: (typeof PostTypes)[keyof typeof PostTypes];
  styleProfiles: ProjectStyleProfileLink[];
}

export function GeneratedPostCard({ post, platform, styleProfiles }: GeneratedPostCardProps) {
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const { mutate: repurposePost, isPending: isRepurposing } = useRepurposePost();

  const [draft, setDraft] = useState({
    title: post.title ?? "",
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    seo_title: post.seo_title ?? "",
    seo_description: post.seo_description ?? "",
    canonical_url: post.canonical_url ?? "",
  });

  useEffect(() => {
    setDraft({
      title: post.title ?? "",
      excerpt: post.excerpt ?? "",
      body: post.body ?? "",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      canonical_url: post.canonical_url ?? "",
    });
  }, [post.id, post.title, post.excerpt, post.body, post.seo_title, post.seo_description, post.canonical_url]);

  const isBlog = platform === PostTypes.BLOG;
  const isDirty = isBlog
    ? draft.title !== (post.title ?? "") ||
      draft.excerpt !== (post.excerpt ?? "") ||
      draft.body !== (post.body ?? "") ||
      draft.seo_title !== (post.seo_title ?? "") ||
      draft.seo_description !== (post.seo_description ?? "") ||
      draft.canonical_url !== (post.canonical_url ?? "")
    : draft.body !== (post.body ?? "");
  const styleProfile = styleProfiles.find((link) => link.style_profile_id === post.style_profile_id)?.style_profile;
  const isEditableStatus = EDITABLE_STATUSES.includes(post.status as (typeof EDITABLE_STATUSES)[number]);

  function save() {
    const dto: UpdatePostDto = isBlog
      ? { title: draft.title, excerpt: draft.excerpt, body: draft.body, seo_title: draft.seo_title, seo_description: draft.seo_description, canonical_url: draft.canonical_url }
      : { body: draft.body };
    updatePost({ id: post.id, dto });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {styleProfile ? <DnaBadge name={styleProfile.name} traits={styleProfile} /> : <span />}
        {!isBlog && post.hook && (
          <Badge variant="pill" className="bg-coral-soft font-semibold text-coral">
            {post.hook}
          </Badge>
        )}
      </div>

      {isBlog && (
        <>
          <Input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Post title"
            className="font-display h-auto border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <Textarea
            value={draft.excerpt}
            onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            placeholder="Excerpt — shown in previews and RSS"
            rows={2}
            className="text-xs"
          />
        </>
      )}

      <Textarea value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} rows={6} className="text-sm leading-relaxed" />

      {isBlog && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold uppercase text-muted-foreground">SEO</span>
          <Input value={draft.seo_title} onChange={(e) => setDraft((d) => ({ ...d, seo_title: e.target.value }))} placeholder="SEO title" className="text-xs" />
          <Input value={draft.seo_description} onChange={(e) => setDraft((d) => ({ ...d, seo_description: e.target.value }))} placeholder="SEO description" className="text-xs" />
          <Input value={draft.canonical_url} onChange={(e) => setDraft((d) => ({ ...d, canonical_url: e.target.value }))} placeholder="Canonical URL" className="text-xs" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" disabled={!isDirty || isSaving} loading={isSaving} onClick={save}>
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" disabled={isRepurposing} loading={isRepurposing}>
                <Sparkles className="h-3.5 w-3.5" />
                Repurpose
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PostTypeFormOptions.filter((option) => option.id !== post.type).map((option) => (
                <DropdownMenuItem key={option.id} onClick={() => repurposePost({ id: post.id, dto: { target_types: [option.id] } })}>
                  Repurpose into {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditableStatus ? (
          <Select
            value={post.status}
            onValueChange={(value) => updatePost({ id: post.id, dto: { status: value as UpdatePostDto["status"] } })}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITABLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {getPostStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <PostStatusTag status={post.status} title={post.status === PostStatuses.FAILED ? (post.failed_reason ?? undefined) : undefined} />
        )}
      </div>
    </div>
  );
}
