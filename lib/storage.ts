import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUILTIN_THEMES, CardData, CardPreset, DEFAULT_THEME, ReceivedCard, SaveDestination, ThemePreset } from './types';

const KEY = 'businesscard:my-card';
const RECEIVED_KEY = 'businesscard:received-cards';
const PRESETS_KEY = 'businesscard:presets';
const THEMES_KEY = 'businesscard:themes';
const ACTIVE_THEME_KEY = 'businesscard:active-theme';
const SAVE_DESTINATION_KEY = 'businesscard:default-save-destination';
const WELCOME_KEY = 'businesscard:has-seen-welcome';

export async function loadMyCard(): Promise<CardData | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CardData;
  } catch {
    return null;
  }
}

export async function saveMyCard(card: CardData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(card));
}

export async function clearMyCard(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export async function loadReceivedCards(): Promise<ReceivedCard[]> {
  const raw = await AsyncStorage.getItem(RECEIVED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveReceivedCards(list: ReceivedCard[]): Promise<void> {
  await AsyncStorage.setItem(RECEIVED_KEY, JSON.stringify(list));
}

export async function addReceivedCard(card: CardData): Promise<ReceivedCard> {
  const list = await loadReceivedCards();
  const entry: ReceivedCard = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    card,
    receivedAt: Date.now(),
    myNotes: '',
  };
  await saveReceivedCards([entry, ...list]);
  return entry;
}

export async function updateReceivedCardNotes(id: string, myNotes: string): Promise<void> {
  const list = await loadReceivedCards();
  await saveReceivedCards(list.map((r) => (r.id === id ? { ...r, myNotes } : r)));
}

/** Updates an existing entry, or adds it if it isn't in storage yet (e.g. a dev mock entry being edited for the first time). */
export async function upsertReceivedCard(entry: ReceivedCard): Promise<void> {
  const list = await loadReceivedCards();
  const exists = list.some((r) => r.id === entry.id);
  const next = exists ? list.map((r) => (r.id === entry.id ? entry : r)) : [entry, ...list];
  await saveReceivedCards(next);
}

export async function deleteReceivedCard(id: string): Promise<void> {
  const list = await loadReceivedCards();
  await saveReceivedCards(list.filter((r) => r.id !== id));
}

export async function loadPresets(): Promise<CardPreset[]> {
  const raw = await AsyncStorage.getItem(PRESETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function savePresets(list: CardPreset[]): Promise<void> {
  await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(list));
}

export async function addPreset(name: string, card: CardData): Promise<CardPreset> {
  const list = await loadPresets();
  const entry: CardPreset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    card,
  };
  await savePresets([...list, entry]);
  return entry;
}

export async function updatePreset(
  id: string,
  patch: Partial<Pick<CardPreset, 'name' | 'card'>>
): Promise<void> {
  const list = await loadPresets();
  await savePresets(list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export async function deletePreset(id: string): Promise<void> {
  const list = await loadPresets();
  await savePresets(list.filter((p) => p.id !== id));
}

export async function loadThemes(): Promise<ThemePreset[]> {
  const raw = await AsyncStorage.getItem(THEMES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveThemes(list: ThemePreset[]): Promise<void> {
  await AsyncStorage.setItem(THEMES_KEY, JSON.stringify(list));
}

export async function addTheme(theme: Omit<ThemePreset, 'id'>): Promise<ThemePreset> {
  const list = await loadThemes();
  const entry: ThemePreset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...theme,
  };
  await saveThemes([...list, entry]);
  return entry;
}

export async function updateTheme(
  id: string,
  patch: Partial<Omit<ThemePreset, 'id'>>
): Promise<void> {
  const list = await loadThemes();
  await saveThemes(list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export async function deleteTheme(id: string): Promise<void> {
  const list = await loadThemes();
  await saveThemes(list.filter((t) => t.id !== id));
  const activeId = await loadActiveThemeId();
  if (activeId === id) {
    await setActiveThemeId(null);
  }
}

export async function loadActiveThemeId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_THEME_KEY);
}

export async function setActiveThemeId(id: string | null): Promise<void> {
  if (id) {
    await AsyncStorage.setItem(ACTIVE_THEME_KEY, id);
  } else {
    await AsyncStorage.removeItem(ACTIVE_THEME_KEY);
  }
}

export async function loadActiveTheme(): Promise<ThemePreset> {
  const id = await loadActiveThemeId();
  if (!id) return DEFAULT_THEME;
  const builtin = BUILTIN_THEMES.find((t) => t.id === id);
  if (builtin) return builtin;
  const list = await loadThemes();
  return list.find((t) => t.id === id) ?? DEFAULT_THEME;
}

/** Which action (My List vs. phone Contacts) is presented as primary when opening a shared card. */
export async function loadDefaultSaveDestination(): Promise<SaveDestination> {
  const raw = await AsyncStorage.getItem(SAVE_DESTINATION_KEY);
  return raw === 'contacts' ? 'contacts' : 'mylist';
}

export async function setDefaultSaveDestination(destination: SaveDestination): Promise<void> {
  await AsyncStorage.setItem(SAVE_DESTINATION_KEY, destination);
}

/** Whether the user has dismissed the first-launch Welcome screen. */
export async function hasSeenWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_KEY)) === 'true';
}

export async function markWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_KEY, 'true');
}
