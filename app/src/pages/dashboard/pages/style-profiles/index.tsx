import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStyleProfiles } from "@/features/style-profiles/hooks/use-style-profiles";
import { AnalyzeCreatorDialog } from "@/pages/dashboard/components/analyze-creator-dialog";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";
import { StyleProfileCard } from "./components/style-profile-card";
import { StyleProfileDrawer } from "./components/style-profile-drawer";

export default function StyleProfilesPage() {
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StyleProfile | null>(null);

  const { data: profilesPage, isPending } = useStyleProfiles({ limit: 100 });
  const profiles = profilesPage?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Style Profiles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Reusable Style DNA extracted from creators you've analyzed</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">
          Each profile is a reusable fingerprint of how a creator writes — tone, structure, hooks and vocabulary — trained from their own
          published posts.
        </p>
        <Button onClick={() => setIsAnalyzeOpen(true)}>
          <Plus className="h-4 w-4" />
          Analyze a new creator
        </Button>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <h3 className="text-base font-semibold text-foreground">No style profiles yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm">Analyze a creator's own posts to build a reusable Style DNA profile for AI drafting.</p>
          <Button className="mt-4" onClick={() => setIsAnalyzeOpen(true)}>
            Analyze a new creator
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <StyleProfileCard key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} />
          ))}
        </div>
      )}

      <StyleProfileDrawer profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      <AnalyzeCreatorDialog isOpen={isAnalyzeOpen} onClose={() => setIsAnalyzeOpen(false)} />
    </div>
  );
}
