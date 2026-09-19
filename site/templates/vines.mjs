/**
 * Interactive gold vine SVG ornaments for burgundy/brown bands.
 * Stroke-draw via CSS when host receives .geez-motion--in (Intersection Observer).
 */

/**
 * Compact ornamental vine (viewBox 360×200) — paths use pathLength="1" for dash draw.
 * @param {'left' | 'right'} side
 * @param {'band' | 'header' | 'slim'} [size]
 */
export function renderVineSvg(side = 'left', size = 'band') {
  const flip = side === 'right' ? ' geez-vine--flip' : '';
  const sizeClass =
    size === 'header'
      ? ' geez-vine--header'
      : size === 'slim'
        ? ' geez-vine--slim'
        : '';
  return `<svg class="geez-vine geez-vine--${side}${flip}${sizeClass}" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path class="geez-vine__glow" pathLength="1" stroke-width="3.2" d="M18 182 C48 158, 62 128, 88 118 C118 106, 138 132, 168 124 C198 116, 208 84, 242 76 C274 68, 298 88, 328 52 C340 38, 348 28, 354 18"/>
    <path class="geez-vine__stem" pathLength="1" stroke-width="1.85" d="M18 182 C48 158, 62 128, 88 118 C118 106, 138 132, 168 124 C198 116, 208 84, 242 76 C274 68, 298 88, 328 52 C340 38, 348 28, 354 18"/>
    <path class="geez-vine__tendril" pathLength="1" stroke-width="1.35" d="M88 118 C78 98, 92 78, 108 86 C120 92, 118 108, 108 112"/>
    <path class="geez-vine__tendril" pathLength="1" stroke-width="1.35" d="M168 124 C162 104, 178 90, 190 98 C200 104, 196 118, 186 122"/>
    <path class="geez-vine__tendril" pathLength="1" stroke-width="1.35" d="M242 76 C236 58, 252 44, 264 52 C274 58, 270 70, 260 74"/>
    <path class="geez-vine__tendril" pathLength="1" stroke-width="1.35" d="M298 78 C312 70, 322 78, 318 90 C314 98, 304 96, 300 88"/>
    <path class="geez-vine__leaf" pathLength="1" stroke-width="1.2" d="M48 168 C58 160, 64 168, 58 176 C52 182, 46 176, 48 168Z"/>
    <path class="geez-vine__leaf" pathLength="1" stroke-width="1.2" d="M128 108 C138 100, 146 108, 140 116 C134 122, 126 116, 128 108Z"/>
    <path class="geez-vine__leaf" pathLength="1" stroke-width="1.2" d="M210 100 C220 92, 228 100, 222 108 C216 114, 208 108, 210 100Z"/>
    <path class="geez-vine__leaf" pathLength="1" stroke-width="1.2" d="M278 62 C288 54, 296 62, 290 70 C284 76, 276 70, 278 62Z"/>
  </g>
  <g class="geez-vine__nodes" fill="#c9a227">
    <circle cx="88" cy="118" r="2.1"/>
    <circle cx="168" cy="124" r="1.9"/>
    <circle cx="242" cy="76" r="1.9"/>
    <circle cx="328" cy="52" r="1.7"/>
  </g>
</svg>`;
}

/**
 * Left + right edge vines for a burgundy/brown host band.
 * @param {'band' | 'header' | 'slim'} [size]
 */
export function renderVinePair(size = 'band') {
  if (size === 'header') {
    return renderVineSvg('right', 'header');
  }
  return `${renderVineSvg('left', size)}${renderVineSvg('right', size)}`;
}
