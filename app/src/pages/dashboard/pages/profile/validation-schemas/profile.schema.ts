import { z } from "zod";

export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirmation don't match",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
