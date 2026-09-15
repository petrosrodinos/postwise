export const OrganisationRoles = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;
export type OrganisationRole = (typeof OrganisationRoles)[keyof typeof OrganisationRoles];

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganisationMember {
  id: string;
  organisation_id: string;
  user_id: string;
  role: OrganisationRole;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export interface CreateOrganisationDto {
  name: string;
  slug: string;
}

export type UpdateOrganisationDto = Partial<CreateOrganisationDto>;

export interface AddOrganisationMemberDto {
  name: string;
  email: string;
  password: string;
  role: OrganisationRole;
}

export interface UpdateOrganisationMemberDto {
  role: OrganisationRole;
}
