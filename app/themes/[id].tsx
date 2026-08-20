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
import { hexToRgba, isValidHex } from '../../lib/color';
import { addTheme, deleteTheme, loadThemes, setActiveThemeId, updateTheme } from '../../lib/storage';
import { useTheme } from '../../lib/ThemeContext';
import { BUBBLE_SHAPES, BubbleShape, BUILTIN_THEMES, DEFAULT_THEME } from '../../lib/types';

const SHAPE_LABEL: Record<BubbleShape, string> = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  hexagon: 'Hexagon',
  blob: 'Blob',
};

export default function ThemeEditor() {
  const router = useRouter();
  const { theme: activeTheme, refreshTheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [background, setBackground] = useState(DEFAULT_THEME.background);
  const [cardBackground, setCardBackground] = useState(DEFAULT_THEME.cardBackground);
  const [text, setText] = useState(DEFAULT_THEME.text);
  const [accent, setAccent] = useState(DEFAULT_THEME.accent);
  const [shape, setShape] = useState<BubbleShape>(DEFAULT_THEME.shape ?? 'circle');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (isNew) {
        setName('');
        setBackground(DEFAULT_THEME.background);
        setCardBackground(DEFAULT_THEME.cardBackground);
        setText(DEFAULT_THEME.text);
        setAccent(DEFAULT_THEME.accent);
        setShape(DEFAULT_THEME.shape ?? 'circle');
        setLoaded(true);
        return;
      }
      setLoaded(false);
      loadThemes().then((list) => {
        if (cancelled) return;
        const found = list.find((t) => t.id === id);
        setName(found?.name ?? '');
        setBackground(found?.background ?? DEFAULT_THEME.background);
        setCardBackground(found?.cardBackground ?? DEFAULT_THEME.cardBackground);
        setText(found?.text ?? DEFAULT_THEME.text);
        setAccent(found?.accent ?? DEFAULT_THEME.accent);
        setShape(found?.shape ?? 'circle');
        setLoaded(true);
      });
      return () => {
        cancelled = true;
      };
    }, [id, isNew])
  );

  function applyPreset(preset: (typeof BUILTIN_THEMES)[number]) {
    setBackground(preset.background);
    setCardBackground(preset.cardBackground);
    setText(preset.text);
    setAccent(preset.accent);
    setShape(preset.shape ?? 'circle');
  }

  function validate(): boolean {
    const fields = { background, cardBackground, text, accent };
    const invalid = Object.entries(fields).find(([, v]) => !isValidHex(v));
    if (invalid) {
      Alert.alert('Invalid color', `"${invalid[1]}" isn't a valid hex color (e.g. #2563eb).`);
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const themeName = name.trim() || 'Untitled theme';
    const payload = { name: themeName, background, cardBackground, text, accent, shape };
    if (isNew) {
      const entry = await addTheme(payload);
      router.replace(`/themes/${entry.id}`);
    } else {
      await updateTheme(id, payload);
      refreshTheme();
    }
    setSaving(false);
  }

  async function handleUse() {
    if (!validate()) return;
    await setActiveThemeId(id);
    refreshTheme();
    Alert.alert('Theme applied', 'This theme is now active across the app.');
    router.push('/');
  }

  function handleDelete() {
    Alert.alert('Delete theme', `Delete "${name || 'Untitled theme'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTheme(id);
          refreshTheme();
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
            <Text style={styles.fieldLabel}>Theme name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Work, Night mode, Brand colors"
              value={name}
              onChangeText={setName}
            />
          </View>

          <ColorField label="Page background" value={background} onChangeText={setBackground} />
          <ColorField label="Card background" value={cardBackground} onChangeText={setCardBackground} />
          <ColorField label="Card text" value={text} onChangeText={setText} />
          <ColorField label="Accent (buttons & links)" value={accent} onChangeText={setAccent} />

          <Text style={styles.fieldLabel}>Background bubble shape</Text>
          <View style={styles.shapeRow}>
            {BUBBLE_SHAPES.map((s) => {
              const safeAccent = isValidHex(accent) ? accent : DEFAULT_THEME.accent;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setShape(s)}
                  style={[
                    styles.shapeChip,
                    shape === s && { borderColor: safeAccent, backgroundColor: hexToRgba(safeAccent, 0.1) },
                  ]}
                >
                  <Text style={[styles.shapeChipText, shape === s && { color: safeAccent }]}>{SHAPE_LABEL[s]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Preview</Text>
          <View style={[styles.preview, { backgroundColor: isValidHex(background) ? background : DEFAULT_THEME.background }]}>
            <BubbleBackground
              theme={{
                id: 'preview',
                name: 'Preview',
                background: isValidHex(background) ? background : DEFAULT_THEME.background,
                cardBackground: isValidHex(cardBackground) ? cardBackground : DEFAULT_THEME.cardBackground,
                text: isValidHex(text) ? text : DEFAULT_THEME.text,
                accent: isValidHex(accent) ? accent : DEFAULT_THEME.accent,
                shape,
              }}
            />
            <View
              style={[
                styles.previewCard,
                { backgroundColor: isValidHex(cardBackground) ? cardBackground : DEFAULT_THEME.cardBackground },
              ]}
            >
              <Text style={[styles.previewName, { color: isValidHex(text) ? text : DEFAULT_THEME.text }]}>
                Jane Doe
              </Text>
              <Text style={[styles.previewLink, { color: isValidHex(accent) ? accent : DEFAULT_THEME.accent }]}>
                jane@example.com
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Start from a preset</Text>
          <View style={styles.presetRow}>
            {BUILTIN_THEMES.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetChip, { backgroundColor: preset.cardBackground, borderColor: preset.accent }]}
                onPress={() => applyPreset(preset)}
              >
                <Text style={[styles.presetChipText, { color: preset.text }]}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: activeTheme.accent }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save theme'}</Text>
          </TouchableOpacity>

          {!isNew && (
            <>
              <TouchableOpacity style={styles.useBtn} onPress={handleUse}>
                <Text style={styles.useBtnText}>Use this theme</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Delete theme</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ColorField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.colorRow}>
        <View style={[styles.swatch, { backgroundColor: isValidHex(value) ? value : '#ccc' }]} />
        <TextInput
          style={[styles.input, styles.colorInput]}
          placeholder="#2563eb"
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: '600' },
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
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorInput: { flex: 1 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  preview: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  shapeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  shapeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  shapeChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  previewCard: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  previewName: { fontSize: 18, fontWeight: '700' },
  previewLink: { fontSize: 14, fontWeight: '600' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
  },
  presetChipText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
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
