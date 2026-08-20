import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShapeSvg } from '../components/BubbleBackground';
import { showRewardedAd } from '../lib/ads';
import { useTheme } from '../lib/ThemeContext';
import { loadActiveThemeId, loadThemes, setActiveThemeId } from '../lib/storage';
import { BUILTIN_THEMES, ThemePreset } from '../lib/types';

export default function Themes() {
  const router = useRouter();
  const { theme, refreshTheme } = useTheme();
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adPending, setAdPending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([loadThemes(), loadActiveThemeId()]).then(([themes, id]) => {
        if (!cancelled) {
          setCustomThemes(themes);
          setActiveId(id);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  async function handleUseBuiltin(preset: ThemePreset) {
    await setActiveThemeId(preset.id);
    setActiveId(preset.id);
    refreshTheme();
  }

  function handleNewTheme() {
    Alert.alert('Watch an ad to continue', 'Creating a custom theme is unlocked by watching a short ad.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Watch Ad',
        onPress: async () => {
          setAdPending(true);
          const earned = await showRewardedAd();
          setAdPending(false);
          if (earned) {
            router.push('/themes/new');
          } else {
            Alert.alert('Maybe later', "Didn't finish the ad, so the theme wasn't unlocked. Try again anytime.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={customThemes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick presets</Text>
            <View style={styles.swatchGrid}>
              {BUILTIN_THEMES.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.swatchCard,
                    { backgroundColor: preset.cardBackground, borderColor: preset.accent },
                    activeId === preset.id && styles.swatchCardActive,
                  ]}
                  onPress={() => handleUseBuiltin(preset)}
                >
                  <ShapeSvg shape={preset.shape ?? 'circle'} size={20} color={preset.accent} />
                  <Text style={[styles.swatchName, { color: preset.text }]}>{preset.name}</Text>
                  {activeId === preset.id && <Text style={styles.activeTag}>Active</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionLabel}>My themes</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptySubtitle}>
              Build your own color combo for the card and background, then save it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/themes/${item.id}`)}>
            <View style={[styles.rowSwatch, { backgroundColor: item.cardBackground, borderColor: item.accent }]}>
              <ShapeSvg shape={item.shape ?? 'circle'} size={12} color={item.accent} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{item.name || 'Untitled theme'}</Text>
              {activeId === item.id && <Text style={styles.activeTag}>Active</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.newBtn, { backgroundColor: theme.accent }]}
        onPress={handleNewTheme}
        disabled={adPending}
      >
        <Text style={styles.newBtnText}>{adPending ? 'Loading ad…' : '+ New theme'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 100, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 10, marginTop: 6 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  swatchCard: {
    width: 100,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  swatchCardActive: { borderWidth: 2 },
  swatchName: { fontSize: 13, fontWeight: '600' },
  activeTag: { fontSize: 10, fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' },
  emptyBox: { paddingVertical: 20 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    gap: 12,
  },
  rowSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '700', color: '#111' },
  chevron: { fontSize: 20, color: '#ccc' },
  newBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
