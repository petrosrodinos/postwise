import { OrganisationRoles, type OrganisationRole } from "@/features/organisations/interfaces/organisations.interfaces";

export const OrganisationRoleFormOptions: { id: OrganisationRole; label: string }[] = [
  { id: OrganisationRoles.OWNER, label: "Owner" },
  { id: OrganisationRoles.ADMIN, label: "Admin" },
  { id: OrganisationRoles.MEMBER, label: "Member" },
];

export function getOrganisationRoleLabel(role: OrganisationRole | string): string {
  return OrganisationRoleFormOptions.find((option) => option.id === role)?.label ?? role;
}
