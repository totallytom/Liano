import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { CardData } from './types';

// Card data is packed into the link/QR itself (no backend/database), so the
// codec here is the only thing that has to stay backwards compatible.
export function encodeCard(card: CardData): string {
  return compressToEncodedURIComponent(JSON.stringify(card));
}

export function decodeCard(encoded: string): CardData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      firstName: parsed.firstName ?? '',
      lastName: parsed.lastName ?? '',
      title: parsed.title ?? '',
      company: parsed.company ?? '',
      phones: Array.isArray(parsed.phones) ? parsed.phones : [],
      emails: Array.isArray(parsed.emails) ? parsed.emails : [],
      website: parsed.website ?? '',
      address: parsed.address ?? '',
      notes: parsed.notes ?? '',
      social: Array.isArray(parsed.social) ? parsed.social : [],
    };
  } catch {
    return null;
  }
}
