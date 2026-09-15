import { OrganisationRole } from 'generated/prisma';

export interface OwnerContext {
  organisation_id: string;
  role: OrganisationRole;
}
