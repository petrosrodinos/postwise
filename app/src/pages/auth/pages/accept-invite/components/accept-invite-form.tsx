import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { AcceptInviteSchema, type AcceptInviteFormValues } from "../../../validation-schemas/auth";
import { useAcceptInvitation } from "@/features/auth/hooks/use-auth";
import type { InvitationDetails } from "@/features/organisations/interfaces/organisations.interfaces";

interface AcceptInviteFormProps {
  token: string;
  details: InvitationDetails;
}

export function AcceptInviteForm({ token, details }: AcceptInviteFormProps) {
  const { mutate, isPending } = useAcceptInvitation();

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(AcceptInviteSchema),
    defaultValues: {
      name: details.name,
      email: details.email,
      password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    form.reset({ name: details.name, email: details.email, password: "", confirm_password: "" });
  }, [details, form]);

  function onSubmit(data: AcceptInviteFormValues) {
    mutate({ token, password: data.password, name: data.name });
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isPending} loading={isPending}>
              Set password &amp; continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
