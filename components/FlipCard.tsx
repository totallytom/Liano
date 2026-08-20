import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Linking, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../lib/ThemeContext';
import { CardData, fullName } from '../lib/types';

const SOCIAL_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  linkedin: 'linkedin',
  twitter: 'twitter',
  instagram: 'instagram',
  github: 'github',
  facebook: 'facebook',
  tiktok: 'music-note',
  youtube: 'youtube',
  other: 'link-variant',
};

const CARD_WIDTH = 300;
const CARD_HEIGHT = 400;
const SWIPE_THRESHOLD = 40;

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function initials(card: CardData): string {
  return [card.firstName, card.lastName]
    .filter(Boolean)
    .map((s) => s[0]!.toUpperCase())
    .join('');
}

export interface FlipCardProps {
  card: CardData;
  qrValue: string;
}

/**
 * A physical-business-card-style widget: a contact-summary front face and a
 * QR-code back face, flipped via a horizontal swipe. Built on the RN core
 * Animated + PanResponder APIs (no reanimated/gesture-handler) so it works
 * without adding a native dependency / new dev-client build.
 */
export function FlipCard({ card, qrValue }: FlipCardProps) {
  const { theme } = useTheme();
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const name = fullName(card);
  const phone = card.phones.find((p) => p.value);
  const email = card.emails.find((e) => e.value);
  const socials = card.social.filter((s) => s.url);

  const flipTo = (toBack: boolean) => {
    flippedRef.current = toBack;
    setFlipped(toBack);
    Animated.spring(flipAnim, {
      toValue: toBack ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          flipTo(!flippedRef.current);
        }
      },
    })
  ).current;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.wrap} {...panResponder.panHandlers}>
      <Animated.View
        pointerEvents={flipped ? 'none' : 'auto'}
        style={[
          styles.face,
          { backgroundColor: theme.cardBackground, transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
        ]}
      >
        <View style={[styles.avatarFallback, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarFallbackText}>{initials(card) || '?'}</Text>
        </View>
        {!!name && <Text style={[styles.name, { color: theme.text }]}>{name}</Text>}
        {!!(card.title || card.company) && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {[card.title, card.company].filter(Boolean).join(' · ')}
          </Text>
        )}

        <View style={styles.contactList}>
          {!!phone && (
            <TappableRow icon="phone" text={phone.value} color={theme.text} onPress={() => Linking.openURL(`tel:${phone.value}`)} />
          )}
          {!!email && (
            <TappableRow icon="mail" text={email.value} color={theme.text} onPress={() => Linking.openURL(`mailto:${email.value}`)} />
          )}
          {!!card.website && (
            <TappableRow
              icon="globe"
              text={card.website}
              color={theme.text}
              onPress={() => Linking.openURL(normalizeUrl(card.website!))}
            />
          )}
        </View>

        {socials.length > 0 && (
          <View style={styles.socialRow}>
            {socials.map((s, i) => (
              <TouchableOpacity key={`${s.platform}-${i}`} onPress={() => Linking.openURL(normalizeUrl(s.url))}>
                <MaterialCommunityIcons
                  name={SOCIAL_ICON[s.platform] ?? 'link-variant'}
                  size={22}
                  color={theme.accent}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.flipBtn} onPress={() => flipTo(true)}>
          <Feather name="repeat" size={12} color={theme.accent} style={styles.flipBtnIcon} />
          <Text style={[styles.flipBtnText, { color: theme.accent }]}>QR Code</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        pointerEvents={flipped ? 'auto' : 'none'}
        style={[
          styles.face,
          styles.back,
          { backgroundColor: theme.cardBackground, transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
        ]}
      >
        <View style={styles.qrWrap}>
          <QRCode value={qrValue || ' '} size={200} backgroundColor="#fff" color="#111" />
        </View>
        {!!name && <Text style={[styles.name, { color: theme.text, marginTop: 16 }]}>{name}</Text>}
        {!!(card.title || card.company) && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {card.title || card.company}
          </Text>
        )}
        <TouchableOpacity style={styles.flipBtn} onPress={() => flipTo(false)}>
          <Feather name="repeat" size={12} color={theme.accent} style={styles.flipBtnIcon} />
          <Text style={[styles.flipBtnText, { color: theme.accent }]}>Detail Card</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function TappableRow({
  icon,
  text,
  color,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress}>
      <Feather name={icon} size={14} color={color} style={styles.contactIcon} />
      <Text style={[styles.contactText, { color }]} numberOfLines={1}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { width: CARD_WIDTH, height: CARD_HEIGHT },
  face: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  back: { justifyContent: 'center' },
  avatarFallback: { width: 96, height: 96, borderRadius: 48, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 19, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 2 },
  contactList: { width: '100%', marginTop: 18, gap: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  contactIcon: { marginRight: 8 },
  contactText: { fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  socialIcon: {},
  qrWrap: { padding: 12, backgroundColor: '#fff', borderRadius: 12 },
  flipBtn: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  flipBtnIcon: { marginRight: 6 },
  flipBtnText: { fontSize: 12, fontWeight: '600' },
});
