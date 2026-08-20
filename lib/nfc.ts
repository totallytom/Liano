import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { CardData } from './types';
import { buildVCard } from './vcard';

let started = false;

async function ensureStarted(): Promise<void> {
  if (started) return;
  await NfcManager.start();
  started = true;
}

export type NfcWriteResult = 'success' | 'unsupported' | 'cancelled' | 'error';

/**
 * Writes the card as a vCard NDEF record to a physical NFC tag. Resolves once
 * the tag has been tapped and written — anyone can later tap their phone to
 * that tag to receive the card, without needing this app installed.
 */
export async function writeCardToNfcTag(card: CardData): Promise<NfcWriteResult> {
  if (Platform.OS === 'web') return 'unsupported';

  await ensureStarted();
  const supported = await NfcManager.isSupported();
  if (!supported) return 'unsupported';

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const record = Ndef.record(Ndef.TNF_MIME_MEDIA, 'text/vcard', '', buildVCard(card));
    const bytes = Ndef.encodeMessage([record]);
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    return 'success';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return /cancel/i.test(message) ? 'cancelled' : 'error';
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
