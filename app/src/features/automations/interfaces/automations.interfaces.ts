export const AutomationFrequencies = {
  DAILY: "DAILY",
  WEEKDAYS: "WEEKDAYS",
  WEEKLY: "WEEKLY",
} as const;
export type AutomationFrequency = (typeof AutomationFrequencies)[keyof typeof AutomationFrequencies];

export const AutomationOutputStages = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISH: "PUBLISH",
} as const;
export type AutomationOutputStage = (typeof AutomationOutputStages)[keyof typeof AutomationOutputStages];

export interface Automation {
  id: string;
  project_id: string;
  style_profile_id?: string | null;
  rss_feed_id?: string | null;
  name: string;
  is_active: boolean;
  frequency: AutomationFrequency;
  days_of_week: number[];
  time_of_day: string;
  timezone: string;
  posts_per_run: number;
  output_stage: AutomationOutputStage;
  generate_images: boolean;
  image_count: number;
  last_run_at?: string | null;
  next_run_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationDto {
  project_id: string;
  style_profile_id?: string;
  rss_feed_id?: string;
  name: string;
  is_active?: boolean;
  frequency: AutomationFrequency;
  days_of_week?: number[];
  time_of_day: string;
  timezone?: string;
  posts_per_run?: number;
  output_stage?: AutomationOutputStage;
  generate_images?: boolean;
  image_count?: number;
}

export type UpdateAutomationDto = Partial<Omit<CreateAutomationDto, "project_id">>;

export interface AutomationsQueryType {
  page?: number;
  limit?: number;
  project_id: string;
}
