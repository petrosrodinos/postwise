import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateRssFeed, useUpdateRssFeed } from "@/features/rss-feeds/hooks/use-rss-feeds";
import type { RssFeed } from "@/features/rss-feeds/interfaces/rss-feeds.interfaces";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Enter a valid feed URL"),
});

type FormData = z.infer<typeof schema>;

interface RssFeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feed?: RssFeed | null;
}

export function RssFeedDialog({ isOpen, onClose, feed }: RssFeedDialogProps) {
  const isEditing = !!feed;
  const { mutate: createRssFeed, isPending: isCreating } = useCreateRssFeed();
  const { mutate: updateRssFeed, isPending: isUpdating } = useUpdateRssFeed();
  const isPending = isCreating || isUpdating;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: feed?.name ?? "", url: feed?.url ?? "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: feed?.name ?? "", url: feed?.url ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, feed?.id]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(data: FormData) {
    if (isEditing) {
      updateRssFeed({ id: feed!.id, dto: data }, { onSuccess: onClose });
    } else {
      createRssFeed(data, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit RSS feed" : "Add an RSS feed"}</DialogTitle>
          <DialogDescription>Attach it to a project to generate blog posts from its latest items.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company blog" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feed URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/feed" {...field} />
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
                {isEditing ? "Save changes" : "Add feed"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
