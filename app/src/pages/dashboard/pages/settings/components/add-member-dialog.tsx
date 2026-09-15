import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAddOrganisationMember } from "@/features/organisations/hooks/use-organisations";
import { OrganisationRoles } from "@/features/organisations/interfaces/organisations.interfaces";
import { OrganisationRoleFormOptions } from "@/config/constants/dropdowns/organisations/organisation-role-form.options";
import { getOrganisationRoleDescription } from "@/config/constants/dropdowns/organisations/organisation-role-description.options";
import { addMemberSchema, type AddMemberFormData } from "../validation-schemas/organisation.schema";

const CREATABLE_ROLES = OrganisationRoleFormOptions.filter((option) => option.id !== OrganisationRoles.OWNER);

interface AddMemberDialogProps {
  organisationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberDialog({ organisationId, isOpen, onClose }: AddMemberDialogProps) {
  const { mutate, isPending } = useAddOrganisationMember();

  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: "", email: "", send_invite: true, password: "", role: OrganisationRoles.MEMBER },
  });

  const sendInvite = form.watch("send_invite");

  function handleClose() {
    if (isPending) return;
    form.reset();
    onClose();
  }

  function onSubmit(data: AddMemberFormData) {
    mutate(
      { organisationId, dto: { ...data, password: data.send_invite ? undefined : data.password } },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>By default, an invitation email is sent so they can set their own password. Uncheck the box below to set a password for them directly instead.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="send_invite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2.5 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="font-normal">Send an invitation email</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {!sendInvite && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2">
                      {CREATABLE_ROLES.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`role-${option.id}`}
                          className={cn(
                            "flex cursor-pointer items-start gap-2.5 rounded-md border border-input p-3 font-normal",
                            field.value === option.id && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value={option.id} id={`role-${option.id}`} className="mt-1" />
                          <span>
                            <span className="block text-sm font-medium">{option.label}</span>
                            <span className="block text-xs text-muted-foreground">{getOrganisationRoleDescription(option.id)}</span>
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
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
                Add member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
