import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isLightColor } from '../lib/color';
import { loadDefaultSaveDestination, setDefaultSaveDestination } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { SaveDestination } from '../lib/types';

const PRIVACY_POLICY_URL = 'https://www.theamuletstudios.com/privacy-policy';
const TERMS_OF_SERVICE_URL = 'https://www.theamuletstudios.com/terms-of-service';

const OPTIONS: { value: SaveDestination; title: string; subtitle: string }[] = [
  {
    value: 'mylist',
    title: 'My List (in this app)',
    subtitle: 'Keep received cards inside the app, with notes and your own organization.',
  },
  {
    value: 'contacts',
    title: 'Phone Contacts',
    subtitle: "Save straight to your device's native contacts app.",
  },
];

export default function Settings() {
  const { theme } = useTheme();
  const isDark = !isLightColor(theme.background);
  const [destination, setDestination] = useState<SaveDestination>('mylist');
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadDefaultSaveDestination().then((d) => {
        if (!cancelled) {
          setDestination(d);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  async function choose(value: SaveDestination) {
    setDestination(value);
    await setDefaultSaveDestination(value);
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Default save destination</Text>
        <Text style={[styles.sectionHint, isDark && styles.sectionHintDark]}>
          When you open a card someone shared with you, this determines which button is primary —
          the other option always stays available too.
        </Text>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.row, isDark && styles.rowDark, destination === opt.value && { borderColor: theme.accent }]}
            onPress={() => choose(opt.value)}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, isDark && styles.rowTitleDark]}>{opt.title}</Text>
              <Text style={[styles.rowSubtitle, isDark && styles.rowSubtitleDark]}>{opt.subtitle}</Text>
            </View>
            {destination === opt.value && <Text style={[styles.check, { color: theme.accent }]}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, styles.legalLabel, isDark && styles.sectionLabelDark]}>Legal</Text>
        <TouchableOpacity
          style={[styles.row, isDark && styles.rowDark]}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Text style={[styles.rowTitle, isDark && styles.rowTitleDark]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, isDark && styles.rowDark]}
          onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}
        >
          <Text style={[styles.rowTitle, isDark && styles.rowTitleDark]}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 2 },
  sectionLabelDark: { color: '#fff' },
  legalLabel: { marginTop: 10 },
  sectionHint: { fontSize: 13, color: '#666', marginBottom: 10 },
  sectionHintDark: { color: '#aaa' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#eee',
  },
  rowDark: { backgroundColor: '#000', borderColor: '#000' },
  rowText: { flex: 1, gap: 3, paddingRight: 10 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  rowTitleDark: { color: '#fff' },
  rowSubtitle: { fontSize: 13, color: '#666' },
  rowSubtitleDark: { color: '#aaa' },
  check: { fontSize: 18, fontWeight: '700' },
});
