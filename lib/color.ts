export function isValidHex(hex: string): boolean {
  return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(hex.trim());
}

export function hexToRgba(hex: string, alpha: number): string {
  if (!isValidHex(hex)) return `rgba(0, 0, 0, ${alpha})`;
  let c = hex.trim().replace('#', '');
  if (c.length === 3) {
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isLightColor(hex: string): boolean {
  if (!isValidHex(hex)) return true;
  let c = hex.trim().replace('#', '');
  if (c.length === 3) {
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
