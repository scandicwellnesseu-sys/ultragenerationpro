
export type Language = 'en' | 'sv' | 'es' | 'no' | 'da' | 'fi';

export interface SupportedLanguage {
  code: Language;
  name: string;
  flag: string;
}

export type Tone = 'professional' | 'friendly' | 'luxury' | 'playful' | 'adventurous' | 'witty' | 'inspirational' | 'technical' | 'minimalist' | 'urgent';
export type Audience = 'gen-z' | 'millennials' | 'gen-x' | 'boomers' | 'luxury-shoppers' | 'parents' | 'tech-enthusiasts' | 'budget-shoppers' | 'eco-conscious' | 'fitness-enthusiasts' | 'gamers';

export interface GeneratedDescription {
  headline: string;
  body: string;
  meta_description: string;
  feature_bullets: string[];
  seo_keywords: string[];
}

export interface GeneratedInfluencerContent {
    bio: string;
    caption: string;
    hashtags: string[];
}

export interface RegenerationData {
    productTitle: string;
    keywords: string;
    language: Language;
    tone: string;
    audience: string;
}

export interface GenerationRecord extends RegenerationData {
  id: string;
  timestamp: number;
  description: GeneratedDescription;
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface BulkProduct {
  id: string;
  imageFile: ImageFile;
  title: string;
  keywords: string;
  description: GeneratedDescription | null;
  status: 'pending' | 'loading' | 'done' | 'error';
  error?: string;
}
