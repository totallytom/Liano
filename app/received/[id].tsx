import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BubbleBackground } from '../../components/BubbleBackground';
import { CardPreview } from '../../components/CardPreview';
import { FlipCard } from '../../components/FlipCard';
import { saveToDeviceContacts, shareVCardFile } from '../../lib/actions';
import { isLightColor } from '../../lib/color';
import { MOCK_CARDS } from '../../lib/mockData';
import { deleteReceivedCard, loadReceivedCards, upsertReceivedCard } from '../../lib/storage';
import { useTheme } from '../../lib/ThemeContext';
import { fullName, hasExtraCardDetails, ReceivedCard } from '../../lib/types';
import { buildVCard } from '../../lib/vcard';

export default function ReceivedDetail() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = !isLightColor(theme.background);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<ReceivedCard | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      loadReceivedCards().then((list) => {
        if (cancelled) return;
        const found =
          list.find((r) => r.id === id) ??
          (__DEV__ ? MOCK_CARDS.find((r) => r.id === id) : undefined) ??
          null;
        setEntry(found);
        setNotes(found?.myNotes ?? '');
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  async function handleSaveNotes() {
    if (!entry) return;
    setSaving(true);
    const updated = { ...entry, myNotes: notes };
    await upsertReceivedCard(updated);
    setEntry(updated);
    setSaving(false);
  }

  function handleDelete() {
    if (!entry) return;
    Alert.alert('Delete contact', 'Remove this card from My List?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceivedCard(entry.id);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <BubbleBackground theme={theme} />
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.center} edges={['bottom', 'left', 'right']}>
        <BubbleBackground theme={theme} />
        <Text style={styles.errorTitle}>Card not found</Text>
        <Text style={styles.errorSubtitle}>This entry may have been deleted.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <BubbleBackground theme={theme} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <FlipCard card={entry.card} qrValue={buildVCard(entry.card)} />

          {hasExtraCardDetails(entry.card) && <CardPreview card={entry.card} />}

          <Text style={styles.received}>
            Received {new Date(entry.receivedAt).toLocaleDateString()}
          </Text>

          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>My notes</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder={`Write anything about ${fullName(entry.card) || 'this person'}...`}
              value={notes}
              onChangeText={setNotes}
              onBlur={handleSaveNotes}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save notes'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
              onPress={() => saveToDeviceContacts(entry.card)}
            >
              <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
                Save to Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
              onPress={() => shareVCardFile(entry.card)}
            >
              <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
                Download / Share .vcf
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Delete from My List</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, overflow: 'hidden' },
  container: { padding: 20, alignItems: 'center', gap: 16, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8, overflow: 'hidden' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  errorSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  received: { fontSize: 12, color: '#999' },
  notesSection: { width: '100%' },
  notesLabel: { fontSize: 13, color: '#666', marginBottom: 4, fontWeight: '600' },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  actions: { width: '100%', gap: 10, marginTop: 8 },
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
  deleteBtn: { alignItems: 'center', paddingVertical: 10 },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});
