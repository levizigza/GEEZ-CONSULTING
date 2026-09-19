/** Relative luminance and WCAG contrast (sRGB hex). */

function channel(hexSlice) {
  const v = parseInt(hexSlice, 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const n = hex.replace('#', '');
  if (n.length !== 6) throw new Error(`Expected #RRGGBB, got ${hex}`);
  const r = channel(n.slice(0, 2));
  const g = channel(n.slice(2, 4));
  const b = channel(n.slice(4, 6));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

export function meetsWcag(fg, bg, min) {
  return contrastRatio(fg, bg) + 1e-9 >= min;
}
