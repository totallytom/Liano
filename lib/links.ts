import * as Linking from 'expo-linking';
import { CardData } from './types';
import { encodeCard } from './encode';

// On native this resolves to the vcard:// custom scheme; on web it resolves
// to the current origin, so the exact same call produces a working link
// whether the card is opened by the app or by a browser.
export function buildShareLink(card: CardData): string {
  const encoded = encodeCard(card);
  return Linking.createURL('view', { queryParams: { c: encoded } });
}

export function buildEmbedLink(card: CardData): string {
  const encoded = encodeCard(card);
  return Linking.createURL('embed', { queryParams: { c: encoded } });
}
