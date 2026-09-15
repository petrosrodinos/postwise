import { ActivityLogAction, ActivityLogEntityType } from 'generated/prisma';

export interface LogActivityParams {
  organisation_id: string | null;
  user_id: string | null;
  action: ActivityLogAction;
  entity_type?: ActivityLogEntityType;
  entity_id?: string;
  description: string;
  metadata?: Record<string, unknown>;
}
