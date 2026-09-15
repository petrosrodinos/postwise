import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostTypeFormOptions } from "@/config/constants/dropdowns/posts/post-type-form.options";
import { PostTypes } from "@/features/posts/interfaces/posts.interfaces";
import { useUpdateStyleProfile } from "@/features/style-profiles/hooks/use-style-profiles";
import type { StyleProfile } from "@/features/style-profiles/interfaces/style-profiles.interfaces";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum([PostTypes.LINKEDIN, PostTypes.TWITTER, PostTypes.BLOG]),
  source_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface EditStyleProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StyleProfile;
}

export function EditStyleProfileDialog({ isOpen, onClose, profile }: EditStyleProfileDialogProps) {
  const { mutate, isPending } = useUpdateStyleProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, platform: profile.platform, source_url: profile.source_url ?? "" },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: profile.name, platform: profile.platform, source_url: profile.source_url ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profile.id]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(data: FormData) {
    mutate(
      { id: profile.id, dto: { name: data.name, platform: data.platform, source_url: data.source_url || undefined } },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit style profile</DialogTitle>
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
                    <Input {...field} />
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
                        <SelectValue />
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
                  <FormLabel>Source URL</FormLabel>
                  <FormControl>
                    <Input placeholder="linkedin.com/in/username" {...field} />
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
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
