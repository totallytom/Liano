import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { hexToRgba } from '../lib/color';
import { BubbleShape, ThemePreset } from '../lib/types';

const BLOB_PATH =
  'M92,50 Q91.1,73.75 67,79.4 Q50,98.75 28,88.1 Q6.7,75 14,50 Q8.9,26.25 30,15.4 Q50,5 66,22.3 Q90.06,26.9 92,50 Z';
const HEXAGON_POINTS = '100,50 75,93.3 25,93.3 0,50 25,6.7 75,6.7';
const TRIANGLE_POINTS = '50,4 96,96 4,96';

export function ShapeSvg({ shape, size, color }: { shape: BubbleShape; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'circle' && <Circle cx={50} cy={50} r={50} fill={color} />}
      {shape === 'square' && <Rect x={0} y={0} width={100} height={100} rx={22} ry={22} fill={color} />}
      {shape === 'triangle' && <Polygon points={TRIANGLE_POINTS} fill={color} />}
      {shape === 'hexagon' && <Polygon points={HEXAGON_POINTS} fill={color} />}
      {shape === 'blob' && <Path d={BLOB_PATH} fill={color} />}
    </Svg>
  );
}

/** Soft, translucent decorative shapes tinted from the active theme's colors, shaped per theme.shape. */
export function BubbleBackground({ theme }: { theme: ThemePreset }) {
  const shape = theme.shape ?? 'circle';
  return (
    <View style={styles.layer} pointerEvents="none">
      <View style={[styles.bubble, styles.bubbleTop]}>
        <ShapeSvg shape={shape} size={260} color={hexToRgba(theme.accent, 0.16)} />
      </View>
      <View style={[styles.bubble, styles.bubbleMid]}>
        <ShapeSvg shape={shape} size={190} color={hexToRgba(theme.accent, 0.08)} />
      </View>
      <View style={[styles.bubble, styles.bubbleBottom]}>
        <ShapeSvg shape={shape} size={230} color={hexToRgba(theme.cardBackground, 0.5)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bubble: { position: 'absolute' },
  bubbleTop: { top: -90, right: -70 },
  bubbleMid: { top: 260, left: -80 },
  bubbleBottom: { bottom: -80, right: -50 },
});
