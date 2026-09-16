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
import { RichTextEditor } from "./components/rich-text-editor";
import { ToolsAiAssistPanel } from "./components/tools-ai-assist-panel";
import { TitleVariationsPanel } from "./components/title-variations-panel";
import { MetaTagsPanel } from "./components/meta-tags-panel";
import { ImagesPanel } from "./components/images-panel";

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

  function handleRevised(revised: RevisedPostDraft) {
    setDraft((d) => ({
      ...d,
      body: revised.body,
      ...(isLongForm
        ? { title: revised.title ?? d.title, excerpt: revised.excerpt ?? d.excerpt }
        : { hook: revised.hook ?? d.hook }),
    }));
  }

  function handleRepurposed(targetType: ToolContentType, repurposed: RepurposedContentDraft) {
    setDraft((d) => ({
      ...d,
      type: targetType,
      body: repurposed.body,
      hook: repurposed.hook ?? "",
      title: repurposed.title ?? "",
      excerpt: repurposed.excerpt ?? "",
    }));
  }

  function handleMetaTagsApplied(applied: MetaTagsDraft) {
    setDraft((d) => ({ ...d, seo_title: applied.seo_title, seo_description: applied.seo_description }));
  }

  // Blog/Email store `body` as rich HTML while Twitter/X store it as plain
  // text — carrying either one across that boundary unchanged would leak
  // raw HTML tags into the plain textarea (or plain text into the rich
  // editor), so content resets when the picker crosses it. Switching within
  // a shape (Blog <-> Email, or LinkedIn <-> Twitter) keeps everything.
  function handleContentTypeChange(type: ToolContentType) {
    setDraft((d) => {
      const wasLongForm = d.type === ToolContentTypes.BLOG || d.type === ToolContentTypes.EMAIL;
      const isLongFormNow = type === ToolContentTypes.BLOG || type === ToolContentTypes.EMAIL;
      if (wasLongForm === isLongFormNow) return { ...d, type };
      return { ...d, type, title: "", hook: "", excerpt: "", body: "" };
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
        <ToolContentTypePicker value={draft.type} onChange={handleContentTypeChange} />

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
          <>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={draft.type === ToolContentTypes.EMAIL ? "Subject line" : "Title"}
              className="font-display h-auto text-lg font-semibold"
            />
            <Textarea
              value={draft.excerpt}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              placeholder={draft.type === ToolContentTypes.EMAIL ? "Preview text" : "Excerpt"}
              rows={2}
              className="text-sm"
            />
          </>
        ) : (
          <Input
            value={draft.hook}
            onChange={(e) => setDraft((d) => ({ ...d, hook: e.target.value }))}
            placeholder="Hook / opening line"
            className="text-sm"
          />
        )}

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

        {(draft.seo_title || draft.seo_description) && (
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
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <ToolsAiAssistPanel content={draft} onRevised={handleRevised} onRepurposed={handleRepurposed} />

        <Tabs defaultValue="titles">
          <TabsList>
            <TabsTrigger value="titles">Title variations</TabsTrigger>
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
