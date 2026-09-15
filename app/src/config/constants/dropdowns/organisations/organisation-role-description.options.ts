import { OrganisationRoles, type OrganisationRole } from "@/features/organisations/interfaces/organisations.interfaces";

export const OrganisationRoleDescriptionOptions: { id: OrganisationRole; description: string }[] = [
  { id: OrganisationRoles.OWNER, description: "Full control, including billing and deleting the organisation." },
  { id: OrganisationRoles.ADMIN, description: "Manage members, brand assets, channels and all content." },
  { id: OrganisationRoles.MEMBER, description: "Create, edit, schedule and publish their own content." },
];

export function getOrganisationRoleDescription(role: OrganisationRole | string): string {
  return OrganisationRoleDescriptionOptions.find((option) => option.id === role)?.description ?? "";
}
