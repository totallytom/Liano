import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { CardData } from '../lib/types';

/**
 * Shows only what FlipCard's front face doesn't already cover: phones/emails
 * beyond the first of each, address, and notes. (Name, title, company,
 * primary phone/email, website, and socials all live on the card front.)
 */
export function CardPreview({ card }: { card: CardData }) {
  const { theme } = useTheme();
  const extraPhones = card.phones.filter((p) => p.value).slice(1);
  const extraEmails = card.emails.filter((e) => e.value).slice(1);

  return (
    <View style={styles.container}>
      {(extraPhones.length > 0 || extraEmails.length > 0 || !!card.address) && (
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          {extraPhones.map((p, i) => (
            <Row
              key={`phone-${i}`}
              label={cap(p.label)}
              value={p.value}
              color={theme.text}
              accent={theme.accent}
              onPress={() => Linking.openURL(`tel:${p.value}`)}
            />
          ))}
          {extraEmails.map((e, i) => (
            <Row
              key={`email-${i}`}
              label={cap(e.label)}
              value={e.value}
              color={theme.text}
              accent={theme.accent}
              onPress={() => Linking.openURL(`mailto:${e.value}`)}
            />
          ))}
          {!!card.address && <Row label="Address" value={card.address} color={theme.text} accent={theme.accent} />}
        </View>
      )}

      {!!card.notes && (
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.notes, { color: theme.text }]}>{card.notes}</Text>
        </View>
      )}
    </View>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Row({
  label,
  value,
  color,
  accent,
  onPress,
}: {
  label: string;
  value: string;
  color: string;
  accent: string;
  onPress?: () => void;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: onPress ? accent : color }]} numberOfLines={1}>
        {value}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  section: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowLabel: { fontSize: 13, color: '#888', width: 90 },
  rowValue: { fontSize: 14, flexShrink: 1, textAlign: 'right' },
  notes: { fontSize: 14, padding: 16 },
});
