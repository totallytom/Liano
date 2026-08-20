import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BubbleBackground } from '../components/BubbleBackground';
import { CardPreview } from '../components/CardPreview';
import { FlipCard } from '../components/FlipCard';
import { QRWidget } from '../components/QRWidget';
import { showRewardedAd } from '../lib/ads';
import { copyToClipboard, saveToDeviceContacts, shareVCardFile } from '../lib/actions';
import { isLightColor } from '../lib/color';
import { buildShareLink } from '../lib/links';
import { writeCardToNfcTag } from '../lib/nfc';
import { hasSeenWelcome, loadMyCard } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { CardData, fullName, hasExtraCardDetails, isCardEmpty } from '../lib/types';
import { buildVCard } from '../lib/vcard';

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [writingNfc, setWritingNfc] = useState(false);
  const [adPending, setAdPending] = useState(false);
  const qrRef = useRef<ViewShot>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      hasSeenWelcome().then((seen) => {
        if (cancelled) return;
        if (!seen) {
          router.replace('/welcome');
          return;
        }
        loadMyCard().then((c) => {
          if (!cancelled) {
            setCard(c);
            setLoading(false);
          }
        });
      });
      return () => {
        cancelled = true;
      };
    }, [router])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <BubbleBackground theme={theme} />
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!card || isCardEmpty(card)) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <BubbleBackground theme={theme} />
        <Text style={styles.emptyTitle}>No card yet</Text>
        <Text style={styles.emptySubtitle}>Create your digital business card to get a shareable QR code and link.</Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/edit')}
        >
          <Text style={styles.primaryBtnText}>Create my card</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const shareLink = buildShareLink(card);
  const vcardText = buildVCard(card);
  const isDark = !isLightColor(theme.background);

  async function handleShareQrImage() {
    if (Platform.OS === 'web' || !qrRef.current?.capture) return;
    const uri = await qrRef.current.capture();
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  }

  const writeNfcTag = async () => {
    setWritingNfc(true);
    const result = await writeCardToNfcTag(card);
    setWritingNfc(false);
    if (result === 'success') {
      Alert.alert(
        'Tag written',
        "Your card was written to the NFC tag. Anyone can tap their phone to it to receive it directly into their phone's Contacts app — it won't appear in their in-app My List."
      );
    } else if (result === 'unsupported') {
      Alert.alert('NFC unavailable', "This device doesn't support NFC, or it's turned off.");
    } else if (result === 'error') {
      Alert.alert('Write failed', "Couldn't write to the tag. Make sure it's writable and try again.");
    }
  };

  const handleShareViaNfc = () => {
    Alert.alert(
      'Watch an ad to continue',
      "Writing to an NFC tag is unlocked by watching a short ad. Note: tapping the tag saves the card straight to the recipient's phone Contacts app, not their in-app My List.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch Ad',
          onPress: async () => {
            setAdPending(true);
            const earned = await showRewardedAd();
            setAdPending(false);
            if (earned) {
              await writeNfcTag();
            } else {
              Alert.alert('Maybe later', "Didn't finish the ad, so the tag wasn't written. Try again anytime.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <BubbleBackground theme={theme} />
      <ScrollView contentContainerStyle={styles.container}>
        <FlipCard card={card} qrValue={vcardText} />

        <View style={styles.hiddenQr} pointerEvents="none">
          <QRWidget ref={qrRef} value={vcardText} title={fullName(card)} subtitle={card.title || card.company} />
        </View>

        {hasExtraCardDetails(card) && <CardPreview card={card} />}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
            onPress={() => saveToDeviceContacts(card)}
          >
            <Text style={styles.primaryBtnText}>Save to Contacts</Text>
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
              onPress={handleShareViaNfc}
              disabled={writingNfc || adPending}
            >
              <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
                {adPending ? 'Loading ad…' : writingNfc ? 'Tap your NFC tag now…' : 'Write to NFC tag'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
            onPress={() => shareVCardFile(card)}
          >
            <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
              Download / Share .vcf
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
            onPress={handleShareQrImage}
          >
            <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>Share QR image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
            onPress={async () => {
              await copyToClipboard(shareLink);
            }}
          >
            <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>Copy app link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit')}>
            <Text style={[styles.editBtnText, { color: theme.accent }]}>Edit card</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, overflow: 'hidden' },
  container: { padding: 20, alignItems: 'center', gap: 18, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14, overflow: 'hidden' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  actions: { width: '100%', gap: 10, marginTop: 8 },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  secondaryBtnText: { color: '#111', fontWeight: '600', fontSize: 15 },
  secondaryBtnDark: { backgroundColor: '#000', borderColor: '#000' },
  secondaryBtnTextDark: { color: '#fff' },
  editBtn: { alignItems: 'center', paddingVertical: 10 },
  editBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  linkHint: { fontSize: 11, color: '#999', textAlign: 'center', paddingHorizontal: 10, marginTop: -8 },
  hiddenQr: { position: 'absolute', opacity: 0 },
});
