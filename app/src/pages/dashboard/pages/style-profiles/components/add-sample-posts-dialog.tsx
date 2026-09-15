import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAnalyzeStyleProfile } from "@/features/style-profiles/hooks/use-style-profiles";

const schema = z.object({
  sample_posts: z.string().min(1, "Paste at least one sample post"),
});

type FormData = z.infer<typeof schema>;

function samplePostsToArray(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((post) => post.trim())
    .filter(Boolean);
}

interface AddSamplePostsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  styleProfileId: string;
}

export function AddSamplePostsDialog({ isOpen, onClose, styleProfileId }: AddSamplePostsDialogProps) {
  const { mutate, isPending } = useAnalyzeStyleProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sample_posts: "" },
  });

  function handleClose() {
    if (isPending) return;
    form.reset();
    onClose();
  }

  function onSubmit(data: FormData) {
    mutate(
      { id: styleProfileId, dto: { sample_posts: samplePostsToArray(data.sample_posts) } },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add sample posts</DialogTitle>
          <DialogDescription>These are added on top of this profile's existing Style DNA — scores refine as you add more.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="sample_posts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample posts</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Paste more posts, separated by a blank line between each one." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Analyze
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
