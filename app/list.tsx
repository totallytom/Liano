import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isLightColor } from '../lib/color';
import { loadReceivedCards } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { fullName, ReceivedCard } from '../lib/types';
import { MOCK_CARDS } from '../lib/mockData';

export default function List() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = !isLightColor(theme.background);
  const [cards, setCards] = useState<ReceivedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      loadReceivedCards().then((list) => {
        if (!cancelled) {
          setCards(__DEV__ && list.length === 0 ? MOCK_CARDS : list);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <Text style={styles.emptyTitle}>No cards yet</Text>
        <Text style={styles.emptySubtitle}>
          Business cards you receive will show up here once you tap "Add to My List".
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, isDark && styles.rowDark]}
            onPress={() => router.push(`/received/${item.id}`)}
          >
            <View style={styles.rowText}>
              <Text style={[styles.name, isDark && styles.nameDark]}>
                {fullName(item.card) || 'Unnamed contact'}
              </Text>
              {!!(item.card.title || item.card.company) && (
                <Text style={[styles.subtitle, isDark && styles.subtitleDark]} numberOfLines={1}>
                  {[item.card.title, item.card.company].filter(Boolean).join(' · ')}
                </Text>
              )}
              {!!item.myNotes && (
                <Text style={[styles.notes, isDark && styles.notesDark]} numberOfLines={1}>
                  {item.myNotes}
                </Text>
              )}
            </View>
            <Text style={[styles.date, isDark && styles.dateDark]}>
              {new Date(item.receivedAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 60, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  rowDark: { backgroundColor: '#000', borderColor: '#000' },
  rowText: { flex: 1, gap: 2, paddingRight: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  nameDark: { color: '#fff' },
  subtitle: { fontSize: 13, color: '#666' },
  subtitleDark: { color: '#aaa' },
  notes: { fontSize: 13, color: '#2563eb', marginTop: 4 },
  notesDark: { color: '#7dabf8' },
  date: { fontSize: 12, color: '#999' },
  dateDark: { color: '#aaa' },
});
