import { useEffect, useRef, useState } from "react";
import { Maximize2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DnaBadge } from "@/components/ui/dna-badge";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getPostStatusLabel } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { useUpdatePost } from "@/features/posts/hooks/use-posts";
import { useDeleteDocument } from "@/features/documents/hooks/use-documents";
import {
  PostStatuses,
  PostTypes,
  type Post,
  type RevisedPostDraft,
  type UpdatePostDto,
} from "@/features/posts/interfaces/posts.interfaces";
import type { ProjectStyleProfileLink } from "@/features/projects/interfaces/projects.interfaces";
import { PostAiRevisePanel } from "./post-ai-revise-panel";

const EDITABLE_STATUSES = [
  PostStatuses.DRAFT,
  PostStatuses.REVIEW,
  PostStatuses.READY,
];

interface GeneratedPostCardProps {
  post: Post;
  platform: (typeof PostTypes)[keyof typeof PostTypes];
  styleProfiles: ProjectStyleProfileLink[];
  highlighted?: boolean;
}

export function GeneratedPostCard({
  post,
  platform,
  styleProfiles,
  highlighted,
}: GeneratedPostCardProps) {
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const { mutate: deleteDocument } = useDeleteDocument();

  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [showHighlight, setShowHighlight] = useState(!!highlighted);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!highlighted) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => setShowHighlight(false), 2500);
    return () => clearTimeout(timeout);
  }, [highlighted]);
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
  }, [
    post.id,
    post.title,
    post.excerpt,
    post.body,
    post.seo_title,
    post.seo_description,
    post.canonical_url,
  ]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.title]);

  const isBlog = platform === PostTypes.BLOG;
  const isDirty = isBlog
    ? draft.title !== (post.title ?? "") ||
      draft.excerpt !== (post.excerpt ?? "") ||
      draft.body !== (post.body ?? "") ||
      draft.seo_title !== (post.seo_title ?? "") ||
      draft.seo_description !== (post.seo_description ?? "") ||
      draft.canonical_url !== (post.canonical_url ?? "")
    : draft.body !== (post.body ?? "");
  const styleProfile = styleProfiles.find(
    (link) => link.style_profile_id === post.style_profile_id,
  )?.style_profile;
  const isEditableStatus = EDITABLE_STATUSES.includes(
    post.status as (typeof EDITABLE_STATUSES)[number],
  );

  function save() {
    const dto: UpdatePostDto = isBlog
      ? {
          title: draft.title,
          excerpt: draft.excerpt,
          body: draft.body,
          seo_title: draft.seo_title,
          seo_description: draft.seo_description,
          canonical_url: draft.canonical_url,
        }
      : { body: draft.body };
    updatePost({ id: post.id, dto });
  }

  function handleRevised(revised: RevisedPostDraft) {
    setDraft((d) => ({
      ...d,
      body: revised.body,
      ...(isBlog
        ? {
            title: revised.title ?? d.title,
            excerpt: revised.excerpt ?? d.excerpt,
          }
        : {}),
    }));
    toast({
      title: "Revision ready",
      description: "Review the changes below, then save.",
      duration: 2500,
    });
  }

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow",
          showHighlight && "ring-2 ring-brass-ink ring-offset-2",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {styleProfile && <DnaBadge name={styleProfile.name} />}
            {isBlog && (
              <Textarea
                ref={titleRef}
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="Post title"
                rows={1}
                className="font-display min-h-0 flex-1 resize-none overflow-hidden border-none px-0 text-lg font-semibold leading-snug shadow-none focus-visible:ring-0"
              />
            )}
            {!isBlog && post.hook && (
              <Badge
                variant="pill"
                className="bg-coral-soft font-semibold text-coral"
              >
                {post.hook}
              </Badge>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 flex-none"
            onClick={() => setIsExpanded(true)}
            aria-label="Expand post"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isBlog && (
          <Textarea
            value={draft.excerpt}
            onChange={(e) =>
              setDraft((d) => ({ ...d, excerpt: e.target.value }))
            }
            placeholder="Excerpt — shown in previews and RSS"
            rows={2}
            className="text-xs"
          />
        )}

        {isBlog && post.attachments && post.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Cover image candidates
            </span>
            <div className="flex flex-wrap gap-2">
              {post.attachments.map((attachment) => {
                const isCover =
                  attachment.document_id === post.cover_document_id;
                return (
                  <div
                    key={attachment.id}
                    className="group relative h-16 w-16 flex-none overflow-hidden rounded-lg border"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updatePost({
                          id: post.id,
                          dto: { cover_document_id: attachment.document_id },
                        })
                      }
                      className={cn(
                        "block h-full w-full",
                        isCover
                          ? "ring-2 ring-brass-ink ring-offset-1"
                          : "opacity-80 hover:opacity-100",
                      )}
                    >
                      {attachment.document?.url && (
                        <img
                          src={attachment.document.url}
                          alt="Cover candidate"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                    {isCover && (
                      <span className="absolute bottom-0 left-0 right-0 bg-brass-ink px-1 py-0.5 text-center text-[10px] font-semibold text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteDocument(attachment.document_id)}
                      className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                      aria-label="Discard candidate"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Textarea
          value={draft.body}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          rows={6}
          className="text-sm leading-relaxed"
        />

        {isBlog && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              SEO
            </span>
            <Input
              value={draft.seo_title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, seo_title: e.target.value }))
              }
              placeholder="SEO title"
              className="text-xs"
            />
            <Input
              value={draft.seo_description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, seo_description: e.target.value }))
              }
              placeholder="SEO description"
              className="text-xs"
            />
            <Input
              value={draft.canonical_url}
              onChange={(e) =>
                setDraft((d) => ({ ...d, canonical_url: e.target.value }))
              }
              placeholder="Canonical URL"
              className="text-xs"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!isDirty || isSaving}
              loading={isSaving}
              onClick={save}
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Repurpose
            </Button>
          </div>

          {isEditableStatus ? (
            <Select
              value={post.status}
              onValueChange={(value) =>
                updatePost({
                  id: post.id,
                  dto: { status: value as UpdatePostDto["status"] },
                })
              }
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
            <PostStatusTag
              status={post.status}
              title={
                post.status === PostStatuses.FAILED
                  ? (post.failed_reason ?? undefined)
                  : undefined
              }
            />
          )}
        </div>
      </div>

      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader className="text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SheetTitle className="font-display text-xl">
                {post.title || post.hook || "Untitled post"}
              </SheetTitle>
              {styleProfile && <DnaBadge name={styleProfile.name} />}
            </div>
          </SheetHeader>

          <div className="mt-4">
            <PostAiRevisePanel
              postId={post.id}
              postType={platform}
              onRevised={handleRevised}
            />
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-4">
            {isBlog && (
              <>
                <Input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="Post title"
                  className="font-display h-auto border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                />
                <Textarea
                  value={draft.excerpt}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, excerpt: e.target.value }))
                  }
                  placeholder="Excerpt — shown in previews and RSS"
                  rows={2}
                  className="text-xs"
                />
              </>
            )}

            {!isBlog && post.hook && (
              <Badge
                variant="pill"
                className="w-fit bg-coral-soft font-semibold text-coral"
              >
                {post.hook}
              </Badge>
            )}

            <Textarea
              value={draft.body}
              onChange={(e) =>
                setDraft((d) => ({ ...d, body: e.target.value }))
              }
              rows={20}
              className="flex-1 text-sm leading-relaxed"
            />

            {isBlog && (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  SEO
                </span>
                <Input
                  value={draft.seo_title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, seo_title: e.target.value }))
                  }
                  placeholder="SEO title"
                  className="text-xs"
                />
                <Input
                  value={draft.seo_description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, seo_description: e.target.value }))
                  }
                  placeholder="SEO description"
                  className="text-xs"
                />
                <Input
                  value={draft.canonical_url}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, canonical_url: e.target.value }))
                  }
                  placeholder="Canonical URL"
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
            <PostStatusTag
              status={post.status}
              title={
                post.status === PostStatuses.FAILED
                  ? (post.failed_reason ?? undefined)
                  : undefined
              }
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={!isDirty || isSaving}
              loading={isSaving}
              onClick={save}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
