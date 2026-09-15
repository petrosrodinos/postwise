import { z } from "zod";

export const organisationGeneralSchema = z.object({
  name: z.string().min(1, "Organisation name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
});

export type OrganisationGeneralFormData = z.infer<typeof organisationGeneralSchema>;

export const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type AddMemberFormData = z.infer<typeof addMemberSchema>;
