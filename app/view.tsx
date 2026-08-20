import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardPreview } from '../components/CardPreview';
import { QRWidget } from '../components/QRWidget';
import { saveToDeviceContacts, shareVCardFile } from '../lib/actions';
import { isLightColor } from '../lib/color';
import { decodeCard } from '../lib/encode';
import { addReceivedCard, loadDefaultSaveDestination } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { fullName, SaveDestination } from '../lib/types';
import { buildVCard } from '../lib/vcard';

export default function View_() {
  const router = useRouter();
  const { theme } = useTheme();
  const { c } = useLocalSearchParams<{ c?: string }>();
  const card = c ? decodeCard(c) : null;
  const [added, setAdded] = useState(false);
  const [destination, setDestination] = useState<SaveDestination>('mylist');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadDefaultSaveDestination().then((d) => {
        if (!cancelled) setDestination(d);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (!card) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <Text style={styles.errorTitle}>Card not found</Text>
        <Text style={styles.errorSubtitle}>This link is missing or invalid card data.</Text>
      </SafeAreaView>
    );
  }

  const vcardText = buildVCard(card);
  const isDark = !isLightColor(theme.background);

  async function handleAddToList() {
    if (!card) return;
    const entry = await addReceivedCard(card);
    setAdded(true);
    router.push(`/received/${entry.id}`);
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <QRWidget value={vcardText} title={fullName(card)} subtitle={card.title || card.company} />
        <CardPreview card={card} />
        <View style={styles.actions}>
          {destination === 'mylist' ? (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.accent }, added && styles.primaryBtnDisabled]}
                onPress={handleAddToList}
                disabled={added}
              >
                <Text style={styles.primaryBtnText}>{added ? 'Added to My List ✓' : 'Add to My List'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
                onPress={() => saveToDeviceContacts(card)}
              >
                <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
                  Save to Contacts
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
                onPress={() => saveToDeviceContacts(card)}
              >
                <Text style={styles.primaryBtnText}>Save to Contacts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark, added && styles.secondaryBtnDisabled]}
                onPress={handleAddToList}
                disabled={added}
              >
                <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
                  {added ? 'Added to My List ✓' : 'Add to My List'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
            onPress={() => shareVCardFile(card)}
          >
            <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
              Download / Share .vcf
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, alignItems: 'center', gap: 18, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  errorSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  actions: { width: '100%', gap: 10 },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
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
  secondaryBtnDisabled: { opacity: 0.5 },
  secondaryBtnDark: { backgroundColor: '#000', borderColor: '#000' },
  secondaryBtnTextDark: { color: '#fff' },
});
