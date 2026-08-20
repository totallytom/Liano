import React, { forwardRef } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../lib/ThemeContext';

export interface QRWidgetProps {
  /** Raw payload encoded into the QR — a vCard string or a share link. */
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

/**
 * Self-contained "widget" card: a QR code plus a name/title caption.
 * Wrapped in ViewShot so a parent can grab a ref and export it as a PNG
 * (used for sharing and for the embeddable web page). The QR modules
 * themselves always stay black-on-white so they keep scanning reliably,
 * regardless of the active theme.
 */
export const QRWidget = forwardRef<ViewShot, QRWidgetProps>(
  ({ value, size = 220, title, subtitle, style }, ref) => {
    const { theme } = useTheme();
    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }, style]}>
          <View style={styles.qrWrap}>
            <QRCode value={value || ' '} size={size} backgroundColor="#fff" color="#111" />
          </View>
          {!!title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </ViewShot>
    );
  }
);
QRWidget.displayName = 'QRWidget';

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  qrWrap: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
