import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateMe } from "@/features/user/hooks/use-user";
import type { User } from "@/features/user/interfaces/user.interface";
import { personalInfoSchema, type PersonalInfoFormData } from "../validation-schemas/profile.schema";

interface PersonalInfoFormProps {
  user: User;
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const { mutate, isPending } = useUpdateMe();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  useEffect(() => {
    form.reset({ name: user.name, email: user.email });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function onSubmit(data: PersonalInfoFormData) {
    mutate(data);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Personal info</CardTitle>
      </CardHeader>
      <CardContent>
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
            <div>
              <Button type="submit" disabled={isPending} loading={isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
