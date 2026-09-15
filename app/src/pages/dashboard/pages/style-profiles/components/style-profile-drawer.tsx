import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlatformChip } from "@/components/ui/platform-glyph";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { getPostTypeLabel } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { Routes } from "@/routes/routes";
import { useDeleteStyleProfile } from "@/features/style-profiles/hooks/use-style-profiles";
import { isStyleProfileAnalyzed } from "@/features/style-profiles/utils/style-profiles.utils";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";
import { AddSamplePostsDialog } from "./add-sample-posts-dialog";
import { EditStyleProfileForm } from "./edit-style-profile-form";

interface StyleProfileDrawerProps {
  profile: StyleProfile | null;
  onClose: () => void;
}

export function StyleProfileDrawer({ profile, onClose }: StyleProfileDrawerProps) {
  const navigate = useNavigate();
  const [isAddSamplesOpen, setIsAddSamplesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteStyleProfile();

  const isOpen = !!profile;
  const analyzed = profile ? isStyleProfileAnalyzed(profile) : false;

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  function handleDelete() {
    if (!profile) return;
    deleteProfile(profile.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        handleClose();
      },
    });
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {profile && isEditing ? (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl">Edit style profile</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <EditStyleProfileForm profile={profile} onCancel={() => setIsEditing(false)} onSaved={() => setIsEditing(false)} />
              </div>
            </>
          ) : (
            profile && (
              <>
                <SheetHeader className="text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {profile.source_url && <div className="mb-1 text-xs text-muted-foreground">{profile.source_url}</div>}
                      <SheetTitle className="font-display text-2xl">{profile.name}</SheetTitle>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <PlatformChip platform={profile.platform} label={getPostTypeLabel(profile.platform)} />
                        <span>
                          {profile.posts_analyzed} posts analyzed · updated {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteOpen(true)}>
                          Delete profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-6">
                  {analyzed ? (
                    <>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Tone & voice</div>
                        <p className="text-sm leading-relaxed">{profile.tone_description}</p>
                      </div>

                      {profile.dominant_hook && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Signature hook</div>
                          <div className="flex items-center gap-2.5">
                            <Badge variant="pill" className="bg-coral-soft px-3 py-1 text-sm font-semibold text-coral">
                              {profile.dominant_hook}
                            </Badge>
                            <span className="text-sm text-muted-foreground">used to open most high-performing posts</span>
                          </div>
                        </div>
                      )}

                      {profile.vocabulary.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Vocabulary & recurring phrases</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {profile.vocabulary.slice(0, 10).map((word) => (
                              <span key={word} className="font-semibold text-brass-ink">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.pillars.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Content pillars observed</div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.pillars.map((pillar) => (
                              <Badge key={pillar} variant="pill">
                                {pillar}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      This profile hasn't been analyzed yet. Add sample posts to build its Style DNA.
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setIsAddSamplesOpen(true)}>
                    {analyzed ? "Add more sample posts" : "Analyze"}
                  </Button>
                  <Button onClick={() => navigate(Routes.dashboard.projects)}>Use in new project</Button>
                </div>
              </>
            )
          )}
        </SheetContent>
      </Sheet>

      {profile && (
        <>
          <AddSamplePostsDialog isOpen={isAddSamplesOpen} onClose={() => setIsAddSamplesOpen(false)} styleProfileId={profile.id} />
          <ConfirmationDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete style profile?"
            description={`"${profile.name}" will be permanently deleted. Projects using it will keep their posts but lose this voice reference.`}
            confirmText="Delete"
            variant="destructive"
            isLoading={isDeleting}
          />
        </>
      )}
    </>
  );
}
