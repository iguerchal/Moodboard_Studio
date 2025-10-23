import type { CanvasElementData } from "../components/CanvasElement";

export type LayoutEngine = "grid" | "masonry" | "circle" | "editorial" | "stack";

const CLAMP = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function arrangeElements(
  elements: CanvasElementData[],
  layout: LayoutEngine = "grid",
): CanvasElementData[] {
  const items = elements.map((e) => ({ ...e }));
  const gap = 32;
  const startX = 80;
  const startY = 80;

  if (layout === "grid") {
    const cols = 3;
    items.forEach((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      el.x = startX + col * (240 + gap);
      el.y = startY + row * (240 + gap);
    });
  } else if (layout === "masonry") {
    const cols = 3;
    const colHeights = new Array(cols).fill(startY);
    items.forEach((el, i) => {
      const col = i % cols;
      el.x = startX + col * (240 + gap);
      el.y = colHeights[col];
      const h = el.type === "image" ? 260 : el.type === "text" ? 180 : 200;
      colHeights[col] += h + gap;
    });
  } else if (layout === "circle") {
    const cx = startX + 320;
    const cy = startY + 280;
    const radius = 260;
    const n = Math.max(1, items.length);
    items.forEach((el, i) => {
      const t = (i / n) * Math.PI * 2;
      el.x = Math.round(cx + radius * Math.cos(t) - 120);
      el.y = Math.round(cy + radius * Math.sin(t) - 120);
    });
  } else if (layout === "editorial") {
    // Hero image/text + two secondary + accent blocks
    items.forEach((el, i) => {
      if (i === 0) {
        el.x = startX;
        el.y = startY;
      } else if (i === 1) {
        el.x = startX + 300 + gap;
        el.y = startY;
      } else if (i === 2) {
        el.x = startX + 300 + gap;
        el.y = startY + 220 + gap;
      } else if (i === 3) {
        el.x = startX;
        el.y = startY + 300 + gap * 2;
      } else {
        const row = Math.floor((i - 4) / 3);
        const col = (i - 4) % 3;
        el.x = startX + col * (220 + gap);
        el.y = startY + 520 + row * (220 + gap);
      }
    });
  } else if (layout === "stack") {
    // Superposition centrée : centre géométrique de chaque élément au centre du canvas approximatif
    // On estime la taille par type pour compenser correctement
    const centerX = startX + 560; // centre approximatif de la zone de travail
    const centerY = startY + 420;
    const approximateSize = (el: CanvasElementData): number => {
      if (el.type === 'image') return Math.max(64, Math.min(640, el.fontSize ?? 256));
      if (el.type === 'color') return Math.max(64, Math.min(640, el.fontSize ?? 128));
      if (el.type === 'shape') return 96; // ~ w-24 h-24
      // text: boîte estimée
      return Math.max(160, Math.min(480, el.fontSize ?? 240));
    };
    items.forEach((el, i) => {
      const size = approximateSize(el);
      const jitterX = ((i % 3) - 1) * 8; // légers offsets
      const jitterY = ((i % 2) - 0.5) * 8;
      el.x = Math.round(centerX - size / 2 + jitterX);
      el.y = Math.round(centerY - size / 2 + jitterY);
      el.zIndex = 10 + i; // au-dessus, croissant
    });
  }

  // Keep within a reasonable positive bound
  items.forEach((el) => {
    el.x = CLAMP(el.x, 16, 1600);
    el.y = CLAMP(el.y, 16, 1600);
  });

  return items;
}


