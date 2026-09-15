import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { useCreateStyleProfile, useAnalyzeStyleProfile } from "@/features/style-profiles/hooks/use-style-profiles";
import { Routes } from "@/routes/routes";
import { analyzeStyleProfileSchema, samplePostsToArray, type AnalyzeStyleProfileFormData } from "../validation-schemas/style-profile.schema";

interface AnalyzeCreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXTRACTS = ["Tone & voice", "Structural patterns", "Opening hooks", "Vocabulary & phrases"];

export function AnalyzeCreatorDialog({ isOpen, onClose }: AnalyzeCreatorDialogProps) {
  const navigate = useNavigate();
  const { mutateAsync: createStyleProfile, isPending: isCreating } = useCreateStyleProfile();
  const { mutateAsync: analyzeStyleProfile, isPending: isAnalyzing } = useAnalyzeStyleProfile();
  const isPending = isCreating || isAnalyzing;

  const form = useForm<AnalyzeStyleProfileFormData>({
    resolver: zodResolver(analyzeStyleProfileSchema),
    defaultValues: { name: "", platform: undefined, source_url: "", sample_posts: "" },
  });

  function handleClose() {
    if (isPending) return;
    form.reset();
    onClose();
  }

  async function onSubmit(data: AnalyzeStyleProfileFormData) {
    const profile = await createStyleProfile({
      name: data.name,
      platform: data.platform,
      source_url: data.source_url || undefined,
    });
    await analyzeStyleProfile({ id: profile.id, dto: { sample_posts: samplePostsToArray(data.sample_posts) } });
    form.reset();
    onClose();
    navigate(Routes.dashboard.style_profiles);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Analyze a creator</DialogTitle>
          <DialogDescription>Build a reusable Style DNA profile from a creator's own writing.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile name</FormLabel>
                  <FormControl>
                    <Input placeholder="My LinkedIn voice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PostTypeFormOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="linkedin.com/in/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sample_posts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample posts</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder={"Paste a handful of the creator's best posts, separated by a blank line between each one."} {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Signal fingerprints tone, structure, hooks and vocabulary from what you paste here.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
              {EXTRACTS.map((item) => (
                <div key={item} className="text-xs font-medium text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Analyze creator
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
