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
import { CardForm } from '../../components/CardForm';
import { addPreset, deletePreset, loadPresets, saveMyCard, updatePreset } from '../../lib/storage';
import { CardData, emptyCard } from '../../lib/types';

export default function PresetEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [card, setCard] = useState<CardData>(emptyCard);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (isNew) {
        setName('');
        setCard(emptyCard);
        setLoaded(true);
        return;
      }
      setLoaded(false);
      loadPresets().then((list) => {
        if (cancelled) return;
        const found = list.find((p) => p.id === id);
        setName(found?.name ?? '');
        setCard(found?.card ?? emptyCard);
        setLoaded(true);
      });
      return () => {
        cancelled = true;
      };
    }, [id, isNew])
  );

  async function handleSave() {
    setSaving(true);
    const presetName = name.trim() || 'Untitled preset';
    if (isNew) {
      const entry = await addPreset(presetName, card);
      router.replace(`/presets/${entry.id}`);
    } else {
      await updatePreset(id, { name: presetName, card });
    }
    setSaving(false);
  }

  async function handleUse() {
    await saveMyCard(card);
    Alert.alert('Set as active card', 'This preset is now your shared "My Card".');
    router.push('/');
  }

  function handleDelete() {
    Alert.alert('Delete preset', `Delete "${name || 'Untitled preset'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePreset(id);
          router.back();
        },
      },
    ]);
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Preset name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Work, Conference, Personal"
              value={name}
              onChangeText={setName}
            />
          </View>

          <CardForm card={card} onChange={setCard} />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save preset'}</Text>
          </TouchableOpacity>

          {!isNew && (
            <>
              <TouchableOpacity style={styles.useBtn} onPress={handleUse}>
                <Text style={styles.useBtnText}>Use as My Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Delete preset</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: '#666', marginBottom: 4, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  useBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  useBtnText: { color: '#111', fontWeight: '600', fontSize: 15 },
  deleteBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});
