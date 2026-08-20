export type ContactLabel = 'mobile' | 'work' | 'home' | 'fax' | 'other';

export interface PhoneEntry {
  label: ContactLabel;
  value: string;
}

export interface EmailEntry {
  label: ContactLabel;
  value: string;
}

export type SocialPlatform =
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'github'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'other';

export interface SocialEntry {
  platform: SocialPlatform;
  url: string;
}

export interface CardData {
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  website?: string;
  address?: string;
  notes?: string;
  social: SocialEntry[];
}

export const emptyCard: CardData = {
  firstName: '',
  lastName: '',
  title: '',
  company: '',
  phones: [],
  emails: [],
  website: '',
  address: '',
  notes: '',
  social: [],
};

export interface ReceivedCard {
  id: string;
  card: CardData;
  receivedAt: number;
  myNotes: string;
}

export interface CardPreset {
  id: string;
  name: string;
  card: CardData;
}

export type BubbleShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'blob';

export const BUBBLE_SHAPES: BubbleShape[] = ['circle', 'square', 'triangle', 'hexagon', 'blob'];

export interface ThemePreset {
  id: string;
  name: string;
  /** Page background behind every screen. */
  background: string;
  /** Surface color of the business card / QR widget itself. */
  cardBackground: string;
  /** Text color used for the card's name, values, and notes. */
  text: string;
  /** Buttons, links, and other highlighted card elements. */
  accent: string;
  /** Shape of the decorative background bubbles. Defaults to 'circle' when unset (older saved themes). */
  shape?: BubbleShape;
}

export const DEFAULT_THEME: ThemePreset = {
  id: 'default',
  name: 'Forest',
  background: '#eef4ec',
  cardBackground: '#ffffff',
  text: '#152016',
  accent: '#16a34a',
  shape: 'blob',
};

export const BUILTIN_THEMES: ThemePreset[] = [
  DEFAULT_THEME,
  {
    id: 'builtin-midnight',
    name: 'Midnight',
    background: '#0f1115',
    cardBackground: '#1c1f26',
    text: '#f4f5f7',
    accent: '#60a5fa',
    shape: 'hexagon',
  },
  {
    id: 'builtin-sunset',
    name: 'Sunset',
    background: '#fff4ec',
    cardBackground: '#fff9f2',
    text: '#3a2417',
    accent: '#ea580c',
    shape: 'triangle',
  },
  {
    id: 'builtin-skyblue',
    name: 'Skyblue',
    background: '#f5f6fa',
    cardBackground: '#ffffff',
    text: '#111111',
    accent: '#2563eb',
    shape: 'circle',
  },
  {
    id: 'builtin-rose',
    name: 'Rose',
    background: '#fdf0f5',
    cardBackground: '#ffffff',
    text: '#2b1420',
    accent: '#db2777',
    shape: 'square',
  },
];

export type SaveDestination = 'mylist' | 'contacts';

/** Presets you can create without Liano Pro — the 2nd+ preset requires unlocking Pro. */
export const FREE_PRESET_LIMIT = 1;

export function fullName(card: CardData): string {
  return [card.firstName, card.lastName].filter(Boolean).join(' ').trim();
}

export function isCardEmpty(card: CardData): boolean {
  return !card.firstName && !card.lastName && !card.company;
}

/**
 * Whether the card has anything worth showing beyond FlipCard's front face
 * (which only surfaces the first phone, first email, website, and socials).
 */
export function hasExtraCardDetails(card: CardData): boolean {
  return (
    card.phones.filter((p) => p.value).length > 1 ||
    card.emails.filter((e) => e.value).length > 1 ||
    !!card.address ||
    !!card.notes
  );
}
