import { useState } from "react";
import { motion } from "motion/react";
import { X, Lock, Unlock, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ColorHarmonyToolProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (colors: string[]) => void;
  baseColor?: string;
}

type HarmonyMode = "complementary" | "split" | "triadic" | "analogous" | "tetradic";

const harmonyModes = [
  { id: "complementary", name: "Complementary", description: "Opposite on color wheel" },
  { id: "split", name: "Split Complementary", description: "Base + two adjacent opposites" },
  { id: "triadic", name: "Triadic", description: "Three evenly spaced" },
  { id: "analogous", name: "Analogous", description: "Adjacent colors" },
  { id: "tetradic", name: "Tetradic", description: "Four colors (two pairs)" },
];

function hexToHSL(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateHarmony(baseColor: string, mode: HarmonyMode): string[] {
  const [h, s, l] = hexToHSL(baseColor);

  switch (mode) {
    case "complementary":
      return [baseColor, hslToHex((h + 180) % 360, s, l)];
    case "split":
      return [
        baseColor,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    case "triadic":
      return [
        baseColor,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ];
    case "analogous":
      return [
        hslToHex((h - 30) % 360, s, l),
        baseColor,
        hslToHex((h + 30) % 360, s, l),
      ];
    case "tetradic":
      return [
        baseColor,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ];
    default:
      return [baseColor];
  }
}

export function ColorHarmonyTool({
  isOpen,
  onClose,
  onApply,
  baseColor = "#6366F1",
}: ColorHarmonyToolProps) {
  const [selectedMode, setSelectedMode] = useState<HarmonyMode>("complementary");
  const [heroColor, setHeroColor] = useState(baseColor);
  const [isLocked, setIsLocked] = useState(false);

  const harmonyColors = generateHarmony(heroColor, selectedMode);

  const handleRandomize = () => {
    if (!isLocked) {
      const randomHue = Math.floor(Math.random() * 360);
      setHeroColor(hslToHex(randomHue, 70, 55));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[101]"
      >
        <div className="mx-4 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-purple-500/5">
            <div>
              <h3>Color Harmony Generator</h3>
              <p className="text-muted-foreground">Create harmonious color palettes</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close color harmony tool">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Hero Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label>Base Color</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsLocked(!isLocked)}
                    className={isLocked ? "text-primary" : ""}
                    aria-pressed={isLocked}
                    aria-label={isLocked ? "Unlock base color" : "Lock base color"}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRandomize} aria-label="Randomize base color">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={heroColor}
                  onChange={(e) => !isLocked && setHeroColor(e.target.value)}
                  className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
                  disabled={isLocked}
                />
                <input
                  type="text"
                  value={heroColor}
                  onChange={(e) => !isLocked && setHeroColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-muted rounded-lg border border-border"
                  disabled={isLocked}
                />
              </div>
            </div>

            {/* Harmony Modes */}
            <div className="space-y-3">
              <label>Harmony Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {harmonyModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as HarmonyMode)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMode === mode.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="mb-1">{mode.name}</p>
                    <p className="text-muted-foreground">{mode.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generated Palette */}
            <div className="space-y-3">
              <label>Generated Palette</label>
              <div className="flex gap-2">
                {harmonyColors.map((color, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex-1 space-y-2"
                  >
                    <div
                      className="w-full h-24 rounded-lg shadow-md"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-center text-muted-foreground">{color}</p>
                    {idx === 0 && <Badge className="w-full justify-center">Base</Badge>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(harmonyColors);
                onClose();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Apply Palette
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
