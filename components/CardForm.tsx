import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  CardData,
  ContactLabel,
  EmailEntry,
  PhoneEntry,
  SocialEntry,
  SocialPlatform,
} from '../lib/types';

const PHONE_LABELS: ContactLabel[] = ['mobile', 'work', 'home', 'fax', 'other'];
const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'linkedin',
  'twitter',
  'instagram',
  'github',
  'facebook',
  'tiktok',
  'youtube',
  'other',
];

export function CardForm({
  card,
  onChange,
}: {
  card: CardData;
  onChange: (next: CardData) => void;
}) {
  function set<K extends keyof CardData>(key: K, value: CardData[K]) {
    onChange({ ...card, [key]: value });
  }

  function updatePhone(i: number, patch: Partial<PhoneEntry>) {
    const phones = card.phones.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    set('phones', phones);
  }
  function updateEmail(i: number, patch: Partial<EmailEntry>) {
    const emails = card.emails.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    set('emails', emails);
  }
  function updateSocial(i: number, patch: Partial<SocialEntry>) {
    const social = card.social.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    set('social', social);
  }

  return (
    <View>
      <Field label="First name" value={card.firstName} onChangeText={(v) => set('firstName', v)} />
      <Field label="Last name" value={card.lastName} onChangeText={(v) => set('lastName', v)} />
      <Field label="Job title" value={card.title ?? ''} onChangeText={(v) => set('title', v)} />
      <Field label="Company" value={card.company ?? ''} onChangeText={(v) => set('company', v)} />

      <SectionHeader
        label="Phone numbers"
        onAdd={() => set('phones', [...card.phones, { label: 'mobile', value: '' }])}
      />
      {card.phones.map((p, i) => (
        <EntryRow key={i} onRemove={() => set('phones', card.phones.filter((_, idx) => idx !== i))}>
          <LabelPicker options={PHONE_LABELS} value={p.label} onChange={(v) => updatePhone(i, { label: v })} />
          <TextInput
            style={styles.entryInput}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={p.value}
            onChangeText={(v) => updatePhone(i, { value: v })}
          />
        </EntryRow>
      ))}

      <SectionHeader
        label="Emails"
        onAdd={() => set('emails', [...card.emails, { label: 'work', value: '' }])}
      />
      {card.emails.map((e, i) => (
        <EntryRow key={i} onRemove={() => set('emails', card.emails.filter((_, idx) => idx !== i))}>
          <LabelPicker options={PHONE_LABELS} value={e.label} onChange={(v) => updateEmail(i, { label: v })} />
          <TextInput
            style={styles.entryInput}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={e.value}
            onChangeText={(v) => updateEmail(i, { value: v })}
          />
        </EntryRow>
      ))}

      <Field label="Website" value={card.website ?? ''} onChangeText={(v) => set('website', v)} autoCapitalize="none" />
      <Field label="Address" value={card.address ?? ''} onChangeText={(v) => set('address', v)} multiline />

      <SectionHeader
        label="Social links"
        onAdd={() => set('social', [...card.social, { platform: 'linkedin', url: '' }])}
      />
      {card.social.map((s, i) => (
        <EntryRow key={i} onRemove={() => set('social', card.social.filter((_, idx) => idx !== i))}>
          <LabelPicker
            options={SOCIAL_PLATFORMS}
            value={s.platform}
            onChange={(v) => updateSocial(i, { platform: v })}
          />
          <TextInput
            style={styles.entryInput}
            placeholder="Profile URL"
            autoCapitalize="none"
            value={s.url}
            onChangeText={(v) => updateSocial(i, { url: v })}
          />
        </EntryRow>
      ))}

      <Field label="Notes" value={card.notes ?? ''} onChangeText={(v) => set('notes', v)} multiline />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

function SectionHeader({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

function EntryRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <View style={styles.entryRow}>
      {children}
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

function LabelPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.pickerRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.pickerChip, value === opt && styles.pickerChipActive]}
        >
          <Text style={[styles.pickerChipText, value === opt && styles.pickerChipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  addBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  addBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  entryRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  entryInput: {
    fontSize: 15,
    color: '#111',
    paddingVertical: 6,
  },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  pickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f1f1f1',
  },
  pickerChipActive: { backgroundColor: '#2563eb' },
  pickerChipText: { fontSize: 12, color: '#555', textTransform: 'capitalize' },
  pickerChipTextActive: { color: '#fff' },
  removeBtn: { alignSelf: 'flex-end', marginTop: 2 },
  removeBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
