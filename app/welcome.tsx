import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BubbleBackground } from '../components/BubbleBackground';
import { markWelcomeSeen } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';

export default function Welcome() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleGetStarted = async () => {
    await markWelcomeSeen();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <BubbleBackground theme={theme} />
      <Text style={styles.title}>Liano</Text>
      <Text style={[styles.pitch, { color: theme.text }]}>
        Your digital business card — share it with a QR code, a tap of NFC, or a link. No app required for people
        you share it with.
      </Text>
      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accent }]} onPress={handleGetStarted}>
        <Text style={styles.primaryBtnText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 16, overflow: 'hidden' },
  title: { fontSize: 32, fontWeight: '800' },
  pitch: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
