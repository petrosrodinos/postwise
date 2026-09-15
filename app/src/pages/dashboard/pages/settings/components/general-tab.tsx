import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Routes } from "@/routes/routes";
import { useWorkspaceStore } from "@/stores/workspace";
import { useDeleteOrganisation, useUpdateOrganisation } from "@/features/organisations/hooks/use-organisations";
import type { Organisation } from "@/features/organisations/interfaces/organisations.interfaces";
import { organisationGeneralSchema, type OrganisationGeneralFormData } from "../validation-schemas/organisation.schema";

interface GeneralTabProps {
  organisation: Organisation;
}

export function GeneralTab({ organisation }: GeneralTabProps) {
  const navigate = useNavigate();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const { mutate: updateOrganisation, isPending: isSaving } = useUpdateOrganisation();
  const { mutate: deleteOrganisation, isPending: isDeleting } = useDeleteOrganisation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<OrganisationGeneralFormData>({
    resolver: zodResolver(organisationGeneralSchema),
    defaultValues: { name: organisation.name, slug: organisation.slug },
  });

  useEffect(() => {
    form.reset({ name: organisation.name, slug: organisation.slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisation.id]);

  function onSubmit(data: OrganisationGeneralFormData) {
    updateOrganisation(
      { id: organisation.id, dto: data },
      { onSuccess: () => setActiveWorkspace({ id: organisation.id, name: data.name }) },
    );
  }

  function handleDelete() {
    deleteOrganisation(organisation.id, {
      onSuccess: () => {
        setActiveWorkspace(null);
        navigate(Routes.dashboard.root);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Used in shareable links.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" disabled={isSaving} loading={isSaving}>
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="max-w-xl border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Delete organisation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Permanently deletes {organisation.name}'s posts, brand assets, members and connected channels. This cannot be undone.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${organisation.name}?`}
        description="This permanently deletes its posts, brand assets, members and connected channels. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
