import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { useUpdateMyPassword } from "@/features/user/hooks/use-user";
import { changePasswordSchema, type ChangePasswordFormData } from "../validation-schemas/profile.schema";

export function ChangePasswordForm() {
  const { mutate, isPending } = useUpdateMyPassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  function onSubmit(data: ChangePasswordFormData) {
    mutate(
      { current_password: data.current_password, new_password: data.new_password },
      { onSuccess: () => form.reset() },
    );
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Change password</CardTitle>
        <p className="text-sm text-muted-foreground">Updates immediately — no confirmation email is sent.</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter your current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="At least 8 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Re-enter your new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
