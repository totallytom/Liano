import { CardData, fullName, SocialPlatform } from './types';

// vCard 3.0 requires CRLF line endings and escaped , ; \ and newlines within values.
function escapeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

const PHONE_TYPE: Record<string, string> = {
  mobile: 'CELL',
  work: 'WORK,VOICE',
  home: 'HOME,VOICE',
  fax: 'FAX',
  other: 'VOICE',
};

const EMAIL_TYPE: Record<string, string> = {
  mobile: 'INTERNET',
  work: 'INTERNET,WORK',
  home: 'INTERNET,HOME',
  fax: 'INTERNET',
  other: 'INTERNET',
};

const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  instagram: 'Instagram',
  github: 'GitHub',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  other: 'Link',
};

export function buildVCard(card: CardData): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push(`N:${escapeValue(card.lastName)};${escapeValue(card.firstName)};;;`);

  const name = fullName(card) || card.company || 'Unnamed Contact';
  lines.push(`FN:${escapeValue(name)}`);

  if (card.company) lines.push(`ORG:${escapeValue(card.company)}`);
  if (card.title) lines.push(`TITLE:${escapeValue(card.title)}`);

  for (const phone of card.phones) {
    if (!phone.value) continue;
    lines.push(`TEL;TYPE=${PHONE_TYPE[phone.label] ?? 'VOICE'}:${escapeValue(phone.value)}`);
  }

  for (const email of card.emails) {
    if (!email.value) continue;
    lines.push(`EMAIL;TYPE=${EMAIL_TYPE[email.label] ?? 'INTERNET'}:${escapeValue(email.value)}`);
  }

  if (card.website) lines.push(`URL:${escapeValue(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeValue(card.address)};;;;`);
  if (card.notes) lines.push(`NOTE:${escapeValue(card.notes)}`);

  card.social.forEach((entry, i) => {
    if (!entry.url) return;
    const item = `item${i + 1}`;
    lines.push(`${item}.URL:${escapeValue(entry.url)}`);
    lines.push(`${item}.X-ABLabel:${escapeValue(SOCIAL_LABEL[entry.platform] ?? 'Link')}`);
  });

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function vcardFileName(card: CardData): string {
  const name = fullName(card) || card.company || 'contact';
  return `${name.replace(/[^a-z0-9]+/gi, '_')}.vcf`;
}
