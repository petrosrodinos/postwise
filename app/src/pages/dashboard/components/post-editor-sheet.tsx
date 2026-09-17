import { useEffect, useState } from "react";
import { Copy, Download, Maximize2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { DnaBadge } from "@/components/ui/dna-badge";
import { PostStatusTag } from "@/components/ui/post-status-tag";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getPostStatusLabel } from "@/config/constants/dropdowns/posts/post-status-filter.options";
import { useUpdatePost } from "@/features/posts/hooks/use-posts";
import { useDeleteDocument } from "@/features/documents/hooks/use-documents";
import { PostStatuses, PostTypes, type Post, type RevisedPostDraft, type UpdatePostDto } from "@/features/posts/interfaces/posts.interfaces";
import { PostAiRevisePanel } from "./post-ai-revise-panel";

const EDITABLE_STATUSES = [PostStatuses.DRAFT, PostStatuses.REVIEW, PostStatuses.READY];

interface PostEditorSheetProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleProfileName?: string | null;
}

// The single post editor side sheet (title/body/SEO/cover-image/revise),
// shared between the project-generate flow and the posts list so both
// surfaces open the exact same editing experience.
export function PostEditorSheet({ post, open, onOpenChange, styleProfileName }: PostEditorSheetProps) {
  const { mutate: updatePost, isPending: isSaving } = useUpdatePost();
  const { mutate: deleteDocument, isPending: isDeletingDocument } = useDeleteDocument();

  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    seo_title: post?.seo_title ?? "",
    seo_description: post?.seo_description ?? "",
    canonical_url: post?.canonical_url ?? "",
  });

  useEffect(() => {
    setDraft({
      title: post?.title ?? "",
      excerpt: post?.excerpt ?? "",
      body: post?.body ?? "",
      seo_title: post?.seo_title ?? "",
      seo_description: post?.seo_description ?? "",
      canonical_url: post?.canonical_url ?? "",
    });
  }, [post?.id, post?.title, post?.excerpt, post?.body, post?.seo_title, post?.seo_description, post?.canonical_url]);

  if (!post) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-2xl" />
      </Sheet>
    );
  }

  const isBlog = post.type === PostTypes.BLOG;
  const isInstagram = post.type === PostTypes.INSTAGRAM;
  const hasImagePicker = isBlog || isInstagram;
  const isDirty = isBlog
    ? draft.title !== (post.title ?? "") ||
      draft.excerpt !== (post.excerpt ?? "") ||
      draft.body !== (post.body ?? "") ||
      draft.seo_title !== (post.seo_title ?? "") ||
      draft.seo_description !== (post.seo_description ?? "") ||
      draft.canonical_url !== (post.canonical_url ?? "")
    : draft.body !== (post.body ?? "");
  const isEditableStatus = EDITABLE_STATUSES.includes(post.status as (typeof EDITABLE_STATUSES)[number]);
  const hasContent = [draft.title, draft.body, draft.excerpt, post.hook].some((value) => !!value?.trim());

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
    updatePost({ id: post!.id, dto });
  }

  function copyToClipboard(value: string, label: string) {
    if (!value.trim()) return;
    navigator.clipboard.writeText(value);
    toast({ title: `${label} copied`, duration: 1500 });
  }

  async function downloadImage(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop()?.split("?")[0] || "cover-image";
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noreferrer");
    }
  }

  function handleRevised(revised: RevisedPostDraft) {
    setDraft((d) => ({
      ...d,
      body: revised.body,
      ...(isBlog ? { title: revised.title ?? d.title, excerpt: revised.excerpt ?? d.excerpt } : {}),
    }));
    toast({ title: "Revision ready", description: "Review the changes below, then save.", duration: 2500 });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SheetTitle className="font-display text-xl">{post.title || post.hook || "Untitled post"}</SheetTitle>
              {styleProfileName && <DnaBadge name={styleProfileName} />}
            </div>
          </SheetHeader>

          <div className="mt-4">
            <PostAiRevisePanel postId={post.id} postType={post.type} hasContent={hasContent} onRevised={handleRevised} />
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-4">
            {isBlog && (
              <>
                <div className="flex items-center gap-1">
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder="Post title"
                    className="font-display h-auto flex-1 border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    disabled={!draft.title.trim()}
                    onClick={() => copyToClipboard(draft.title, "Title")}
                    aria-label="Copy title"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-start gap-1">
                  <Textarea
                    value={draft.excerpt}
                    onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                    placeholder="Excerpt — shown in previews and RSS"
                    rows={2}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    disabled={!draft.excerpt.trim()}
                    onClick={() => copyToClipboard(draft.excerpt, "Excerpt")}
                    aria-label="Copy excerpt"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}

            {!isBlog && post.hook && (
              <Badge variant="pill" className="w-fit bg-coral-soft font-semibold text-coral">
                {post.hook}
              </Badge>
            )}

            {isBlog ? (
              <RichTextEditor value={draft.body} onChange={(html) => setDraft((d) => ({ ...d, body: html }))} className="flex-1" />
            ) : (
              <div className="relative flex-1">
                <Textarea
                  value={draft.body}
                  onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                  rows={20}
                  className="h-full text-sm leading-relaxed"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-7 w-7 text-muted-foreground"
                  disabled={!draft.body.trim()}
                  onClick={() => copyToClipboard(draft.body, "Post")}
                  aria-label="Copy post"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {hasImagePicker && post.attachments && post.attachments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Cover image candidates</span>
                <div className="flex flex-wrap gap-3">
                  {post.attachments.map((attachment) => {
                    const isCover = attachment.document_id === post.cover_document_id;
                    return (
                      <div key={attachment.id} className="group relative h-28 w-28 flex-none overflow-hidden rounded-lg border sm:h-32 sm:w-32">
                        <button
                          type="button"
                          onClick={() => updatePost({ id: post.id, dto: { cover_document_id: attachment.document_id } })}
                          className={cn("block h-full w-full", isCover ? "ring-2 ring-brass-ink ring-offset-1" : "opacity-80 hover:opacity-100")}
                        >
                          {attachment.document?.url && (
                            <img src={attachment.document.url} alt="Cover candidate" className="h-full w-full object-cover" />
                          )}
                        </button>
                        {isCover && (
                          <span className="absolute bottom-0 left-0 right-0 bg-brass-ink px-1 py-0.5 text-center text-[10px] font-semibold text-white">
                            Cover
                          </span>
                        )}
                        {attachment.document?.url && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                                aria-label="Image options"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => setExpandedImageUrl(attachment.document!.url!)}>
                                <Maximize2 className="h-4 w-4" />
                                Expand
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadImage(attachment.document!.url!)}>
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteCandidateId(attachment.document_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isBlog && (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <span className="text-xs font-semibold uppercase text-muted-foreground">SEO</span>
                <Input
                  value={draft.seo_title}
                  onChange={(e) => setDraft((d) => ({ ...d, seo_title: e.target.value }))}
                  placeholder="SEO title"
                  className="text-xs"
                />
                <Input
                  value={draft.seo_description}
                  onChange={(e) => setDraft((d) => ({ ...d, seo_description: e.target.value }))}
                  placeholder="SEO description"
                  className="text-xs"
                />
                <Input
                  value={draft.canonical_url}
                  onChange={(e) => setDraft((d) => ({ ...d, canonical_url: e.target.value }))}
                  placeholder="Canonical URL"
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
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
              <PostStatusTag
                status={post.status}
                title={post.status === PostStatuses.FAILED ? (post.failed_reason ?? undefined) : undefined}
              />
            )}
            <Button size="sm" variant="secondary" disabled={!isDirty || isSaving} loading={isSaving} onClick={save}>
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!expandedImageUrl} onOpenChange={(open) => !open && setExpandedImageUrl(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {expandedImageUrl && <img src={expandedImageUrl} alt="Cover candidate preview" className="h-auto w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={!!deleteCandidateId}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={() => {
          if (!deleteCandidateId) return;
          deleteDocument(deleteCandidateId, { onSuccess: () => setDeleteCandidateId(null) });
        }}
        title="Delete image?"
        description="This cover image candidate will be permanently deleted."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingDocument}
      />
    </>
  );
}
