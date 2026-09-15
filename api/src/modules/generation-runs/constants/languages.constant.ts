// Ten common languages offered when generating drafts. Codes are ISO 639-1.
export const GENERATION_LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  nl: 'Dutch',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
  hi: 'Hindi',
};

export const GENERATION_LANGUAGE_CODES = Object.keys(GENERATION_LANGUAGES);

export const DEFAULT_GENERATION_LANGUAGE = 'en';
