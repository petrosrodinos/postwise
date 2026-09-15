// Shared shape for any domain entity that follows the "owned by a user OR an
// organisation, never both" pattern (Document, Post, Project, StyleProfile,
// SocialChannelConnection).
export interface OwnedEntity {
  organisation_id?: string | null;
}
