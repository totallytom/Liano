import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QRWidget } from '../components/QRWidget';
import { decodeCard } from '../lib/encode';
import { fullName } from '../lib/types';
import { buildVCard } from '../lib/vcard';

// Chromeless page meant to be dropped into an <iframe> on any website:
// <iframe src="https://yourdomain.com/embed?c=<encoded>" width="280" height="340"></iframe>
export default function Embed() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const card = c ? decodeCard(c) : null;

  if (!card) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Invalid card link</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.center}>
      <QRWidget value={buildVCard(card)} title={fullName(card)} subtitle={card.title || card.company} size={180} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 12 },
  errorText: { color: '#666', fontSize: 13 },
});
