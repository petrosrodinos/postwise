import type { StyleProfile } from "../interfaces/style-profiles.interfaces";

export interface StyleProfileTraits {
  tone: number;
  structure: number;
  hooks: number;
  vocabulary: number;
  rhythm: number;
}

// Maps the raw *_score columns to the 0-100 trait shape the Style DNA
// "strand" visualization renders, defaulting un-analyzed scores to 0.
export function getStyleProfileTraits(profile: Pick<StyleProfile, "tone_score" | "structure_score" | "hooks_score" | "vocabulary_score" | "rhythm_score">): StyleProfileTraits {
  return {
    tone: profile.tone_score ?? 0,
    structure: profile.structure_score ?? 0,
    hooks: profile.hooks_score ?? 0,
    vocabulary: profile.vocabulary_score ?? 0,
    rhythm: profile.rhythm_score ?? 0,
  };
}

export function isStyleProfileAnalyzed(profile: Pick<StyleProfile, "last_analyzed_at">): boolean {
  return !!profile.last_analyzed_at;
}
