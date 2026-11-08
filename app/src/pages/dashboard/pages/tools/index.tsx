import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import type { RevisedPostDraft } from "@/features/posts/interfaces/posts.interfaces";
import {
  ToolContentTypes,
  type MetaTagsDraft,
  type RepurposedContentDraft,
  type ToolContentType,
} from "@/features/tools/interfaces/tools.interfaces";
import { ToolContentTypePicker } from "./components/tool-content-type-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ToolsAiAssistPanel } from "./components/tools-ai-assist-panel";
import { TitleVariationsPanel } from "./components/title-variations-panel";
import { MetaTagsPanel } from "./components/meta-tags-panel";
import { ImagesPanel } from "./components/images-panel";
import { FormatPanel } from "./components/format-panel";
import { htmlToPlainText, plainTextToHtml } from "./utils/export-content";
import { ExportMenu } from "./components/export-menu";
import { AiResultPanel } from "./components/change-preview";
import { countWords } from "./utils/count-words";

const NONE_STYLE_PROFILE = "none";

export default function ToolsPage() {
  const [draft, setDraft] = useState({
    type: ToolContentTypes.LINKEDIN as ToolContentType,
    style_profile_id: "",
    title: "",
    hook: "",
    body: "",
    excerpt: "",
    seo_title: "",
    seo_description: "",
  });

  // Style profiles only ever have a real Post platform (never EMAIL), so
  // the filter is dropped entirely once the user picks Email.
  const styleProfilePlatform = draft.type !== ToolContentTypes.EMAIL ? draft.type : undefined;
  const { data: styleProfilesPage } = useStyleProfiles({ limit: 100, platform: styleProfilePlatform });
  const styleProfiles = styleProfilesPage?.data ?? [];

  const isLongForm = draft.type === ToolContentTypes.BLOG || draft.type === ToolContentTypes.EMAIL;

  // AI tools that rewrite the body don't overwrite the draft directly: the
  // result is parked here and shown next to the original (before/after)
  // until the user applies or discards it.
  const [pending, setPending] = useState<{ label: string; before: typeof draft; after: typeof draft } | null>(null);

  function proposeChange(label: string, makeNext: (current: typeof draft) => typeof draft) {
    setPending({ label, before: draft, after: makeNext(draft) });
  }

  function handleRevised(revised: RevisedPostDraft) {
    proposeChange("AI edit", (d) => ({
      ...d,
      body: revised.body,
      ...(isLongForm
        ? { title: revised.title ?? d.title, excerpt: revised.excerpt ?? d.excerpt }
        : { hook: revised.hook ?? d.hook }),
    }));
  }

  function handleRepurposed(targetType: ToolContentType, repurposed: RepurposedContentDraft) {
    proposeChange("Repurpose", (d) => ({
      ...d,
      type: targetType,
      body: repurposed.body,
      hook: repurposed.hook ?? "",
      title: repurposed.title ?? "",
      excerpt: repurposed.excerpt ?? "",
    }));
  }

  function handleFormatted(body: string) {
    proposeChange("Format", (d) => ({ ...d, body, hook: isLongForm ? d.hook : "" }));
  }

  function handleMetaTagsApplied(applied: MetaTagsDraft) {
    setDraft((d) => ({ ...d, seo_title: applied.seo_title, seo_description: applied.seo_description }));
  }

  // Blog/Email store `body` as rich HTML while Twitter/LinkedIn store it as
  // plain text, so crossing that boundary converts the body (instead of
  // clearing it) and keeps every field: title/excerpt and hook are carried
  // over rather than dropped.
  function handleContentTypeChange(type: ToolContentType) {
    setDraft((d) => {
      const wasLongForm = d.type === ToolContentTypes.BLOG || d.type === ToolContentTypes.EMAIL;
      const isLongFormNow = type === ToolContentTypes.BLOG || type === ToolContentTypes.EMAIL;
      if (wasLongForm === isLongFormNow) return { ...d, type };
      if (isLongFormNow) {
        return { ...d, type, body: plainTextToHtml(d.body), title: d.title || d.hook };
      }
      return { ...d, type, body: htmlToPlainText(d.body), hook: d.hook || d.title };
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Type or paste any content and use AI to revise it, generate title variations, meta tags or images.
          Nothing here is saved — it's just an editor.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Channel</span>
          <ToolContentTypePicker value={draft.type} onChange={handleContentTypeChange} />
        </div>

        <ToolsAiAssistPanel content={draft} onRevised={handleRevised} onRepurposed={handleRepurposed} />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Style profile (optional)</span>
          <Select
            value={draft.style_profile_id || NONE_STYLE_PROFILE}
            onValueChange={(value) =>
              setDraft((d) => ({ ...d, style_profile_id: value === NONE_STYLE_PROFILE ? "" : value }))
            }
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_STYLE_PROFILE}>None</SelectItem>
              {styleProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLongForm ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {draft.type === ToolContentTypes.EMAIL ? "Subject line" : "Title"}
            </span>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={draft.type === ToolContentTypes.EMAIL ? "Subject line" : "Title"}
              className="font-display h-auto text-lg font-semibold"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Hook</span>
            <Input
              value={draft.hook}
              onChange={(e) => setDraft((d) => ({ ...d, hook: e.target.value }))}
              placeholder="Hook / opening line"
              className="text-sm"
            />
          </div>
        )}

        <div className={pending ? "grid gap-4 md:grid-cols-2" : undefined}>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {pending ? "Before: Body" : "Body"}
              <span className="ml-2 font-normal normal-case tabular-nums">
                {countWords(draft.body, isLongForm)} words
              </span>
            </span>
            <ExportMenu content={{ ...draft, isLongForm }} />
          </div>
          {isLongForm ? (
            <RichTextEditor
              value={draft.body}
              onChange={(body) => setDraft((d) => ({ ...d, body }))}
              placeholder="Body"
            />
          ) : (
            <Textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Body"
              rows={10}
              className="text-sm leading-relaxed"
            />
          )}
        </div>
        {pending && (
          <AiResultPanel
            label={`After: ${pending.label}`}
            current={draft}
            after={pending.after}
            onAfterChange={(after) => setPending((p) => (p ? { ...p, after } : p))}
            onAccept={() => {
              setDraft(pending.after);
              setPending(null);
            }}
            onDiscard={() => setPending(null)}
          />
        )}
        </div>

        {(draft.seo_title || draft.seo_description) && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground">SEO</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">SEO title</span>
              <Input
                value={draft.seo_title}
                onChange={(e) => setDraft((d) => ({ ...d, seo_title: e.target.value }))}
                placeholder="SEO title"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">SEO description</span>
              <Input
                value={draft.seo_description}
                onChange={(e) => setDraft((d) => ({ ...d, seo_description: e.target.value }))}
                placeholder="SEO description"
                className="text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <Tabs defaultValue="titles">
          <TabsList>
            <TabsTrigger value="titles">Title variations</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="meta">Meta tags</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          <TabsContent value="titles">
            <TitleVariationsPanel
              type={draft.type}
              title={draft.title}
              hook={draft.hook}
              body={draft.body}
              styleProfileId={draft.style_profile_id || undefined}
              onApply={(title) => setDraft((d) => ({ ...d, title }))}
            />
          </TabsContent>
          <TabsContent value="format">
            <FormatPanel type={draft.type} hook={draft.hook} body={draft.body} onApply={handleFormatted} />
          </TabsContent>
          <TabsContent value="meta">
            <MetaTagsPanel
              type={draft.type}
              title={draft.title}
              hook={draft.hook}
              body={draft.body}
              excerpt={draft.excerpt}
              onApply={handleMetaTagsApplied}
            />
          </TabsContent>
          <TabsContent value="images">
            <ImagesPanel title={draft.title} body={draft.body} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
