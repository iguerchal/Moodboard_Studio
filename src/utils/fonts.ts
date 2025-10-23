export function ensureGoogleFont(family: string) {
  if (!family) return;
  const id = `mb-font-${family.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  // Use plus-separated family and keep ':' syntax for weights; avoid over-encoding '+'
  const qs = family.trim().replace(/\s+/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${qs}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function preloadFontsFromElements(elements: Array<{ fontFamily?: string }>) {
  const unique = Array.from(new Set(elements.map(e => e.fontFamily).filter(Boolean))) as string[];
  unique.forEach(ensureGoogleFont);
}


