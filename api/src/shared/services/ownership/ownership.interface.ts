import { OrganisationRole } from 'generated/prisma';

export interface OwnerContext {
  user_id?: string;
  organisation_id?: string;
  role?: OrganisationRole;
}
