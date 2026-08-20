import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showRewardedAd } from '../lib/ads';
import { loadPresets } from '../lib/storage';
import { CardPreset, FREE_PRESET_LIMIT, fullName } from '../lib/types';

export default function Presets() {
  const router = useRouter();
  const [presets, setPresets] = useState<CardPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [adPending, setAdPending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      loadPresets().then((list) => {
        if (!cancelled) {
          setPresets(list);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  function handleNewPreset() {
    if (presets.length < FREE_PRESET_LIMIT) {
      router.push('/presets/new');
      return;
    }
    Alert.alert('Watch an ad to continue', 'Adding another preset is unlocked by watching a short ad.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Watch Ad',
        onPress: async () => {
          setAdPending(true);
          const earned = await showRewardedAd();
          setAdPending(false);
          if (earned) {
            router.push('/presets/new');
          } else {
            Alert.alert('Maybe later', "Didn't finish the ad, so the preset wasn't unlocked. Try again anytime.");
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
        data={presets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No presets yet</Text>
            <Text style={styles.emptySubtitle}>
              Build alternate versions of your card — like "Work" or "Conference" — and switch
              between them whenever you share.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/presets/${item.id}`)}>
            <View style={styles.rowText}>
              <Text style={styles.presetName}>{item.name || 'Untitled preset'}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {fullName(item.card) || 'No name set'}
                {(item.card.title || item.card.company) &&
                  ` · ${[item.card.title, item.card.company].filter(Boolean).join(' · ')}`}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.newBtn} onPress={handleNewPreset} disabled={adPending}>
        <Text style={styles.newBtnText}>{adPending ? 'Loading ad…' : '+ New preset'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 100, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  rowText: { flex: 1, gap: 2, paddingRight: 10 },
  presetName: { fontSize: 16, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#666' },
  chevron: { fontSize: 20, color: '#ccc' },
  newBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
