import { Link, Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAds } from '../lib/ads';
import { isLightColor } from '../lib/color';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    initAds();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { theme } = useTheme();
  const headerTint = isLightColor(theme.background) ? '#111' : '#f4f5f7';

  return (
    <>
      <StatusBar style={isLightColor(theme.background) ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: headerTint,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            title: 'My Card',
            headerRight: () => (
              <View style={styles.headerLinks}>
                <Link href="/themes" style={[styles.headerButton, { borderColor: theme.accent }]}>
                  <Text style={[styles.headerLinkText, { color: theme.accent }]}>Themes</Text>
                </Link>
                <Link href="/presets" style={[styles.headerButton, { borderColor: theme.accent }]}>
                  <Text style={[styles.headerLinkText, { color: theme.accent }]}>Presets</Text>
                </Link>
                <Link href="/list" style={[styles.headerButton, { borderColor: theme.accent }]}>
                  <Text style={[styles.headerLinkText, { color: theme.accent }]}>My List</Text>
                </Link>
                <Link href="/settings" style={styles.settingsButton}>
                  <Text style={[styles.settingsButtonText, { color: theme.accent }]}>⚙</Text>
                </Link>
              </View>
            ),
          }}
        />
        <Stack.Screen name="edit" options={{ title: 'Edit Card', presentation: 'modal' }} />
        <Stack.Screen name="view" options={{ title: 'Shared Card' }} />
        <Stack.Screen name="embed" options={{ headerShown: false }} />
        <Stack.Screen name="list" options={{ title: 'My List' }} />
        <Stack.Screen name="received/[id]" options={{ title: 'Contact' }} />
        <Stack.Screen name="presets" options={{ title: 'Presets' }} />
        <Stack.Screen name="presets/[id]" options={{ title: 'Edit Preset' }} />
        <Stack.Screen name="themes" options={{ title: 'Themes' }} />
        <Stack.Screen name="themes/[id]" options={{ title: 'Edit Theme' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerLinks: { flexDirection: 'row', gap: 10 },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 8,
  },
  headerLinkText: { fontWeight: '600', fontSize: 13 },
  settingsButton: { paddingHorizontal: 2, justifyContent: 'center' },
  settingsButtonText: { fontSize: 18, fontWeight: '600' },
});
