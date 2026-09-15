import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateOrganisation } from "@/features/organisations/hooks/use-organisations";
import { useWorkspaceStore } from "@/stores/workspace";

const createOrganisationSchema = z.object({
  name: z.string().min(1, "Organisation name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
});

type CreateOrganisationFormValues = z.infer<typeof createOrganisationSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CreateOrganisationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrganisationDialog({ isOpen, onClose }: CreateOrganisationDialogProps) {
  const { mutate, isPending } = useCreateOrganisation();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const form = useForm<CreateOrganisationFormValues>({
    resolver: zodResolver(createOrganisationSchema),
    defaultValues: { name: "", slug: "" },
  });

  function onSubmit(data: CreateOrganisationFormValues) {
    mutate(data, {
      onSuccess: (organisation) => {
        setActiveWorkspace({ id: organisation.id, name: organisation.name });
        form.reset();
        onClose();
      },
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organisation</DialogTitle>
          <DialogDescription>Create a separate workspace for a brand's content, channels and members.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!form.formState.dirtyFields.slug) {
                          form.setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="acme-inc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Create organisation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
