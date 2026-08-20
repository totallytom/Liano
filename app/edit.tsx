import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardForm } from '../components/CardForm';
import { loadMyCard, saveMyCard } from '../lib/storage';
import { CardData, emptyCard } from '../lib/types';

export default function Edit() {
  const router = useRouter();
  const [card, setCard] = useState<CardData>(emptyCard);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadMyCard().then((c) => {
      setCard(c ?? emptyCard);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    await saveMyCard(card);
    router.back();
  }

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.flex} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <CardForm card={card} onChange={setCard} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save card</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 60 },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
