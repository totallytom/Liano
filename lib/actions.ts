import * as Clipboard from 'expo-clipboard';
import * as Contacts from 'expo-contacts';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { CardData, fullName } from './types';
import { buildVCard, vcardFileName } from './vcard';

export async function shareVCardFile(card: CardData): Promise<void> {
  const vcard = buildVCard(card);

  if (Platform.OS === 'web') {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = vcardFileName(card);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, vcardFileName(card));
  file.create({ overwrite: true });
  file.write(vcard);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/vcard',
      dialogTitle: 'Share contact card',
    });
  } else {
    Alert.alert('Sharing unavailable', 'This device cannot share files directly.');
  }
}

export async function saveToDeviceContacts(card: CardData): Promise<void> {
  if (Platform.OS === 'web') {
    Alert.alert('Not supported on web', 'Use "Download .vcf" and open the file instead.');
    return;
  }

  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Allow contacts access to save this card.');
    return;
  }

  await Contacts.addContactAsync({
    contactType: Contacts.ContactTypes.Person,
    name: fullName(card) || card.company || 'Unnamed Contact',
    firstName: card.firstName,
    lastName: card.lastName,
    company: card.company,
    jobTitle: card.title,
    phoneNumbers: card.phones.filter((p) => p.value).map((p) => ({ label: p.label, number: p.value })),
    emails: card.emails.filter((e) => e.value).map((e) => ({ label: e.label, email: e.value })),
    urlAddresses: [
      ...(card.website ? [{ label: 'website', url: card.website }] : []),
      ...card.social.filter((s) => s.url).map((s) => ({ label: s.platform, url: s.url })),
    ],
  });
  Alert.alert('Saved', 'Contact added to your device.');
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}
